const puppeteer = require('puppeteer-core');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle'],
  });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('LOG:', m.text()));
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));

  console.log('Navigating to /rooms/201...');
  await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' });
  console.log('Title:', await page.title());
  const h1 = await page.$eval('h1', (el) => el.textContent).catch(() => 'no h1');
  console.log('H1:', h1);

  console.log('Navigating to /rooms/201?calibrate=true...');
  await page.goto('http://127.0.0.1:5173/rooms/201?calibrate=true', { waitUntil: 'networkidle2' });
  console.log('Title:', await page.title());
  const h1Cal = await page.$eval('h1', (el) => el.textContent).catch(() => 'no h1');
  console.log('H1 (?calibrate):', h1Cal);

  await browser.close();
}

test().catch(console.error);
