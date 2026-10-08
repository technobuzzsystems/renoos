import puppeteer from 'puppeteer-core'
import path from 'path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\59ff21c9-6e2d-4b0e-a7d3-459c44c0e792'

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-430', width: 430, height: 932 },
    { name: 'mobile-390', width: 390, height: 844 },
    { name: 'mobile-375', width: 375, height: 812 }
  ]

  const page = await browser.newPage()

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height })
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
    await new Promise(r => setTimeout(r, 600))

    // Check overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth
    })
    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): overflow=${overflow}`)

    if (vp.name === 'desktop-1440') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-home-desktop.png') })
      
      // Scroll to rooms showcase
      await page.evaluate(() => {
        document.getElementById('rooms-showcase')?.scrollIntoView()
      })
      await new Promise(r => setTimeout(r, 500))
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-rooms-showcase.png') })

      // Scroll to footer
      await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
      await new Promise(r => setTimeout(r, 500))
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-footer-desktop.png') })

      // Go to Room 203
      await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle0' })
      await new Promise(r => setTimeout(r, 600))
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-room-203-desktop.png') })

      // Scroll to spaces
      await page.evaluate(() => {
        document.getElementById('space-exploration-section')?.scrollIntoView()
      })
      await new Promise(r => setTimeout(r, 500))
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-space-exploration.png') })
    }

    if (vp.name === 'mobile-375') {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
      await new Promise(r => setTimeout(r, 500))
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-home-mobile-375.png') })

      // Open mobile drawer
      const menuBtn = await page.$('button[aria-label="Toggle navigation menu"]')
      if (menuBtn) {
        await menuBtn.click()
        await new Promise(r => setTimeout(r, 400))
        await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-mobile-menu-drawer.png') })
      }
    }
  }

  await browser.close()
  console.log('Screenshots captured successfully!')
}

capture().catch(err => {
  console.error(err)
  process.exit(1)
})
