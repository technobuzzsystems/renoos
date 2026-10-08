const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function measureRoom(roomNumber, spaceId) {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(`http://127.0.0.1:5173/rooms/${roomNumber}?calibrate=true`, { waitUntil: 'networkidle2' });
  await sleep(600);

  // Scroll to exploration section
  await page.$eval('#space-exploration-section', (el) => el.scrollIntoView()).catch(() => {});
  await sleep(300);

  // Select space tab
  const tab = await page.$(`#space-tab-${spaceId}`);
  if (tab) {
    await tab.click();
    await sleep(500);
  }

  // Activate 360 tour
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null;
  });
  if (tourBtn && tourBtn.asElement()) {
    await tourBtn.asElement().click();
    await sleep(1500);
  }

  const outDir = path.resolve(`tests/room-${roomNumber}-${spaceId}-calibration`);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Sweep 360 degrees every 30 degrees (12 angles)
  for (let yaw = -180; yaw < 180; yaw += 30) {
    await page.evaluate((y) => {
      if (window.setCameraAim) window.setCameraAim(y, 0, 75);
    }, yaw);
    await sleep(300);
    await page.screenshot({ path: path.join(outDir, `yaw_${yaw}.png`) });
  }

  await browser.close();
}

async function runAll() {
  const targets = [
    { room: '201', space: 'bedroom' },
    { room: '201', space: 'kitchen' },
    { room: '201', space: 'washroom' },
    { room: '202', space: 'bedroom' },
    { room: '202', space: 'kitchen' },
    { room: '202', space: 'washroom' },
    { room: '203', space: 'bedroom' },
    { room: '203', space: 'kitchen' },
    { room: '203', space: 'washroom' },
  ];

  for (const t of targets) {
    console.log(`Calibrating Room ${t.room} ${t.space}...`);
    await measureRoom(t.room, t.space);
  }
}

runAll().catch(console.error);
