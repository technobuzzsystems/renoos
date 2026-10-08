import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('tests/screenshots-hotspot-audit')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const hotspotsData = JSON.parse(fs.readFileSync('tests/current-hotspots.json', 'utf8'))

const ROOM_SPACES = [
  { room: '201', space: 'bedroom' },
  { room: '201', space: 'kitchen' },
  { room: '201', space: 'washroom' },
  { room: '202', space: 'bedroom' },
  { room: '202', space: 'kitchen' },
  { room: '202', space: 'washroom' },
  { room: '203', space: 'bedroom' },
  { room: '203', space: 'kitchen' },
  { room: '203', space: 'washroom' },
]

async function runAudit() {
  console.log('========================================================')
  console.log('  STARTING VISUAL HOTSPOT AUDIT ACROSS ALL 9 PANORAMAS')
  console.log('========================================================\n')

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

  for (const { room, space } of ROOM_SPACES) {
    console.log(`\n>>> Auditing Room ${room} - ${space.toUpperCase()} <<<`)
    await page.goto(`http://127.0.0.1:5173/rooms/${room}?calibrate=true`, { waitUntil: 'networkidle2' })
    await sleep(600)

    // Scroll into exploration section
    await page.$eval('#space-exploration-section', (el) => el.scrollIntoView()).catch(() => {})
    await sleep(300)

    // Select space
    const tab = await page.$(`#space-tab-${space}`)
    if (tab) {
      await tab.click()
      await sleep(500)
    }

    // Activate 360 mode
    const tourBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null
    })
    if (tourBtn && tourBtn.asElement()) {
      await tourBtn.asElement().click()
      await sleep(1500)
    }

    // Find all hotspots belonging to this room and space
    const spaceHotspots = hotspotsData.filter((h) => {
      const matchRoom = h.id.includes(`-${room}-`)
      return matchRoom && h.space === space
    })

    console.log(`Found ${spaceHotspots.length} hotspots for Room ${room} ${space}:`)

    // Capture 360 overview at 4 cardinal directions (yaw = 0, 90, 180, 270)
    for (const yaw of [0, 90, 180, 270]) {
      await page.evaluate((y) => {
        if (window.setCameraAim) window.setCameraAim(y, 0, 75)
      }, yaw)
      await sleep(400)
      await page.screenshot({
        path: path.join(OUT_DIR, `overview-room-${room}-${space}-yaw${yaw}.png`),
      })
    }

    // Now inspect each hotspot individually by aiming directly at it
    for (const hs of spaceHotspots) {
      console.log(`  Aiming at hotspot: [${hs.id}] "${hs.title}" (yaw: ${hs.yaw}°, pitch: ${hs.pitch}°)...`)
      await page.evaluate((y, p) => {
        if (window.setCameraAim) window.setCameraAim(y, p, 70)
      }, hs.yaw, hs.pitch)
      await sleep(500)

      const screenshotName = `audit-${room}-${space}-${hs.id}.png`
      await page.screenshot({
        path: path.join(OUT_DIR, screenshotName),
      })
      console.log(`  Saved screenshot: ${screenshotName}`)
    }
  }

  await browser.close()
  console.log('\n========================================================')
  console.log('  ALL PANORAMA OVERVIEWS & HOTSPOT AUDIT SCREENSHOTS SAVED')
  console.log('========================================================\n')
}

runAudit().catch(console.error)
