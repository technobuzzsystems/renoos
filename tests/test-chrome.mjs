import puppeteer from 'puppeteer-core'

async function checkChrome() {
  console.log('Launching Chrome...')
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
  await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })
  const title = await page.title()
  console.log('Page Title:', title)

  // Check WebGL support
  const webglSupport = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    return Boolean(gl)
  })
  console.log('WebGL available:', webglSupport)

  await browser.close()
  console.log('Chrome test complete.')
}

checkChrome().catch(console.error)
