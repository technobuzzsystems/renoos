const puppeteer = require('puppeteer-core');
const path = require('path');

async function testMobile() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5174/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, '../test-screenshots/booking-test/10-mobile-hero-booking.png') });

  const el = await page.$('#book-rooms');
  if (el) {
    await el.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(__dirname, '../test-screenshots/booking-test/11-mobile-booking-section.png') });
  }

  // Open mobile drawer to test "Book Rooms" in mobile menu
  const menuBtn = await page.$('button[aria-label="Open Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(__dirname, '../test-screenshots/booking-test/12-mobile-drawer-booking.png') });
  }

  await browser.close();
  console.log('Mobile screenshots captured successfully!');
}

testMobile().catch(console.error);

