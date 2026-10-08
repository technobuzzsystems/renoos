const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function testSplit360Preview() {
  const outputDir = path.join(__dirname, '../test-screenshots/360-split-test');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const baseUrl = 'http://127.0.0.1:5174';

  console.log('--- 1. Navigating to Home Page and scrolling to Book Rooms ---');
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const el = document.getElementById('book-rooms');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  // Wait for 360 panorama texture to render
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(outputDir, '01-desktop-room201-360-active.png') });
  console.log('Captured 01-desktop-room201-360-active.png (Room 201 360 View on right)');

  // Drag in 360 viewer to verify interactive rotation
  const canvas = await page.$('canvas');
  if (canvas) {
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2 - 200, box.y + box.height / 2, { steps: 10 });
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 600));
      await page.screenshot({ path: path.join(outputDir, '02-desktop-room201-360-dragged.png') });
      console.log('Captured 02-desktop-room201-360-dragged.png');
    }
  }

  // Click on Room 202 on the left side
  console.log('--- 2. Clicking Room 202 (Premium Room) on the left side ---');
  const roomCards = await page.$$('div[role="button"]');
  if (roomCards.length > 1) {
    await roomCards[1].click(); // Room 202
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outputDir, '03-desktop-room202-360-active.png') });
    console.log('Captured 03-desktop-room202-360-active.png (Room 202 360 View on right)');
  }

  // Click on Room 203 on the left side
  console.log('--- 3. Clicking Room 203 (Executive Suite) on the left side ---');
  if (roomCards.length > 2) {
    await roomCards[2].click(); // Room 203
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(outputDir, '04-desktop-room203-360-active.png') });
    console.log('Captured 04-desktop-room203-360-active.png (Room 203 360 View on right)');
  }

  // Test toggling to Photos preview mode
  console.log('--- 4. Toggling to Photo Preview mode ---');
  const photoBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('Photos'));
  });
  if (photoBtn && photoBtn.asElement()) {
    await photoBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outputDir, '05-desktop-room203-photo-preview.png') });
    console.log('Captured 05-desktop-room203-photo-preview.png');
  }

  // Click back to 360 Tour
  console.log('--- 5. Toggling back to 360° Tour ---');
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find(b => b.textContent && b.textContent.includes('360° Tour'));
  });
  if (tourBtn && tourBtn.asElement()) {
    await tourBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(outputDir, '06-desktop-room203-360-restored.png') });
    console.log('Captured 06-desktop-room203-360-restored.png');
  }

  // Test Mobile Viewport (375x812)
  console.log('--- 6. Testing Mobile Viewport (375x812) ---');
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    const el = document.getElementById('book-rooms');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(outputDir, '07-mobile-room-selection-375.png') });
  console.log('Captured 07-mobile-room-selection-375.png');

  // Click Room 201 to see auto-scroll to 360 preview on mobile
  const mobileRoomCards = await page.$$('div[role="button"]');
  if (mobileRoomCards.length > 0) {
    await mobileRoomCards[0].click();
    await new Promise(r => setTimeout(r, 1800));
    await page.screenshot({ path: path.join(outputDir, '08-mobile-360-preview-375.png') });
    console.log('Captured 08-mobile-360-preview-375.png');
  }

  await browser.close();
  console.log('✅ All 360 split preview tests completed successfully!');
}

testSplit360Preview().catch((err) => {
  console.error('Error in 360 preview test script:', err);
  process.exit(1);
});

