const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testScrollCapture() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/rooms/201?calibrate=true', { waitUntil: 'networkidle2' });
  await sleep(600);

  // Scroll to exploration section
  await page.$eval('#space-exploration-section', (el) => el.scrollIntoView());
  await sleep(300);

  // Click 360 tour button via puppeteer element handle
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null;
  });

  if (tourBtn && tourBtn.asElement()) {
    await tourBtn.asElement().click();
    await sleep(1500);
  }

  // Confirm canvas
  const canvas = await page.$('canvas');
  console.log('Canvas present:', Boolean(canvas));

  await page.screenshot({ path: 'tests/test-201-scrolled.png' });
  console.log('Screenshot saved: tests/test-201-scrolled.png');

  await browser.close();
}

testScrollCapture().catch(console.error);
