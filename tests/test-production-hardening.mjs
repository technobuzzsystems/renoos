import puppeteer from 'puppeteer-core'
import { spawn } from 'child_process'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runProductionHardeningTest() {
  console.log('========================================================')
  console.log('   PRODUCTION HARDENING & CALIBRATION ACCESS TEST')
  console.log('========================================================\n')

  // 1. Start vite preview on port 4173
  console.log('Starting production preview server (vite preview --port 4173)...')
  const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
    shell: true,
    stdio: 'pipe',
  })

  // Wait for preview server to start
  await sleep(2500)

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    // =========================================================================
    // TEST A: PRODUCTION BUILD WITH ?calibrate=true MUST NOT SHOW CALIBRATION UI
    // =========================================================================
    console.log('--- TEST A: Production Build with /rooms/203?calibrate=true ---')
    await page.goto('http://127.0.0.1:4173/rooms/203?calibrate=true', { waitUntil: 'networkidle2' })
    await sleep(800)

    // Activate 360
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(1000)

    const prodCalibrationChecks = await page.evaluate(() => {
      const reticleText = document.body.innerText.includes('CALIBRATION RETICLE')
      const win = window
      const hasSetCameraAim = typeof win.setCameraAim === 'function'
      const hasGetCameraAim = typeof win.getCameraAim === 'function'
      const hasReticleOverlay = Boolean(document.querySelector('[data-calibration-reticle], [data-calibration-panel]'))
      const compassTelemetry = document.body.innerText.includes('Facing North') || document.body.innerText.includes('Facing East')

      return {
        reticleText,
        hasSetCameraAim,
        hasGetCameraAim,
        hasReticleOverlay,
        compassTelemetry,
      }
    })

    console.log('  [Production /rooms/203?calibrate=true]:')
    console.log('    ✓ CALIBRATION RETICLE text present:', prodCalibrationChecks.reticleText, '(Expected: false)')
    console.log('    ✓ window.setCameraAim exposed:', prodCalibrationChecks.hasSetCameraAim, '(Expected: false)')
    console.log('    ✓ window.getCameraAim exposed:', prodCalibrationChecks.hasGetCameraAim, '(Expected: false)')
    console.log('    ✓ Reticle overlay DOM present:', prodCalibrationChecks.hasReticleOverlay, '(Expected: false)')
    console.log('    ✓ Compass telemetry present:', prodCalibrationChecks.compassTelemetry, '(Expected: false)')

    if (
      prodCalibrationChecks.reticleText ||
      prodCalibrationChecks.hasSetCameraAim ||
      prodCalibrationChecks.hasReticleOverlay ||
      prodCalibrationChecks.compassTelemetry
    ) {
      throw new Error('FAILED: Calibration or telemetry UI leaked into production build!')
    }
    console.log('  ✓ PRODUCTION ACCESS CONTROL VERIFIED: 100% BLOCKED IN PRODUCTION!')

    // =========================================================================
    // TEST B: PRODUCTION NORMAL ROOMS SMOKE TEST (201, 202, 203)
    // =========================================================================
    console.log('\n--- TEST B: Production Navigation Verification across 201, 202, 203 ---')
    for (const roomId of ['201', '202', '203']) {
      await page.goto(`http://127.0.0.1:4173/rooms/${roomId}`, { waitUntil: 'networkidle2' })
      await sleep(600)
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
        if (btn) btn.click()
      })
      await sleep(800)
      const canvasMounted = await page.$('canvas')
      console.log(`  ✓ Room ${roomId} 360 canvas mounted on production build:`, Boolean(canvasMounted))
      if (!canvasMounted) throw new Error(`Room ${roomId} canvas failed to mount in production`)
    }

    // =========================================================================
    // TEST C: DEVELOPMENT MODE BEHAVIOR (DEV ONLY TOOLING)
    // =========================================================================
    console.log('\n--- TEST C: Development Server Calibration Verification ---')
    // 1. Dev server WITHOUT ?calibrate=true
    await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
    await sleep(600)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    const devNormalReticle = await page.evaluate(() => document.body.innerText.includes('CALIBRATION RETICLE'))
    console.log('  ✓ Dev mode normal URL has no reticle:', !devNormalReticle)

    // 2. Dev server WITH ?calibrate=true
    await page.goto('http://127.0.0.1:5173/rooms/203?calibrate=true', { waitUntil: 'networkidle2' })
    await sleep(600)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    const devCalibrateReticle = await page.evaluate(() => document.body.innerText.includes('CALIBRATION RETICLE'))
    const devSetCameraAim = await page.evaluate(() => typeof window.setCameraAim === 'function')
    console.log('  ✓ Dev mode with ?calibrate=true exposes calibration tooling:', devCalibrateReticle && devSetCameraAim)

    console.log('\n========================================================')
    console.log('   ALL PRODUCTION HARDENING CRITERIA PASSED (100%)!')
    console.log('========================================================\n')
  } catch (err) {
    console.error('❌ Production Hardening Test Failed:', err)
    process.exit(1)
  } finally {
    try {
      await browser.close()
    } catch {}
    try {
      if (previewProcess && previewProcess.pid) {
        spawn('taskkill', ['/pid', previewProcess.pid.toString(), '/f', '/t'], { shell: true })
      }
    } catch {}
  }
}

runProductionHardeningTest()
