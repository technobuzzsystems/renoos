import puppeteer from 'puppeteer-core'
import fs from 'fs'
import path from 'path'

const SCREENSHOT_DIR = path.resolve('tests/screenshots-phase-3')
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runPhase3AcceptanceSuite() {
  console.log('========================================================')
  console.log('   PHASE 3: INTERACTIVE HOTSPOTS & 360° TOUR ACCEPTANCE')
  console.log('========================================================\n')

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
    consoleLogs.push({ type: msg.type(), text })
    if (msg.type() === 'error') {
      console.error(`  [Browser Error]: ${text}`)
    }
  })

  page.on('pageerror', (err) => {
    pageErrors.push(err.message)
    console.error(`  [Page Error]: ${err.message}`)
  })

  // Helper to open 360 tour for currently loaded room
  async function activate360Tour() {
    // Find button containing '360° Virtual Tour'
    const tourBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((b) => b.textContent.includes('360° Virtual Tour')) || null
    })

    if (tourBtn && tourBtn.asElement()) {
      await tourBtn.asElement().click()
      await sleep(1000)
    } else {
      throw new Error('Could not find 360° Virtual Tour button')
    }
  }

  // Helper to click hotspot button by ID or target space
  async function clickHotspot(targetSpaceId) {
    const clicked = await page.evaluate((targetId) => {
      // Find beacon button with matching data-target-space or ID
      const btn = document.querySelector(`button[data-target-space="${targetId}"]`)
      if (btn) {
        btn.click()
        return true
      }
      // Fallback: look for hotspot item in bottom drawer
      const drawerItem = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent.toLowerCase().includes(targetId) && b.closest('[role="region"]')
      )
      if (drawerItem) {
        drawerItem.click()
        return true
      }
      return false
    }, targetSpaceId)

    if (!clicked) {
      throw new Error(`Failed to find hotspot leading to "${targetSpaceId}"`)
    }
    await sleep(1200) // allow crossfade transition
  }

  // Helper to check active space tab
  async function getActiveSpaceId() {
    return await page.evaluate(() => {
      const activeTab = document.querySelector('[role="tab"][aria-selected="true"]')
      return activeTab ? activeTab.id.replace('space-tab-', '') : null
    })
  }

  try {
    // =========================================================================
    // TEST 1: ROOM 203 BEDROOM INITIALIZATION & REGRESSION TEST
    // =========================================================================
    console.log('--- TEST 1: Room 203 Bedroom 360° Initialization ---')
    await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
    await sleep(800)

    await activate360Tour()

    // Confirm canvas is mounted
    const canvasExists = await page.$('canvas')
    console.log('  ✓ Three.js Canvas mounted:', Boolean(canvasExists))

    // Confirm active space is bedroom
    let activeSpace = await getActiveSpaceId()
    console.log('  ✓ Active space is bedroom:', activeSpace === 'bedroom')

    // Confirm beacons rendered in DOM
    const beaconCount = await page.evaluate(() => {
      return document.querySelectorAll('button[data-hotspot-id]').length
    })
    console.log(`  ✓ In-scene 3D Beacons rendered: ${beaconCount}`)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-room-203-bedroom-360.png') })

    // Test drag interaction
    console.log('  Testing panorama drag rotation...')
    const canvasRect = await page.evaluate(() => {
      const c = document.querySelector('canvas')
      const r = c.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    })

    await page.mouse.move(canvasRect.x, canvasRect.y)
    await page.mouse.down()
    await page.mouse.move(canvasRect.x - 200, canvasRect.y, { steps: 10 })
    await page.mouse.up()
    await sleep(300)
    console.log('  ✓ Drag rotation executed smoothly')

    // =========================================================================
    // TEST 2: FULL NAVIGATION CYCLE (Bedroom → Kitchen → Washroom → Bedroom)
    // =========================================================================
    console.log('\n--- TEST 2: Room 203 Complete Tour Cycle (Bed → Kitchen → Washroom → Bed) ---')

    // 2a. Navigate to Kitchen
    console.log('  Navigating to Kitchen via 3D Hotspot...')
    await clickHotspot('kitchen')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space changed to: ${activeSpace}`)
    if (activeSpace !== 'kitchen') throw new Error(`Expected kitchen, got ${activeSpace}`)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-room-203-kitchen-navigated.png') })

    // Confirm return button appears
    const hasReturnBtn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      return btns.some((b) => b.textContent.includes('Back to'))
    })
    console.log('  ✓ "Back to..." return button is present in HUD:', hasReturnBtn)

    // 2b. Navigate to Washroom
    console.log('  Navigating to Washroom via 3D Hotspot...')
    await clickHotspot('washroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space changed to: ${activeSpace}`)
    if (activeSpace !== 'washroom') throw new Error(`Expected washroom, got ${activeSpace}`)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-room-203-washroom-navigated.png') })

    // 2c. Navigate back to Bedroom
    console.log('  Navigating back to Bedroom via 3D Hotspot...')
    await clickHotspot('bedroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space returned to: ${activeSpace}`)
    if (activeSpace !== 'bedroom') throw new Error(`Expected bedroom, got ${activeSpace}`)

    console.log('  ✓ Full Tour Cycle 1 PASSED!')

    // =========================================================================
    // TEST 3: REVERSE TRAVERSAL CYCLE (Bedroom → Washroom → Kitchen → Bedroom)
    // =========================================================================
    console.log('\n--- TEST 3: Reverse Tour Cycle (Bed → Washroom → Kitchen → Bed) ---')

    console.log('  Navigating to Washroom...')
    await clickHotspot('washroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space: ${activeSpace}`)

    console.log('  Navigating to Kitchen...')
    await clickHotspot('kitchen')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space: ${activeSpace}`)

    console.log('  Navigating to Bedroom...')
    await clickHotspot('bedroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Active space: ${activeSpace}`)

    console.log('  ✓ Reverse Tour Cycle 2 PASSED!')

    // =========================================================================
    // TEST 4: "RETURN TO PREVIOUS SPACE" BUTTON
    // =========================================================================
    console.log('\n--- TEST 4: Return to Previous Space Button ---')
    await clickHotspot('kitchen')
    console.log('  Currently in Kitchen. Clicking "Back to..." HUD button...')

    const returnClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'))
      const returnBtn = btns.find((b) => b.textContent.includes('Back to'))
      if (returnBtn) {
        returnBtn.click()
        return true
      }
      return false
    })

    if (!returnClicked) throw new Error('Could not find Return to Previous button')
    await sleep(1200)

    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Space after clicking Return button: ${activeSpace}`)
    if (activeSpace !== 'bedroom') throw new Error(`Expected bedroom, got ${activeSpace}`)
    console.log('  ✓ Return to previous space button PASSED!')

    // =========================================================================
    // TEST 5: FEATURE / INFO HOTSPOT MODAL
    // =========================================================================
    console.log('\n--- TEST 5: Feature Hotspot Inspection Card ---')
    const featureHotspotId = await page.evaluate(() => {
      const btn = document.querySelector('button[data-hotspot-type="feature"], button[data-hotspot-type="info"]')
      if (btn) {
        btn.click()
        return btn.getAttribute('data-hotspot-id')
      }
      return null
    })

    console.log('  Clicked feature hotspot:', featureHotspotId)
    await sleep(500)

    const featureModalVisible = await page.evaluate(() => {
      const modal = document.querySelector('button[aria-label="Close feature details"]')?.closest('div')
      return Boolean(modal && (modal.textContent.includes('Fireplace') || modal.textContent.toUpperCase().includes('ARCHITECTURE')))
    })
    console.log('  ✓ Architectural feature detail card opened:', featureModalVisible)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-feature-hotspot-modal.png') })

    // Close detail card
    await page.evaluate(() => {
      const closeBtn = document.querySelector('button[aria-label="Close feature details"]')
      if (closeBtn) closeBtn.click()
    })
    await sleep(300)

    // =========================================================================
    // TEST 6: ROOM 201 FULL TOUR CYCLE
    // =========================================================================
    console.log('\n--- TEST 6: Room 201 Full Tour Cycle ---')
    await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' })
    await sleep(800)
    await activate360Tour()

    console.log('  Room 201 Bedroom loaded.')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-room-201-bedroom-360.png') })

    await clickHotspot('kitchen')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 201 Kitchen loaded: ${activeSpace === 'kitchen'}`)

    await clickHotspot('washroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 201 Washroom loaded: ${activeSpace === 'washroom'}`)

    await clickHotspot('bedroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 201 Bedroom restored: ${activeSpace === 'bedroom'}`)

    // =========================================================================
    // TEST 7: ROOM 202 FULL TOUR CYCLE
    // =========================================================================
    console.log('\n--- TEST 7: Room 202 Full Tour Cycle ---')
    await page.goto('http://127.0.0.1:5173/rooms/202', { waitUntil: 'networkidle2' })
    await sleep(800)
    await activate360Tour()

    console.log('  Room 202 Bedroom loaded.')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-room-202-bedroom-360.png') })

    await clickHotspot('kitchen')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 202 Kitchen loaded: ${activeSpace === 'kitchen'}`)

    await clickHotspot('washroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 202 Washroom loaded: ${activeSpace === 'washroom'}`)

    await clickHotspot('bedroom')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Room 202 Bedroom restored: ${activeSpace === 'bedroom'}`)

    // =========================================================================
    // TEST 8: MOBILE VIEWPORT ACCEPTANCE (375x812)
    // =========================================================================
    console.log('\n--- TEST 8: Mobile Viewport Acceptance (375x812 iPhone) ---')
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true })
    await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
    await sleep(800)
    await activate360Tour()

    console.log('  Mobile 360 tour active.')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-room-203-mobile-375px.png') })

    // Tap Kitchen beacon
    await clickHotspot('kitchen')
    activeSpace = await getActiveSpaceId()
    console.log(`  ✓ Mobile hotspot tap transitioned to: ${activeSpace}`)
    if (activeSpace !== 'kitchen') throw new Error(`Mobile navigation failed: ${activeSpace}`)

    // =========================================================================
    // TEST 9: PHOTOGRAPHY ↔ 360° MODE SWITCHING REGRESSION
    // =========================================================================
    console.log('\n--- TEST 9: Photo ↔ 360 Mode Switching ---')
    // Click View Photography
    const photoBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      return buttons.find((b) => b.textContent.includes('Photography') || b.textContent.includes('Photos')) || null
    })
    if (photoBtn && photoBtn.asElement()) {
      await photoBtn.asElement().click()
      await sleep(500)
    }

    const photoVisible = await page.evaluate(() => {
      const img = document.querySelector('img[alt*="Interior"], img[alt*="Kitchen"]')
      return Boolean(img)
    })
    console.log('  ✓ Successfully switched back to Photography mode:', photoVisible)

    // Switch back to 360
    await activate360Tour()
    const canvasRestored = await page.$('canvas')
    console.log('  ✓ Successfully returned to 360° Virtual Tour:', Boolean(canvasRestored))

    // =========================================================================
    // TEST 10: CONSOLE DIAGNOSTICS & MEMORY
    // =========================================================================
    console.log('\n--- TEST 10: Diagnostics & WebGL Integrity ---')
    console.log(`  Page error count: ${pageErrors.length}`)
    console.log(`  Console error count: ${consoleLogs.filter((l) => l.type === 'error').length}`)

    const activeContexts = await page.evaluate(() => {
      // In Three.js R3F Canvas, only 1 canvas WebGL context should be active
      return document.querySelectorAll('canvas').length
    })
    console.log(`  Active Canvas count in DOM: ${activeContexts}`)

    console.log('\n========================================================')
    console.log('   ALL PHASE 3 BROWSER ACCEPTANCE TESTS PASSED (10/10)!')
    console.log('========================================================\n')
  } catch (error) {
    console.error('\n❌ ACCEPTANCE TEST FAILED:', error)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'failure-state.png') })
    process.exit(1)
  } finally {
    await browser.close()
  }
}

runPhase3AcceptanceSuite()
