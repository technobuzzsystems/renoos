import puppeteer from 'puppeteer-core'

async function checkAdminUI() {
  console.log('Launching headless Chrome to verify /admin page...')
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1440,900',
    ],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })

    // 1. Visit /admin
    console.log('Navigating to http://127.0.0.1:5173/admin ...')
    await page.goto('http://127.0.0.1:5173/admin', { waitUntil: 'networkidle2' })

    // Check login view presence
    const loginHeader = await page.$eval('h1, h2', (el) => el.textContent)
    console.log('Header text found:', loginHeader)

    // Capture screenshot of login screen
    await page.screenshot({ path: 'tests/admin-login-screen.png' })
    console.log('Captured tests/admin-login-screen.png')

    // Click demo key button to prefill & login
    const demoButton = await page.$('button ::-p-text(Demo Key)') || await page.$('button[type="button"]')
    // Fill passcode input
    await page.type('input[type="password"]', 'renoos2026')
    
    // Submit form
    await page.click('button[type="submit"]')
    await new Promise((r) => setTimeout(r, 2000))

    // Capture dashboard screen
    await page.screenshot({ path: 'tests/admin-dashboard-screen.png' })
    console.log('Captured tests/admin-dashboard-screen.png')

    const hasDashboard = await page.evaluate(() => {
      return document.body.innerText.includes('PMS') || document.body.innerText.includes('Executive Overview') || document.body.innerText.includes('RENOOS')
    })
    console.log('Admin Dashboard active:', hasDashboard)
  } finally {
    await browser.close()
  }
}

checkAdminUI().catch(console.error)
