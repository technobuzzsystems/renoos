import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const OUT_DIR = path.resolve('tests/screenshots-hotspot-audit/verification')
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function pxToYawPitch(x, y, w = 2912, h = 1440) {
  let yaw = (x / w) * 360
  if (yaw > 180) yaw -= 360
  const pitch = (0.5 - y / h) * 180
  return { yaw: Math.round(yaw), pitch: Math.round(pitch) }
}

export const CANDIDATE_COORDINATES = {
  '201-bedroom': [
    { id: 'hs-201-bed', x: 1456, y: 880, desc: 'Bed platform and headboard' },
    { id: 'hs-201-window', x: 980, y: 720, desc: 'Balcony glass doors & mountain view' },
    { id: 'hs-201-bed-to-washroom', x: 230, y: 740, desc: 'Doorway into washroom' },
    { id: 'hs-201-bed-to-kitchen', x: 2780, y: 740, desc: 'Doorway towards kitchen' },
  ],
  '201-kitchen': [
    { id: 'hs-201-kitch-to-bedroom', x: 2510, y: 740, desc: 'Doorway returning to bedroom' },
    { id: 'hs-201-kitch-to-washroom', x: 70, y: 740, desc: 'Foyer corridor towards washroom' },
    { id: 'hs-201-bar', x: 2180, y: 850, desc: 'Wooden breakfast bar & cane chairs' },
    { id: 'hs-201-tap', x: 1600, y: 650, desc: 'Water purifier & sink tap' },
  ],
  '201-washroom': [
    { id: 'hs-201-wash-to-bedroom', x: 2880, y: 740, desc: 'Doorway back to bedroom' },
    { id: 'hs-201-wash-to-kitchen', x: 80, y: 740, desc: 'Corridor exit towards kitchen' },
    { id: 'hs-201-shower', x: 1400, y: 600, desc: 'Walk-in rainfall shower stall' },
    { id: 'hs-201-vanity', x: 500, y: 750, desc: 'Designer ceramic vanity & illuminated mirror' },
  ],
  '202-bedroom': [
    { id: 'hs-202-art', x: 2320, y: 620, desc: 'Abstract art gallery wall' },
    { id: 'hs-202-terrace-door', x: 490, y: 720, desc: 'Glazed terrace balcony portal' },
    { id: 'hs-202-bed-to-kitchen', x: 2840, y: 720, desc: 'Doorway/corridor towards kitchen' },
    { id: 'hs-202-bed-to-washroom', x: 2900, y: 720, desc: 'Doorway/corridor towards washroom' },
  ],
  '202-kitchen': [
    { id: 'hs-202-kitch-to-bedroom', x: 2580, y: 720, desc: 'Hallway back to bedroom' },
    { id: 'hs-202-kitch-to-washroom', x: 2860, y: 720, desc: 'Doorway towards washroom' },
    { id: 'hs-202-cooktop', x: 2150, y: 780, desc: 'Gaggenau induction cooktop & prep station' },
  ],
  '202-washroom': [
    { id: 'hs-202-wash-to-bedroom', x: 1830, y: 720, desc: 'Dark wood door to bedroom' },
    { id: 'hs-202-wash-to-kitchen', x: 1880, y: 720, desc: 'Dark wood door towards kitchen' },
    { id: 'hs-202-shower', x: 2480, y: 550, desc: 'Overhead rainfall shower & caddy' },
  ],
  '203-bedroom': [
    { id: 'hs-203-bed-to-washroom', x: 490, y: 720, desc: 'Doorway into washroom' },
    { id: 'hs-203-bed-to-kitchen', x: 2680, y: 720, desc: 'Garden terrace doors to pool & kitchen pavilion' },
    { id: 'hs-203-dressing', x: 1920, y: 750, desc: 'Rustic branch wardrobe & dressing suite' },
    { id: 'hs-203-bed', x: 1480, y: 880, desc: 'Presidential king bed & live-edge bench' },
  ],
  '203-kitchen': [
    { id: 'hs-203-kitch-to-bedroom', x: 460, y: 720, desc: 'Pavilion entrance back to bedroom' },
    { id: 'hs-203-kitch-to-washroom', x: 2350, y: 720, desc: 'Pavilion entrance to washroom' },
    { id: 'hs-203-pool', x: 1456, y: 880, desc: 'Private courtyard swimming pool & sun loungers' },
  ],
  '203-washroom': [
    { id: 'hs-203-wash-to-bedroom', x: 50, y: 720, desc: 'Entryway back to bedroom' },
    { id: 'hs-203-wash-to-kitchen', x: 2870, y: 720, desc: 'Passageway to kitchen pavilion' },
    { id: 'hs-203-tub', x: 780, y: 850, desc: 'Freestanding oval soaking tub & black tap' },
    { id: 'hs-203-window', x: 1420, y: 700, desc: 'Panoramic rainforest picture window & waterfall' },
  ],
}

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

  for (const [key, items] of Object.entries(CANDIDATE_COORDINATES)) {
    const [room, space] = key.split('-')
    console.log(`\nCapturing verification shots for Room ${room} ${space}...`)

    await page.goto(`http://127.0.0.1:5173/rooms/${room}?calibrate=true`, { waitUntil: 'networkidle2' })
    await sleep(600)

    await page.$eval('#space-exploration-section', (el) => el.scrollIntoView()).catch(() => {})
    await sleep(300)

    const tab = await page.$(`#space-tab-${space}`)
    if (tab) {
      await tab.click()
      await sleep(400)
    }

    const tourBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null
    })
    if (tourBtn && tourBtn.asElement()) {
      await tourBtn.asElement().click()
      await sleep(1200)
    }

    for (const item of items) {
      const { yaw, pitch } = pxToYawPitch(item.x, item.y)
      await page.evaluate((y, p) => {
        if (window.setCameraAim) window.setCameraAim(y, p, 70)
      }, yaw, pitch)
      await sleep(400)

      const filename = `verify-${room}-${space}-${item.id}.png`
      await page.screenshot({ path: path.join(OUT_DIR, filename) })
      console.log(`  Saved ${filename} (yaw: ${yaw}°, pitch: ${pitch}°) -> ${item.desc}`)
    }
  }

  await browser.close()
  console.log('\nAll candidate verification screenshots captured successfully!')
}

run().catch(console.error)
