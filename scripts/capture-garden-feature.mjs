import puppeteer from 'puppeteer-core'
import path from 'path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\59ff21c9-6e2d-4b0e-a7d3-459c44c0e792'

async function check() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()

  console.log('1. Loading Homepage at 1440x900...')
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 600))

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-home-featured-garden-desktop.png') })
  console.log('Saved: sbfarm-home-featured-garden-desktop.png')

  console.log('2. Clicking "Explore Garden" CTA...')
  const ctaBtn = await page.$('a[href*="space=garden"]')
  if (ctaBtn) {
    console.log('Found Explore Garden CTA, clicking...')
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      ctaBtn.click()
    ])
    await new Promise(r => setTimeout(r, 1200))
    console.log('Navigated to URL:', page.url())

    // Capture destination view
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-garden-destination-opened.png') })
    console.log('Saved: sbfarm-garden-destination-opened.png')
  } else {
    console.error('Explore Garden CTA not found!')
  }

  console.log('3. Loading Homepage on Mobile at 375x812...')
  await page.setViewport({ width: 375, height: 812 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 600))

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth
  })
  console.log('Mobile overflow:', overflow)

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-home-featured-garden-mobile.png') })
  console.log('Saved: sbfarm-home-featured-garden-mobile.png')

  await browser.close()
  console.log('Check finished successfully!')
}

check().catch(err => {
  console.error('Error during check:', err)
  process.exit(1)
})
