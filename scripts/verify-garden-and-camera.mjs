import puppeteer from 'puppeteer-core'
import path from 'path'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\59ff21c9-6e2d-4b0e-a7d3-459c44c0e792'

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=swiftshader']
  })

  const page = await browser.newPage()

  // Track console logs and errors
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))

  console.log('--- 1. Testing Room 201 Desktop (1440x900) ---')
  await page.setViewport({ width: 1440, height: 900 })
  await page.goto('http://127.0.0.1:5173/rooms/201?calibrate', { waitUntil: 'networkidle0' })
  await new Promise(r => setTimeout(r, 800))

  // Scroll to space exploration
  await page.evaluate(() => {
    document.getElementById('space-exploration-section')?.scrollIntoView()
  })
  await new Promise(r => setTimeout(r, 600))

  // Check available tabs in SpaceSelector
  const tabs = await page.evaluate(() => {
    const tabEls = Array.from(document.querySelectorAll('[role="tab"]'))
    return tabEls.map(el => el.textContent?.trim())
  })
  console.log('Tabs in SpaceSelector:', tabs)

  // Click on Garden tab
  console.log('Clicking Garden tab...')
  const gardenTab = await page.$('#space-tab-garden')
  if (gardenTab) {
    await gardenTab.click()
    await new Promise(r => setTimeout(r, 600))
  } else {
    console.error('Garden tab not found!')
  }

  // Switch to 360° Virtual Tour
  console.log('Switching to 360° Virtual Tour...')
  const panoBtn = await page.$('button[data-testid="mode-panorama"]')
  if (panoBtn) {
    await panoBtn.click()
    await new Promise(r => setTimeout(r, 2000)) // allow Three.js texture load
  }

  // Check camera state from dev calibration exposed on window
  const cameraAim = await page.evaluate(() => {
    return window.getCameraAim ? window.getCameraAim() : null
  })
  console.log('Initial Garden Camera Aim:', cameraAim)

  // Capture Garden 360° desktop screenshot
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-garden-360-desktop.png') })
  console.log('Captured: sbfarm-garden-360-desktop.png')

  // Test Zoom In
  const zoomInBtn = await page.$('button[aria-label="Zoom in"]')
  if (zoomInBtn) {
    await zoomInBtn.click()
    await new Promise(r => setTimeout(r, 300))
    await zoomInBtn.click()
    await new Promise(r => setTimeout(r, 300))
  }
  const zoomedInAim = await page.evaluate(() => {
    return window.getCameraAim ? window.getCameraAim() : null
  })
  console.log('After Zoom In Aim:', zoomedInAim)

  // Test Zoom Out
  const zoomOutBtn = await page.$('button[aria-label="Zoom out"]')
  if (zoomOutBtn) {
    for (let i = 0; i < 5; i++) {
      await zoomOutBtn.click()
      await new Promise(r => setTimeout(r, 150))
    }
  }
  const zoomedOutAim = await page.evaluate(() => {
    return window.getCameraAim ? window.getCameraAim() : null
  })
  console.log('After Zoom Out Aim:', zoomedOutAim)

  // Test Reset View
  const resetBtn = await page.$('button[aria-label="Reset View"]')
  if (resetBtn) {
    await resetBtn.click()
    await new Promise(r => setTimeout(r, 400))
  }
  const resetAim = await page.evaluate(() => {
    return window.getCameraAim ? window.getCameraAim() : null
  })
  console.log('After Reset View Aim:', resetAim)

  console.log('\n--- 2. Testing Mobile (375x812) ---')
  await page.setViewport({ width: 375, height: 812 })
  await new Promise(r => setTimeout(r, 500))

  const mobileOverflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth
  })
  console.log('Mobile overflow:', mobileOverflow)

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sbfarm-garden-360-mobile.png') })
  console.log('Captured: sbfarm-garden-360-mobile.png')

  console.log('\nErrors encountered:', errors.filter(e => !e.includes('favicon')))

  await browser.close()
  console.log('\nVerification complete!')
}

verify().catch(err => {
  console.error('Verification failed:', err)
  process.exit(1)
})
