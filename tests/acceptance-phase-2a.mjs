import puppeteer from 'puppeteer-core'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.resolve(__dirname, '../test-screenshots/phase-2a')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runPhase2ATests() {
  console.log('=== STARTING PHASE 2A: ROOMS 201, 202, 203 ACCEPTANCE TESTS ===')

  const consoleLogs = []
  const pageErrors = []

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

  page.on('console', (msg) => {
    const text = msg.text()
    const type = msg.type()
    consoleLogs.push({ type, text })
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}]: ${text}`)
    }
  })

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString())
    console.error(`[Browser PageError]: ${err}`)
  })

  // Helper function to test a room's panorama
  async function testRoomPanorama(roomNumber, spaceName = 'Bedroom', _assetName = 'bedroom.jpg') {
    console.log(`\n--- Testing Room ${roomNumber} (${spaceName}) ---`)
    await page.goto(`http://127.0.0.1:5173/rooms/${roomNumber}`, { waitUntil: 'networkidle2' })
    await sleep(800)

    // 1. Ensure space is selected
    const tabId = `#space-tab-${spaceName.toLowerCase()}`
    const tab = await page.$(tabId)
    if (tab) {
      await tab.click()
      await sleep(400)
    }

    // 2. Click 360° Virtual Tour
    const tourButtons = await page.$$('button')
    let clicked = false
    for (const btn of tourButtons) {
      const text = await page.evaluate((el) => el.innerText, btn)
      const upper = text.toUpperCase()
      if (upper.includes('360° VIRTUAL TOUR') || upper.includes('LAUNCH 360° VIRTUAL TOUR')) {
        await btn.click()
        clicked = true
        break
      }
    }
    if (!clicked) {
      throw new Error(`Could not find 360° Virtual Tour button for Room ${roomNumber}`)
    }

    // 3. Wait for canvas to mount and texture to load
    await page.waitForSelector('canvas', { timeout: 10000 })
    await sleep(2000)

    // 4. Verify no placeholder text exists
    const bodyText = await page.evaluate(() => document.body.innerText)
    const hasComingSoon = bodyText.includes('360° Spherical Experience Coming Soon')
    const hasCaptureInProgress = bodyText.includes('Production Equirectangular Capture In Progress')
    const hasScheduled = bodyText.includes('Scheduled for Production')

    if (hasComingSoon || hasCaptureInProgress || hasScheduled) {
      throw new Error(`Placeholder detected in Room ${roomNumber} bedroom!`)
    }

    // 5. Measure canvas dimensions
    const canvasBox = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    })
    console.log(`  Room ${roomNumber} Canvas dimensions:`, canvasBox)

    // Screenshot initial view
    const ssInit = path.join(screenshotsDir, `room-${roomNumber}-01-initial.png`)
    await page.screenshot({ path: ssInit })
    console.log(`  Saved screenshot: room-${roomNumber}-01-initial.png`)

    // 6. Test Horizontal Dragging
    const centerX = canvasBox.x + canvasBox.width / 2
    const centerY = canvasBox.y + canvasBox.height / 2

    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX - 300, centerY, { steps: 20 })
    await page.mouse.up()
    await sleep(600)

    const ssDragH = path.join(screenshotsDir, `room-${roomNumber}-02-drag-horizontal.png`)
    await page.screenshot({ path: ssDragH })
    console.log(`  Saved screenshot: room-${roomNumber}-02-drag-horizontal.png`)

    // 7. Test Vertical Dragging (look up at ceiling)
    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await page.mouse.move(centerX, centerY + 250, { steps: 20 })
    await page.mouse.up()
    await sleep(600)

    const ssDragV = path.join(screenshotsDir, `room-${roomNumber}-03-drag-vertical.png`)
    await page.screenshot({ path: ssDragV })
    console.log(`  Saved screenshot: room-${roomNumber}-03-drag-vertical.png`)

    // 8. Test Zoom In
    const zoomInBtn = await page.$('button[aria-label="Zoom in"]')
    if (zoomInBtn) {
      await zoomInBtn.click()
      await sleep(300)
      await zoomInBtn.click()
      await sleep(500)
    }

    // 9. Test Reset View
    const resetBtn = await page.$('button[aria-label="Reset camera orientation"]')
    if (resetBtn) {
      await resetBtn.click()
      await sleep(800)
    }

    // Check HUD telemetry after Reset
    const hudInfo = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('div[role="region"] span'))
      return spans.map((s) => s.innerText.trim()).filter((t) => t.includes('FOV') || t.includes('°'))
    })
    console.log(`  Room ${roomNumber} Telemetry after reset:`, hudInfo)

    // 10. Test Fullscreen
    const fsBtn = await page.$('button[aria-label="Enter fullscreen"]')
    if (fsBtn) {
      await fsBtn.click()
      await sleep(500)
      const isFs = await page.evaluate(() => Boolean(document.fullscreenElement))
      console.log(`  Room ${roomNumber} Fullscreen active:`, isFs)
      const exitFsBtn = (await page.$('button[aria-label="Exit fullscreen"]')) || fsBtn
      await exitFsBtn.click()
      await sleep(500)
    }

    return true
  }

  // TEST 1: Room 201
  await testRoomPanorama('201')

  // TEST 2: Room 202
  await testRoomPanorama('202')

  // TEST 3: Room 203 Regression
  await testRoomPanorama('203')

  // TEST 4: Room Switching Cycle (201 -> 202 -> 203 -> 201)
  console.log('\n--- Testing Room Switching Cycle (201 -> 202 -> 203 -> 201) ---')
  const cycle = ['201', '202', '203', '201']
  for (const rNum of cycle) {
    console.log(`  Navigating to Room ${rNum}...`)
    await page.goto(`http://127.0.0.1:5173/rooms/${rNum}`, { waitUntil: 'networkidle2' })
    await sleep(600)

    const tourBtns = await page.$$('button')
    for (const btn of tourBtns) {
      const text = await page.evaluate((el) => el.innerText, btn)
      if (text.toUpperCase().includes('360° VIRTUAL TOUR')) {
        await btn.click()
        break
      }
    }
    await page.waitForSelector('canvas', { timeout: 8000 })
    await sleep(1000)

    const heading = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('div[role="region"] span'))
      return spans.map((s) => s.innerText.trim()).filter((t) => t.includes('FOV') || t.includes('°'))
    })
    console.log(`  Room ${rNum} active heading:`, heading)
  }

  // TEST 5: Verify unavailable spaces in Room 201 (Kitchen & Washroom)
  console.log('\n--- Testing Unavailable Space Fallback on Room 201 Kitchen ---')
  await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' })
  await sleep(600)

  // Click Kitchen space tab
  await page.click('#space-tab-kitchen')
  await sleep(500)

  // Click 360° Virtual Tour
  const tourBtnsKitchen = await page.$$('button')
  for (const btn of tourBtnsKitchen) {
    const text = await page.evaluate((el) => el.innerText, btn)
    if (text.toUpperCase().includes('360° VIRTUAL TOUR') || text.toUpperCase().includes('VIEW 360° TOUR SPECS')) {
      await btn.click()
      break
    }
  }
  await sleep(600)

  // Verify Kitchen shows placeholder and NO canvas
  const kitchenState = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    const text = document.body.innerText
    const hasPlaceholder =
      text.includes('360° Spherical Experience Coming Soon') || text.includes('Scheduled for Production')
    return { hasCanvas: Boolean(canvas), hasPlaceholder }
  })
  console.log('  Room 201 Kitchen state (should have no canvas & has placeholder):', kitchenState)
  if (kitchenState.hasCanvas || !kitchenState.hasPlaceholder) {
    throw new Error('Room 201 Kitchen failed to show placeholder state!')
  }

  const ssKitchen = path.join(screenshotsDir, 'room-201-kitchen-placeholder.png')
  await page.screenshot({ path: ssKitchen })
  console.log('  Saved screenshot: room-201-kitchen-placeholder.png')

  // Switch back to Bedroom -> canvas must mount cleanly
  console.log('  Switching back to Bedroom...')
  await page.click('#space-tab-bedroom')
  await sleep(500)
  const tourBtnsBed = await page.$$('button')
  for (const btn of tourBtnsBed) {
    const text = await page.evaluate((el) => el.innerText, btn)
    if (text.toUpperCase().includes('360° VIRTUAL TOUR')) {
      await btn.click()
      break
    }
  }
  await page.waitForSelector('canvas', { timeout: 8000 })
  await sleep(1000)
  console.log('  Room 201 Bedroom canvas re-mounted cleanly after switching!')

  // Final Diagnostics
  console.log('\n=== CONSOLE SUMMARY ===')
  const errors = consoleLogs.filter((m) => m.type === 'error')
  const warnings = consoleLogs.filter((m) => m.type === 'warning')
  console.log(`Total console messages: ${consoleLogs.length}`)
  console.log(`Errors: ${errors.length}`)
  console.log(`Warnings: ${warnings.length}`)
  console.log(`Page errors: ${pageErrors.length}`)

  await browser.close()
  console.log('\n=== ALL PHASE 2A ACCEPTANCE TESTS PASSED ===')
}

runPhase2ATests().catch((err) => {
  console.error('Phase 2A Test Suite Failed:', err)
  process.exit(1)
})
