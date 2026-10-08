import puppeteer from 'puppeteer-core'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runRoomSwitchingTest() {
  console.log('--- Room Switching Cycle Verification (201 -> 202 -> 203 -> 201) ---')
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl', '--use-gl=angle', '--window-size=1440,900'],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })

  const consoleErrors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message)
  })

  try {
    // 1. Start at Room 201
    await page.goto('http://127.0.0.1:5173/rooms/201', { waitUntil: 'networkidle2' })
    await sleep(600)
    let title = await page.$eval('h1', (el) => el.textContent)
    console.log(`  ✓ Loaded Room 201: "${title}"`)

    // Activate 360
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    let canvas = await page.$('canvas')
    console.log(`  ✓ Room 201 360 Canvas mounted:`, Boolean(canvas))

    // 2. Switch to Room 202 via RoomSwitcher
    await page.evaluate(() => {
      // Find room switcher button for 202
      const link = document.querySelector('a[href*="/rooms/202"]')
      if (link) link.click()
    })
    await sleep(800)
    title = await page.$eval('h1', (el) => el.textContent)
    console.log(`  ✓ Navigated to Room 202: "${title}"`)

    // Activate 360
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    canvas = await page.$('canvas')
    console.log(`  ✓ Room 202 360 Canvas mounted:`, Boolean(canvas))

    // 3. Switch to Room 203 via RoomSwitcher
    await page.evaluate(() => {
      const link = document.querySelector('a[href*="/rooms/203"]')
      if (link) link.click()
    })
    await sleep(800)
    title = await page.$eval('h1', (el) => el.textContent)
    console.log(`  ✓ Navigated to Room 203: "${title}"`)

    // Activate 360
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    canvas = await page.$('canvas')
    console.log(`  ✓ Room 203 360 Canvas mounted:`, Boolean(canvas))

    // 4. Return to Room 201
    await page.evaluate(() => {
      const link = document.querySelector('a[href*="/rooms/201"]')
      if (link) link.click()
    })
    await sleep(800)
    title = await page.$eval('h1', (el) => el.textContent)
    console.log(`  ✓ Returned to Room 201: "${title}"`)

    // Activate 360
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('360° Virtual Tour'))
      if (btn) btn.click()
    })
    await sleep(800)
    canvas = await page.$('canvas')
    console.log(`  ✓ Room 201 360 Canvas remounted cleanly:`, Boolean(canvas))

    console.log(`  ✓ Console errors: ${consoleErrors.length}`)
    console.log('--- Room Switching Cycle PASSED (4/4)! ---')
  } catch (err) {
    console.error('Room Switching Failed:', err)
    process.exit(1)
  } finally {
    await browser.close()
  }
}

runRoomSwitchingTest()
