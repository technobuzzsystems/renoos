import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://127.0.0.1:5173';

async function runPhase6Acceptance() {
  console.log('========================================================');
  console.log('   PHASE 6: CLIENT-FACING UI/UX POLISH ACCEPTANCE SUITE  ');
  console.log('========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => errors.push(`PageError: ${err.message}`));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`ConsoleError: ${msg.text()}`);
  });

  try {
    // TEST 1: Home Page Flow & Anchors
    console.log('TEST 1: Home Page Flow & Anchors');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 });

    const heroTitle = await page.$eval('h1', el => el.textContent.trim());
    console.log(`  Hero Headline: "${heroTitle}"`);

    // Verify Primary & Secondary Hero CTAs
    const exploreRoomsCta = await page.$('a[href="#rooms-showcase"]');
    const view360Cta = await page.$('a[href="/rooms/203"]');
    if (!exploreRoomsCta || !view360Cta) throw new Error('Hero CTA buttons missing');
    console.log('  ✓ Hero CTAs verified ("Explore Rooms" & "View 360° Experience")');

    // Verify Page Flow Sections
    const hotelIntro = await page.$('#hotel-intro');
    const roomsShowcase = await page.$('#rooms-showcase');
    const virtualTour = await page.$('#virtual-tour');
    const preview3d = await page.$('#preview-3d');
    const hotelExperience = await page.$('#hotel-experience');
    
    if (!hotelIntro) throw new Error('Section #hotel-intro missing');
    if (!roomsShowcase) throw new Error('Section #rooms-showcase missing');
    if (!virtualTour) throw new Error('Section #virtual-tour missing');
    if (!preview3d) throw new Error('Section #preview-3d missing');
    if (!hotelExperience) throw new Error('Section #hotel-experience missing');
    console.log('  ✓ All 5 major homepage sections verified in DOM');

    // Verify Featured Virtual Tour Teaser button
    const launchTourBtn = await page.$('a[href="/rooms/203"]');
    if (!launchTourBtn) throw new Error('Launch Room 203 Virtual Tour button missing');
    console.log('  ✓ Virtual tour teaser button verified');

    // Verify Final CTA section
    const ctaHeadlines = await page.$$eval('h2', els => els.map(e => e.textContent.trim()));
    console.log(`  Found headlines on page:`, ctaHeadlines);
    const hasCtaHeadline = ctaHeadlines.includes('Experience the Space Before You Arrive');
    if (!hasCtaHeadline) {
      throw new Error(`Expected CTA headline "Experience the Space Before You Arrive" not found`);
    }
    console.log('  ✓ Final CTA section verified ("Experience the Space Before You Arrive")');
    console.log('  ✅ TEST 1 PASSED\n');

    // TEST 2: Navbar Functionality & Sticky State
    console.log('TEST 2: Navbar & Navigation Links');
    const navRoomsLink = await page.$('header nav a[href="/rooms"]');
    const navTourLink = await page.$('header nav a[href="/rooms/203"]');
    if (!navRoomsLink || !navTourLink) throw new Error('Header navigation links missing');
    console.log('  ✓ Desktop navigation links verified');

    // Scroll down to test sticky translucent state
    await page.evaluate(() => window.scrollTo(0, 500));
    await new Promise(r => setTimeout(r, 200));
    const headerClass = await page.$eval('header', el => el.className);
    if (!headerClass.includes('backdrop-blur')) {
      throw new Error('Header did not apply backdrop-blur on scroll');
    }
    console.log('  ✓ Navbar sticky backdrop blur active on scroll');
    console.log('  ✅ TEST 2 PASSED\n');

    // TEST 3: Room Details Page & Visual Polish
    console.log('TEST 3: Room Details Page (Room 203)');
    await page.goto(`${BASE_URL}/rooms/203`, { waitUntil: 'networkidle0', timeout: 15000 });

    // Verify Header Back Button
    const backBtn = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('a[href="/rooms"]')).find(a => a.textContent.includes('Back to All Suites'));
      return btn ? btn.textContent.trim() : null;
    });
    console.log(`  Back Button text: "${backBtn}"`);
    if (!backBtn) throw new Error('Back to All Suites button missing');

    // Verify Room Metadata Row
    const metadataText = await page.evaluate(() => document.body.textContent);
    if (!metadataText.includes('110 m²') || !metadataText.includes('Executive Suite')) {
      throw new Error('Room 203 metadata (110 m² / Executive Suite) missing from page');
    }
    console.log('  ✓ Room 203 title ("Executive Suite") and metadata (110 m²) verified');

    // Verify Segmented View Mode Controls
    const photoTab = await page.$('[data-testid="mode-photo"]');
    const panoramaTab = await page.$('[data-testid="mode-panorama"]');
    const model3dTab = await page.$('[data-testid="mode-model3d"]');
    if (!photoTab || !panoramaTab || !model3dTab) {
      throw new Error('Segmented view mode pills missing');
    }
    console.log('  ✓ Segmented control pills [ Photography | 360° Virtual Tour | 3D View ] verified');

    // Verify Space Selector with Thumbnails
    const spaceThumbnails = await page.$$('[role="tab"] img');
    console.log(`  Space selector thumbnail count: ${spaceThumbnails.length}`);
    if (spaceThumbnails.length < 3) throw new Error('Expected space selector thumbnails for all 3 spaces');
    console.log('  ✓ Space selector tab previews verified');
    console.log('  ✅ TEST 3 PASSED\n');

    // TEST 4: Mobile Responsiveness & Drawer
    console.log('TEST 4: Mobile Responsiveness (375x812 iPhone Viewport)');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0', timeout: 15000 });

    // Check horizontal overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`  Horizontal overflow: ${hasHorizontalOverflow}`);
    if (hasHorizontalOverflow) throw new Error('Mobile horizontal overflow detected');

    // Open Mobile Drawer
    const mobileMenuBtn = await page.$('button[aria-label*="Navigation Menu" i]');
    if (!mobileMenuBtn) throw new Error('Mobile menu button not found');
    await mobileMenuBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const drawerVisible = await page.evaluate(() => {
      const drawer = document.querySelector('header .md\\:hidden');
      return drawer !== null;
    });
    console.log(`  Mobile drawer opened: ${drawerVisible}`);
    if (!drawerVisible) throw new Error('Mobile drawer did not open');
    console.log('  ✅ TEST 4 PASSED\n');

    console.log('========================================================');
    console.log('   ALL PHASE 6 ACCEPTANCE TESTS PASSED (4/4)!           ');
    console.log('========================================================');

  } catch (err) {
    console.error('❌ PHASE 6 ACCEPTANCE ERROR:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase6Acceptance();
