import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('tests/screenshots-hotspot-audit/verification')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const testPoints = [
  { name: 'r201-bed-aim', yaw: 180, pitch: -20 },
  { name: 'r201-window-aim', yaw: 121, pitch: 0 },
  { name: 'r201-washroom-door-aim', yaw: 28, pitch: -2 },
  { name: 'r201-kitchen-entrance-aim', yaw: -16, pitch: -2 },
  { name: 'r201-breakfast-table-aim', yaw: 58, pitch: -16 },
]

async function run() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--window-size=1440,900',
    ],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  await page.goto('http://127.0.0.1:5173/rooms/201?calibrate=true', { waitUntil: 'networkidle2' })
  await sleep(600)

  // Scroll into view
  await page.$eval('#space-exploration-section', (el) => el.scrollIntoView()).catch(() => {})
  await sleep(300)

  // Select bedroom
  const tab = await page.$('#space-tab-bedroom')
  if (tab) await tab.click()
  await sleep(400)

  // Activate 360 mode
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null
  })
  if (tourBtn && tourBtn.asElement()) {
    await tourBtn.asElement().click()
    await sleep(1200)
  }

  for (const pt of testPoints) {
    await page.evaluate((y, p) => {
      if (window.setCameraAim) window.setCameraAim(y, p, 70)
    }, pt.yaw, pt.pitch)
    await sleep(400)
    await page.screenshot({
      path: path.join(OUT_DIR, `${pt.name}.png`),
    })
    console.log(`Saved: ${pt.name}.png at yaw=${pt.yaw}, pitch=${pt.pitch}`)
  }

  await browser.close()
}

run().catch(console.error)
