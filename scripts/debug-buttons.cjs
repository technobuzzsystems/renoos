const puppeteer = require('puppeteer-core');

async function debugButtons() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' });

  const btnTexts = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map((b) => b.textContent.trim());
  });
  console.log('Buttons on page:', btnTexts);

  // Click the 360 button
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null;
  });
  console.log('Found tourBtn:', Boolean(tourBtn.asElement()));
  if (tourBtn.asElement()) {
    await tourBtn.asElement().click();
    await new Promise((r) => setTimeout(r, 1500));
  }

  const canvas = await page.$('canvas');
  console.log('Canvas present:', Boolean(canvas));

  const region = await page.$('[role="region"]');
  console.log('Region present:', Boolean(region));

  await page.screenshot({ path: 'tests/debug-201.png' });
  console.log('Saved tests/debug-201.png');

  await browser.close();
}

debugButtons().catch(console.error);
