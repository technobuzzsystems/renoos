const puppeteer = require('puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 640 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'laptop-1024', width: 1024, height: 768 },
];

const PAGES_TO_TEST = [
  { url: 'http://127.0.0.1:5174/', name: 'Home' },
  { url: 'http://127.0.0.1:5174/rooms', name: 'Rooms' },
  { url: 'http://127.0.0.1:5174/rooms/201', name: 'Room201' },
  { url: 'http://127.0.0.1:5174/rooms/203', name: 'Room203' },
];

async function auditResponsiveness() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const issues = [];

  for (const p of PAGES_TO_TEST) {
    for (const vp of VIEWPORTS) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.width < 768, hasTouch: vp.width < 768 });
      try {
        await page.goto(p.url, { waitUntil: 'domcontentloaded' });
        await new Promise((r) => setTimeout(r, 600));

        const evaluation = await page.evaluate(() => {
          const docWidth = document.documentElement.scrollWidth;
          const winWidth = window.innerWidth;
          const hasHorizontalOverflow = docWidth > winWidth;

          // Find specific elements causing horizontal overflow
          const overflowingElements = [];
          if (hasHorizontalOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              const rect = el.getBoundingClientRect();
              if (rect.right > winWidth + 2) {
                const tag = el.tagName.toLowerCase();
                const cls = el.className ? `.${el.className.split(' ').slice(0, 3).join('.')}` : '';
                const id = el.id ? `#${el.id}` : '';
                overflowingElements.push({
                  selector: `${tag}${id}${cls}`,
                  right: rect.right,
                  overflow: rect.right - winWidth,
                });
              }
            }
          }

          return {
            docWidth,
            winWidth,
            hasHorizontalOverflow,
            overflowingElements: overflowingElements.slice(0, 5),
          };
        });

        if (evaluation.hasHorizontalOverflow) {
          issues.push({
            page: p.name,
            viewport: vp.name,
            diff: evaluation.docWidth - evaluation.winWidth,
            elements: evaluation.overflowingElements,
          });
        }
      } catch (err) {
        issues.push({ page: p.name, viewport: vp.name, error: err.message });
      }
    }
  }

  await browser.close();
  console.log('AUDIT RESULTS:');
  console.log(JSON.stringify(issues, null, 2));
}

auditResponsiveness().catch(console.error);

