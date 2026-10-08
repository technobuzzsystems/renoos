const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function captureMobileShowcase() {
  const outputDir = path.join(__dirname, '../test-screenshots/mobile-showcase');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const baseUrl = 'http://127.0.0.1:5174';

  console.log('--- 1. Testing Mobile 375x812 (iPhone standard) ---');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '01-mobile-home-hero-375.png') });
  console.log('Captured 01-mobile-home-hero-375.png');

  // Test Mobile Navigation Drawer
  const menuBtn = await page.$('button[aria-label="Open Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(outputDir, '02-mobile-drawer-open-375.png') });
    console.log('Captured 02-mobile-drawer-open-375.png');

    // Close menu
    const closeBtn = await page.$('button[aria-label="Close Menu"]');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Scroll to Book Rooms Section
  await page.evaluate(() => {
    const el = document.getElementById('book-rooms');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, '03-mobile-bookrooms-section-375.png') });
  console.log('Captured 03-mobile-bookrooms-section-375.png');

  // Click on Room 202 to see room selection and scroll to preview
  const roomCards = await page.$$('div[role="button"]');
  if (roomCards.length > 1) {
    await roomCards[1].click(); // Room 202
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, '04-mobile-room-202-selected-375.png') });
    console.log('Captured 04-mobile-room-202-selected-375.png');
  }

  // Click "Proceed to Reserve Room" to test Booking Modal on mobile
  const reserveBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('Proceed to Reserve'));
  });
  if (reserveBtn && reserveBtn.asElement()) {
    await reserveBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, '05-mobile-booking-modal-375.png') });
    console.log('Captured 05-mobile-booking-modal-375.png');

    // Close modal
    const modalClose = await page.$('button[aria-label="Close modal"]');
    if (modalClose) await modalClose.click();
    await new Promise(r => setTimeout(r, 500));
  }

  // Test Rooms Page at 375px
  await page.goto(`${baseUrl}/rooms`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '06-mobile-rooms-page-375.png') });
  console.log('Captured 06-mobile-rooms-page-375.png');

  // Scroll to comparison matrix
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight * 0.7);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outputDir, '07-mobile-rooms-matrix-375.png') });
  console.log('Captured 07-mobile-rooms-matrix-375.png');

  // Test Room Details Page (Room 201) at 375px
  await page.goto(`${baseUrl}/rooms/201`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(outputDir, '08-mobile-room-201-details-375.png') });
  console.log('Captured 08-mobile-room-201-details-375.png');

  // Scroll to Space Selector on Room 201
  await page.evaluate(() => {
    const el = document.getElementById('space-exploration-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '09-mobile-room-201-spaces-375.png') });
  console.log('Captured 09-mobile-room-201-spaces-375.png');

  // Test Ultra Compact 320x640 Viewport
  console.log('--- 2. Testing Ultra-Compact 320x640 ---');
  await page.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, '10-compact-320-home.png') });
  console.log('Captured 10-compact-320-home.png');

  // Test Tablet 768x1024 Viewport
  console.log('--- 3. Testing Tablet 768x1024 (iPad) ---');
  await page.setViewport({ width: 768, height: 1024, isMobile: false });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));
  await page.evaluate(() => {
    const el = document.getElementById('book-rooms');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(outputDir, '11-tablet-768-bookrooms.png') });
  console.log('Captured 11-tablet-768-bookrooms.png');

  // Tablet Room 201
  await page.goto(`${baseUrl}/rooms/201`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const el = document.getElementById('space-exploration-section');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(outputDir, '12-tablet-768-room201-spaces.png') });
  console.log('Captured 12-tablet-768-room201-spaces.png');

  await browser.close();
  console.log('✅ All mobile showcase screenshots captured successfully!');
}

captureMobileShowcase().catch((err) => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
