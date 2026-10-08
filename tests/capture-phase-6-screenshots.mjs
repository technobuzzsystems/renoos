import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('tests/screenshots-phase-6');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // 1. Desktop Homepage Hero & Flow
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-home-hero.png') });

  // Scroll to virtual tour teaser
  const vtEl = await page.$('#virtual-tour');
  if (vtEl) {
    await vtEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-home-virtual-tour-teaser.png') });
  }

  // Scroll to 3d preview teaser
  const preview3dEl = await page.$('#preview-3d');
  if (preview3dEl) {
    await preview3dEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-home-3d-preview.png') });
  }

  // 2. Room 203 Details Page
  await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-room203-hero.png') });

  // Scroll to Space Viewer & Space Selector
  const viewerEl = await page.$('#space-exploration-section');
  if (viewerEl) {
    await viewerEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-room203-space-viewer.png') });
  }

  // 3. Mobile Viewport
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-mobile-home-hero.png') });

  // Open mobile drawer
  const mobileBtn = await page.$('button[aria-label*="Navigation Menu" i]');
  if (mobileBtn) {
    await mobileBtn.click();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-mobile-drawer.png') });
  }

  await browser.close();
  console.log('Screenshots captured successfully in tests/screenshots-phase-6/');
}

captureScreenshots();
