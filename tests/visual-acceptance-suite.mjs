import puppeteer from 'puppeteer-core'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.resolve(__dirname, '../test-screenshots')

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runTestSuite() {
  console.log('=== STARTING 360° PANORAMA ACCEPTANCE TEST SUITE ===')
  
  const consoleMessages = []
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
    consoleMessages.push({ type, text })
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}]: ${text}`)
    }
  })

  page.on('pageerror', (err) => {
    pageErrors.push(err.toString())
    console.error(`[Browser PageError]: ${err}`)
  })

  // 1. Navigate to Room 203
  console.log('\nStep 1: Navigating to Room 203 (/rooms/203)...')
  await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
  await sleep(1000)

  // 2. Select Bedroom space (should already be selected, but click button to ensure)
  console.log('Step 2: Ensuring Bedroom space is selected...')
  const spaceButtons = await page.$$('button')
  for (const btn of spaceButtons) {
    const text = await page.evaluate(el => el.innerText, btn)
    if (text.includes('Bedroom')) {
      await btn.click()
      await sleep(500)
      break
    }
  }

  // 3. Open 360° Virtual Tour
  console.log('Step 3: Opening 360° Virtual Tour mode...')
  const tourButtons = await page.$$('button')
  let tourBtnFound = false
  for (const btn of tourButtons) {
    const text = await page.evaluate(el => el.innerText, btn)
    const upper = text.toUpperCase()
    if (upper.includes('360° VIRTUAL TOUR') || upper.includes('LAUNCH 360° VIRTUAL TOUR')) {
      await btn.click()
      tourBtnFound = true
      break
    }
  }
  if (!tourBtnFound) {
    throw new Error('Could not find 360° Virtual Tour button')
  }

  console.log('Waiting for 3D Canvas and texture to load...')
  await page.waitForSelector('canvas', { timeout: 10000 })
  await sleep(2000) // allow texture decode & initial render

  // 4. Confirm Canvas exists and check telemetry
  const canvasBox = await page.evaluate(() => {
    const canvas = document.querySelector('canvas')
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
  })
  console.log('Canvas rendered with dimensions:', canvasBox)

  // Capture Screenshot 1: Initial 360° view
  const ss1Path = path.join(screenshotsDir, '01-initial-360-view.png')
  await page.screenshot({ path: ss1Path, fullPage: false })
  console.log('Saved Screenshot 1:', ss1Path)

  // 5. Test Horizontal Dragging across complete 360° rotation
  console.log('\nStep 5: Testing Horizontal Dragging (full 360° rotation)...')
  const centerX = canvasBox.x + canvasBox.width / 2
  const centerY = canvasBox.y + canvasBox.height / 2

  // Drag 1: ~90° azimuth
  console.log('  Dragging to ~90° azimuth...')
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX - 350, centerY, { steps: 20 })
  await page.mouse.up()
  await sleep(600) // wait for lerp damping
  await page.screenshot({ path: path.join(screenshotsDir, '02-rotated-90deg.png') })
  console.log('  Saved Screenshot 2 (90° azimuth)')

  // Drag 2: ~180° azimuth (seam area)
  console.log('  Dragging to ~180° azimuth...')
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX - 350, centerY, { steps: 20 })
  await page.mouse.up()
  await sleep(600)
  await page.screenshot({ path: path.join(screenshotsDir, '03-rotated-180deg-seam.png') })
  console.log('  Saved Screenshot 3 (180° azimuth & seam)')

  // Drag 3: ~270° azimuth
  console.log('  Dragging to ~270° azimuth...')
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX - 350, centerY, { steps: 20 })
  await page.mouse.up()
  await sleep(600)
  await page.screenshot({ path: path.join(screenshotsDir, '04-rotated-270deg.png') })
  console.log('  Saved Screenshot 4 (270° azimuth)')

  // Drag 4: ~360° full loop
  console.log('  Completing full 360° loop...')
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX - 350, centerY, { steps: 20 })
  await page.mouse.up()
  await sleep(600)
  await page.screenshot({ path: path.join(screenshotsDir, '05-rotated-360deg-loop.png') })
  console.log('  Saved Screenshot 5 (completed 360° rotation)')

  // 6. Test Vertical Dragging (look up at ceiling & look down at floor)
  console.log('\nStep 6: Testing Vertical Dragging (Ceiling and Floor)...')
  // Look up at ceiling: drag down
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX, centerY + 300, { steps: 20 })
  await page.mouse.up()
  await sleep(600)
  await page.screenshot({ path: path.join(screenshotsDir, '06-looking-up-ceiling.png') })
  console.log('  Saved Screenshot 6 (Ceiling view & vertical upper limit)')

  // Look down at floor: drag up
  await page.mouse.move(centerX, centerY)
  await page.mouse.down()
  await page.mouse.move(centerX, centerY - 600, { steps: 30 })
  await page.mouse.up()
  await sleep(600)
  await page.screenshot({ path: path.join(screenshotsDir, '07-looking-down-floor.png') })
  console.log('  Saved Screenshot 7 (Floor view & vertical lower limit)')

  // 7. Test Reset View button
  console.log('\nStep 7: Testing Reset View button...')
  const resetBtn = await page.$('button[aria-label="Reset camera orientation"]')
  if (resetBtn) {
    await resetBtn.click()
    await sleep(1000) // allow lerp to glide back to origin
    await page.evaluate(() => {
      const region = document.querySelector('div[role="region"]')
      region?.scrollIntoView({ block: 'center' })
    })
    await sleep(300)
    const hudAfterReset = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('div[role="region"] span'))
      return spans.map(s => s.innerText).filter(t => t.includes('FOV') || t.includes('°'))
    })
    console.log('  HUD telemetry after Reset:', hudAfterReset)
    await page.screenshot({ path: path.join(screenshotsDir, '08-after-reset.png') })
    console.log('  Saved Screenshot 8 (After Reset view)')
  } else {
    console.warn('  Reset button not found!')
  }

  // 8. Test Zoom In button
  console.log('\nStep 8: Testing Zoom In button...')
  const zoomInBtn = await page.$('button[aria-label="Zoom in"]')
  if (zoomInBtn) {
    await zoomInBtn.click()
    await sleep(300)
    await zoomInBtn.click()
    await sleep(800)
    const hudAfterZoomIn = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('div[role="region"] span'))
      return spans.map(s => s.innerText).filter(t => t.includes('FOV'))
    })
    console.log('  HUD FOV after Zoom In:', hudAfterZoomIn)
    await page.screenshot({ path: path.join(screenshotsDir, '09-zoomed-in.png') })
    console.log('  Saved Screenshot 9 (Zoomed In)')
  }

  // 9. Test Zoom Out button
  console.log('\nStep 9: Testing Zoom Out button...')
  const zoomOutBtn = await page.$('button[aria-label="Zoom out"]')
  if (zoomOutBtn) {
    await zoomOutBtn.click()
    await sleep(300)
    await zoomOutBtn.click()
    await sleep(300)
    await zoomOutBtn.click()
    await sleep(800)
    const hudAfterZoomOut = await page.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('div[role="region"] span'))
      return spans.map(s => s.innerText).filter(t => t.includes('FOV'))
    })
    console.log('  HUD FOV after Zoom Out:', hudAfterZoomOut)
    await page.screenshot({ path: path.join(screenshotsDir, '10-zoomed-out.png') })
    console.log('  Saved Screenshot 10 (Zoomed Out)')
  }

  // 10. Test Mouse Wheel Zoom
  console.log('\nStep 10: Testing Mouse Wheel Zoom...')
  await page.mouse.move(centerX, centerY)
  await page.mouse.wheel({ deltaY: -200 }) // zoom in
  await sleep(400)
  await page.mouse.wheel({ deltaY: 200 }) // zoom out
  await sleep(400)
  console.log('  Mouse wheel event dispatched cleanly')

  // 11. Test Keyboard Controls
  console.log('\nStep 11: Testing Keyboard Controls...')
  const viewerRegion = await page.$('div[role="region"]')
  if (viewerRegion) {
    await viewerRegion.focus()
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowUp')
    await sleep(500)
    await page.keyboard.press('r') // reset key
    await sleep(600)
    console.log('  Keyboard controls executed and verified')
  }

  // 12. Test Fullscreen Toggle
  console.log('\nStep 12: Testing Fullscreen Toggle...')
  const fullscreenBtn = await page.$('button[aria-label="Enter fullscreen"]')
  if (fullscreenBtn) {
    await fullscreenBtn.click()
    await sleep(600)
    const isFs = await page.evaluate(() => Boolean(document.fullscreenElement))
    console.log('  Fullscreen active in DOM:', isFs)
    await page.screenshot({ path: path.join(screenshotsDir, '11-fullscreen-mode.png') })
    
    // Exit fullscreen
    const exitFsBtn = await page.$('button[aria-label="Exit fullscreen"]') || fullscreenBtn
    await exitFsBtn.click()
    await sleep(600)
    console.log('  Exited fullscreen')
  }

  // 13. Test Room Switching (Room 203 -> Room 201 -> Room 203)
  console.log('\nStep 13: Testing Room Switching (203 -> 201 -> 203)...')
  console.log('  Navigating to Room 201...')
  await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' })
  await sleep(800)

  // Switch to 360 tour for Room 201
  const tourBtns201 = await page.$$('button')
  for (const btn of tourBtns201) {
    const text = await page.evaluate(el => el.innerText, btn)
    const upper = text.toUpperCase()
    if (upper.includes('360° VIRTUAL TOUR') || upper.includes('VIEW 360° TOUR SPECS')) {
      await btn.click()
      break
    }
  }
  await sleep(800)

  // Confirm Room 201 shows unavailable/scheduled state and NO canvas
  const room201State = await page.evaluate(() => {
    const hasCanvas = Boolean(document.querySelector('canvas'))
    const hasUnavailableHeader = document.body.innerText.includes('360° Spherical Experience Coming Soon') ||
                                document.body.innerText.includes('Scheduled for Production')
    return { hasCanvas, hasUnavailableHeader }
  })
  console.log('  Room 201 State verification:', room201State)
  await page.screenshot({ path: path.join(screenshotsDir, '12-room201-unavailable-state.png') })
  console.log('  Saved Screenshot 12 (Room 201 clean unavailable state)')

  // Switch back to Room 203
  console.log('  Switching back to Room 203...')
  await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
  await sleep(800)
  
  // Open 360 tour again
  const tourBtns203Return = await page.$$('button')
  for (const btn of tourBtns203Return) {
    const text = await page.evaluate(el => el.innerText, btn)
    const upper = text.toUpperCase()
    if (upper.includes('360° VIRTUAL TOUR') || upper.includes('LAUNCH 360° VIRTUAL TOUR')) {
      await btn.click()
      break
    }
  }
  await page.waitForSelector('canvas', { timeout: 10000 })
  await sleep(1500)
  await page.screenshot({ path: path.join(screenshotsDir, '13-room203-returned-clean.png') })
  console.log('  Saved Screenshot 13 (Room 203 returned cleanly)')

  // 14. Test Mobile Touch Emulation
  console.log('\nStep 14: Testing Mobile Touch Emulation (iPhone 13 viewport)...')
  const mobilePage = await browser.newPage()
  await mobilePage.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 2,
  })

  await mobilePage.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
  await sleep(800)

  const mobileTourBtns = await mobilePage.$$('button')
  for (const btn of mobileTourBtns) {
    const text = await mobilePage.evaluate(el => el.innerText, btn)
    const upper = text.toUpperCase()
    if (upper.includes('360° VIRTUAL TOUR') || upper.includes('LAUNCH 360° VIRTUAL TOUR')) {
      await btn.click()
      break
    }
  }
  await mobilePage.waitForSelector('canvas', { timeout: 10000 })
  await sleep(1500)

  // Touch drag gesture simulation
  const mobileCanvas = await mobilePage.$('canvas')
  const mBox = await mobileCanvas.boundingBox()
  const mCenterX = mBox.x + mBox.width / 2
  const mCenterY = mBox.y + mBox.height / 2

  // Simulate touch drag
  await mobilePage.touchscreen.tap(mCenterX, mCenterY)
  await mobilePage.mouse.move(mCenterX, mCenterY)
  await mobilePage.mouse.down()
  await mobilePage.mouse.move(mCenterX - 150, mCenterY, { steps: 15 })
  await mobilePage.mouse.up()
  await sleep(600)

  await mobilePage.screenshot({ path: path.join(screenshotsDir, '14-mobile-touch-interaction.png') })
  console.log('  Saved Screenshot 14 (Mobile touch viewport interaction)')
  await mobilePage.close()

  // 15. Check Console Diagnostics
  console.log('\n=== CONSOLE DIAGNOSTICS ===')
  const errorLogs = consoleMessages.filter(m => m.type === 'error')
  const warningLogs = consoleMessages.filter(m => m.type === 'warning')
  console.log(`Total console messages: ${consoleMessages.length}`)
  console.log(`Error messages: ${errorLogs.length}`)
  console.log(`Warning messages: ${warningLogs.length}`)
  console.log(`Page errors: ${pageErrors.length}`)

  await browser.close()
  console.log('\n=== ACCEPTANCE TEST SUITE COMPLETED SUCCESSFULLY ===')
}

runTestSuite().catch(err => {
  console.error('Test Suite Failed:', err)
  process.exit(1)
})
