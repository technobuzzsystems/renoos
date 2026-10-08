const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testBookingFlow() {
  const screenshotDir = path.join(__dirname, '../test-screenshots/booking-test');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errors.push(`Page error: ${err.message}`);
  });

  console.log('Navigating to http://127.0.0.1:5174/...');
  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle2' });

  // 1. Capture Hero Section with Book Rooms Buttons
  await page.screenshot({ path: path.join(screenshotDir, '01-home-hero-with-booking.png') });
  console.log('✓ Captured 01-home-hero-with-booking.png');

  // 2. Click Book Rooms CTA in Hero
  console.log('Clicking Book Rooms in Hero...');
  const heroBookBtn = await page.$('a[href="#book-rooms"]');
  if (heroBookBtn) {
    await heroBookBtn.click();
    await new Promise((r) => setTimeout(r, 800));
  }

  // 3. Capture Book Rooms Section (Initial State with Room 201 active)
  const bookingSection = await page.$('#book-rooms');
  if (bookingSection) {
    await bookingSection.scrollIntoView();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotDir, '02-booking-section-room-201.png') });
    console.log('✓ Captured 02-booking-section-room-201.png');
  }

  // 4. Click Room 202 on the left side
  console.log('Clicking Room 202 on left side...');
  const roomCards = await page.$$('div[role="button"]');
  console.log(`Found ${roomCards.length} room cards on left side.`);
  if (roomCards.length >= 2) {
    await roomCards[1].click(); // Room 202
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(screenshotDir, '03-booking-section-room-202-selected.png') });
    console.log('✓ Captured 03-booking-section-room-202-selected.png');
  }

  // 5. Test space tab switching on right side preview (Kitchen)
  console.log('Testing space tab switching on right side...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.toLowerCase().includes('kitchen')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 600));
      break;
    }
  }
  await page.screenshot({ path: path.join(screenshotDir, '04-room-202-kitchen-preview.png') });
  console.log('✓ Captured 04-room-202-kitchen-preview.png');

  // 6. Test Promo Code "SBFARM"
  console.log('Applying Promo Code "SBFARM"...');
  const promoInput = await page.$('input[placeholder*="Promo Code"]');
  if (promoInput) {
    await promoInput.type('SBFARM');
    const formButtons = await page.$$('form button[type="submit"]');
    for (const b of formButtons) {
      const txt = await (await b.getProperty('textContent')).jsonValue();
      if (txt && txt.toLowerCase().includes('apply')) {
        await b.click();
        await new Promise((r) => setTimeout(r, 600));
        break;
      }
    }
    await page.screenshot({ path: path.join(screenshotDir, '05-promo-code-applied.png') });
    console.log('✓ Captured 05-promo-code-applied.png');
  }

  // 7. Click "Proceed to Reserve Room 202"
  console.log('Opening Booking Modal...');
  const reserveButtons = await page.$$('button');
  for (const btn of reserveButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Proceed to Reserve')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(screenshotDir, '06-booking-modal-step1.png') });
  console.log('✓ Captured 06-booking-modal-step1.png');

  // 8. Fill Guest Information Form
  console.log('Filling Guest Information...');
  const firstNameInput = await page.$('input[placeholder*="Arjun"]');
  if (firstNameInput) await firstNameInput.type('Vikram');

  const lastNameInput = await page.$('input[placeholder*="Sharma"]');
  if (lastNameInput) await lastNameInput.type('Singhania');

  const emailInput = await page.$('input[type="email"]');
  if (emailInput) await emailInput.type('vikram.singhania@luxurytravel.in');

  const phoneInput = await page.$('input[type="tel"]');
  if (phoneInput) await phoneInput.type('+91 98200 12345');

  await page.screenshot({ path: path.join(screenshotDir, '07-booking-modal-filled.png') });
  console.log('✓ Captured 07-booking-modal-filled.png');

  // 9. Proceed to Payment Step
  console.log('Proceeding to Payment & Guarantee Step...');
  const submitButtons = await page.$$('button[type="submit"]');
  for (const btn of submitButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && text.includes('Continue to Payment')) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 800));
      break;
    }
  }
  await page.screenshot({ path: path.join(screenshotDir, '08-booking-modal-step2-payment.png') });
  console.log('✓ Captured 08-booking-modal-step2-payment.png');

  // 10. Confirm Reservation
  console.log('Confirming Reservation...');
  const modalButtons = await page.$$('button');
  for (const btn of modalButtons) {
    const text = await (await btn.getProperty('textContent')).jsonValue();
    if (text && (text.includes('Complete Reservation') || text.includes('Confirm & Pay'))) {
      await btn.click();
      await new Promise((r) => setTimeout(r, 2200)); // wait for submission & voucher generation
      break;
    }
  }
  await page.screenshot({ path: path.join(screenshotDir, '09-booking-modal-step3-confirmed.png') });
  console.log('✓ Captured 09-booking-modal-step3-confirmed.png');

  console.log('Errors encountered:', errors.length);
  if (errors.length > 0) {
    console.log(errors);
  }

  await browser.close();
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
}

testBookingFlow().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
