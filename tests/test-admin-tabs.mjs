import puppeteer from 'puppeteer-core'

async function checkAdminTabs() {
  console.log('Testing Admin Tabs and Modals...')
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle2' })

    // Login
    await page.type('input[type="password"]', 'renoos2026')
    await page.click('button[type="submit"]')
    await new Promise((r) => setTimeout(r, 1500))

    // 1. Click Reservations Tab
    const tabs = await page.$$('button')
    for (const b of tabs) {
      const text = await page.evaluate((el) => el.textContent, b)
      if (text?.includes('Reservations')) {
        await b.click()
        break
      }
    }
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: 'tests/admin-tab-reservations.png' })
    console.log('✓ Captured tests/admin-tab-reservations.png')

    // 2. Click Suites & Inventory Tab
    for (const b of await page.$$('button')) {
      const text = await page.evaluate((el) => el.textContent, b)
      if (text?.includes('Suites & Inventory')) {
        await b.click()
        break
      }
    }
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: 'tests/admin-tab-rooms.png' })
    console.log('✓ Captured tests/admin-tab-rooms.png')

    // 3. Click Guest CRM Tab
    for (const b of await page.$$('button')) {
      const text = await page.evaluate((el) => el.textContent, b)
      if (text?.includes('Guest CRM')) {
        await b.click()
        break
      }
    }
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: 'tests/admin-tab-guests.png' })
    console.log('✓ Captured tests/admin-tab-guests.png')

    // 4. Open Walk-in Modal
    for (const b of await page.$$('button')) {
      const text = await page.evaluate((el) => el.textContent, b)
      if (text?.toLowerCase().includes('walk-in')) {
        await b.click()
        break
      }
    }
    await new Promise((r) => setTimeout(r, 800))
    await page.screenshot({ path: 'tests/admin-walkin-modal.png' })
    console.log('✓ Captured tests/admin-walkin-modal.png')

  } finally {
    await browser.close()
  }
}

checkAdminTabs().catch(console.error)

