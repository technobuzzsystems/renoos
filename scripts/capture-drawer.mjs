import puppeteer from 'puppeteer-core'

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const OUTPUT_PATH = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\59ff21c9-6e2d-4b0e-a7d3-459c44c0e792\\sbfarm-mobile-menu-drawer.png'

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 375, height: 812 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
  const btn = await page.$('button[aria-label="Open Navigation Menu"]')
  if (btn) {
    await btn.click()
    await new Promise(r => setTimeout(r, 400))
    await page.screenshot({ path: OUTPUT_PATH })
    console.log('Mobile menu drawer captured!')
  } else {
    console.log('Button not found')
  }
  await browser.close()
}

run().catch(console.error)
