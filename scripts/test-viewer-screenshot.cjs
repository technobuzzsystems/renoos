const puppeteer = require('puppeteer-core');

async function testViewerScreenshot() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/rooms/201?calibrate=true', { waitUntil: 'networkidle2' });

  // Scroll to exploration section
  await page.$eval('#space-exploration-section', (el) => el.scrollIntoView());

  // Click 360 tour button
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null;
  });
  if (tourBtn && tourBtn.asElement()) {
    await tourBtn.asElement().click();
  }
  await new Promise((r) => setTimeout(r, 1200));

  const viewer = await page.$('[role="region"]');
  if (viewer) {
    await viewer.screenshot({ path: 'tests/test-viewer-201-bedroom.png' });
    console.log('Saved test-viewer-201-bedroom.png');
  } else {
    console.log('Viewer not found');
  }

  await browser.close();
}

testViewerScreenshot().catch(console.error);
