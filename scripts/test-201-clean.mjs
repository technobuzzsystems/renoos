import puppeteer from 'puppeteer-core'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

  page.on('console', (m) => console.log('LOG:', m.text()))
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message))

  console.log('Navigating to Room 201...')
  await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' })
  await sleep(800)

  // Activate 360 tour exactly as in acceptance-phase-3.mjs
  const tourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('button'))
    return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null
  })

  if (tourBtn && tourBtn.asElement()) {
    console.log('Clicking tour button...')
    await tourBtn.asElement().click()
    await sleep(1500)
  }

  const canvas = await page.$('canvas')
  console.log('Canvas present:', Boolean(canvas))

  await page.screenshot({ path: 'tests/test-201-clean.png' })
  console.log('Saved tests/test-201-clean.png')

  await browser.close()
}

run().catch(console.error)
