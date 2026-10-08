import puppeteer from 'puppeteer-core'

async function check() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
  })
  const page = await browser.newPage()
  await page.goto('http://127.0.0.1:5173/rooms/203', { waitUntil: 'networkidle2' })

  // Find and click 360 Tour button
  const btns = await page.$$('button')
  for (const b of btns) {
    const t = await page.evaluate(el => el.innerText, b)
    if (t.toUpperCase().includes('360° VIRTUAL TOUR')) {
      console.log('Clicking button:', t)
      await b.click()
      break
    }
  }

  await new Promise(r => setTimeout(r, 1000))
  const text = await page.evaluate(() => document.body.innerText)
  console.log('Includes "Coming Soon":', text.includes('Coming Soon'))
  console.log('Includes "Scheduled for Production":', text.includes('Scheduled for Production'))
  console.log('Includes "Production Equirectangular Capture":', text.includes('Production Equirectangular Capture'))
  const canvas = await page.evaluate(() => Boolean(document.querySelector('canvas')))
  console.log('Has Canvas:', canvas)

  // Also check SpaceViewer and PanoramaViewer DOM
  const viewerInfo = await page.evaluate(() => {
    const region = document.querySelector('div[role="region"]')
    const canvasEl = document.querySelector('canvas')
    const headings = Array.from(document.querySelectorAll('h3, h4')).map(h => h.innerText)
    return {
      hasRegion: Boolean(region),
      hasCanvas: Boolean(canvasEl),
      headings,
    }
  })
  console.log('Viewer Info:', viewerInfo)

  await browser.close()
}

check().catch(console.error)
