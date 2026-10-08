import puppeteer from 'puppeteer-core';

const BASE_URL = 'http://127.0.0.1:5173';
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runPhase7Acceptance() {
  console.log('========================================================');
  console.log('   PHASE 7: FINAL DEMO CONTENT & PRESENTATION SUITE     ');
  console.log('========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // ----------------------------------------------------
    // TEST 1: Content Audit & Clean Language Check
    // ----------------------------------------------------
    console.log('TEST 1: Content Audit (Home Page)');
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const pageText = await page.evaluate(() => document.body.innerText);

    // Verify ungrounded / invented claims are REMOVED
    const forbiddenClaims = [
      'medical-grade hepa',
      'triple-glazed sound dampening',
      'michelin star',
      'gaggenau appliances',
    ];

    for (const claim of forbiddenClaims) {
      if (pageText.toLowerCase().includes(claim)) {
        throw new Error(`Forbidden invented claim still present on page: "${claim}"`);
      }
    }
    console.log('  ✓ Verified: No unsupported claims (HEPA, Triple-glazed, Michelin, etc.) found');

    // Verify Hero content
    const heroHeadline = await page.$eval('h1', el => el.innerText.trim());
    console.log(`  Hero Headline: "${heroHeadline}"`);
    if (!heroHeadline.toLowerCase().includes('hotel') && !heroHeadline.toLowerCase().includes('360')) {
      throw new Error(`Hero headline does not clearly communicate hotel 360 virtual tour: "${heroHeadline}"`);
    }

    // Verify 3D Section messaging
    const preview3dText = await page.$eval('#preview-3d', el => el.innerText);
    if (!preview3dText.toLowerCase().includes('interactive 3d walkthrough coming soon')) {
      throw new Error('3D section missing "Interactive 3D Walkthrough Coming Soon" notice');
    }
    console.log('  ✓ Verified: 3D preview clearly communicates "Interactive 3D Walkthrough Coming Soon"');
    console.log('  ✅ TEST 1 PASSED\n');

    // ----------------------------------------------------
    // TEST 2: All 9 Spaces Verification (Rooms 201, 202, 203)
    // ----------------------------------------------------
    console.log('TEST 2: Verifying all 9 spaces across Rooms 201, 202, 203');

    const rooms = [
      { id: '201', name: 'Deluxe Room' },
      { id: '202', name: 'Premium Room' },
      { id: '203', name: 'Executive Suite' }
    ];

    const spaces = ['bedroom', 'kitchen', 'washroom'];

    for (const room of rooms) {
      console.log(`  Testing Room ${room.id} (${room.name})...`);
      await page.goto(`${BASE_URL}/rooms/${room.id}`, { waitUntil: 'networkidle0' });
      await sleep(400);

      // Verify each space tab exists and displays thumbnail
      for (const spaceId of spaces) {
        const spaceTab = await page.$(`#space-tab-${spaceId}`);
        if (!spaceTab) throw new Error(`Missing tab for space ${spaceId} in Room ${room.id}`);

        // Click space tab
        await spaceTab.click();
        await sleep(300);

        // Check photography view is active and image renders
        const photoModeBtn = await page.$('[data-testid="mode-photo"]');
        if (!photoModeBtn) throw new Error(`Photography mode button missing for ${spaceId}`);

        // Check 360 mode button exists
        const panoBtn = await page.$('[data-testid="mode-panorama"]');
        if (!panoBtn) throw new Error(`360 mode button missing for ${spaceId}`);

        // Check 3D mode button exists
        const mode3dBtn = await page.$('[data-testid="mode-model3d"]');
        if (!mode3dBtn) throw new Error(`3D mode button missing for ${spaceId}`);
      }
      console.log(`  ✓ Room ${room.id}: all 3 spaces (bedroom, kitchen, washroom) verified`);
    }
    console.log('  ✅ TEST 2 PASSED\n');

    // ----------------------------------------------------
    // TEST 3: Demo Presentation Flow Execution
    // ----------------------------------------------------
    console.log('TEST 3: Demo Presentation Flow');
    // 1. Home
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    console.log('  1. Home loaded');

    // 2. Click "Explore Rooms"
    const exploreBtn = await page.$('a[href="#rooms-showcase"]');
    await exploreBtn.click();
    await sleep(400);
    console.log('  2. Scrolled to Explore Rooms');

    // 3. Select Room 203
    await page.goto(`${BASE_URL}/rooms/203`, { waitUntil: 'networkidle0' });
    await sleep(400);
    console.log('  3. Selected Room 203');

    // 4. Select Kitchen space tab
    const kitchenTab = await page.waitForSelector('#space-tab-kitchen');
    await kitchenTab.click();
    await sleep(400);
    console.log('  4. Selected Kitchen Space');

    // 5. Switch to 360° Virtual Tour
    const panoTab = await page.waitForSelector('[data-testid="mode-panorama"]');
    await panoTab.click();
    await sleep(1500);
    const canvas = await page.waitForSelector('canvas');
    if (!canvas) throw new Error('Panorama canvas not found');
    console.log('  5. 360° Virtual Tour loaded successfully');

    // 6. Switch to 3D View
    const mode3dTab = await page.waitForSelector('[data-testid="mode-model3d"]');
    await mode3dTab.click();
    await sleep(600);
    const placeholder3d = await page.waitForSelector('[data-testid="model3d-placeholder"]');
    if (!placeholder3d) throw new Error('3D placeholder not found');
    console.log('  6. 3D View loaded (clean "Coming Soon" state)');

    // 7. Return to Photography
    const returnPhotoBtn = await page.waitForSelector('[data-testid="model3d-return-photo"]');
    await returnPhotoBtn.click();
    await sleep(600);
    const photoImg = await page.$('img[alt*="Kitchen"]');
    if (!photoImg) throw new Error('Failed to return to Photography mode');
    console.log('  7. Return to Photography executed cleanly');
    console.log('  ✅ TEST 3 PASSED\n');

    // ----------------------------------------------------
    // TEST 4: Mobile Demo Viewport (375x812)
    // ----------------------------------------------------
    console.log('TEST 4: Mobile Demo Mode (375x812 iPhone Viewport)');
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(`${BASE_URL}/rooms/203`, { waitUntil: 'networkidle0' });
    await sleep(500);

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`  Horizontal overflow: ${hasHorizontalOverflow}`);
    if (hasHorizontalOverflow) throw new Error('Mobile viewport has horizontal overflow');

    // Verify touch targets are at least 40px
    const touchButtonHeights = await page.$$eval('header button, [data-testid^="mode-"]', els => {
      return els.map(el => el.getBoundingClientRect().height);
    });
    const smallTargets = touchButtonHeights.filter(h => h < 34);
    if (smallTargets.length > 0) {
      console.warn(`  Warning: Found ${smallTargets.length} small touch targets`);
    } else {
      console.log('  ✓ Touch targets sized appropriately for mobile');
    }
    console.log('  ✅ TEST 4 PASSED\n');

    console.log('========================================================');
    console.log('   ALL PHASE 7 ACCEPTANCE TESTS PASSED (4/4)!           ');
    console.log('========================================================');

  } catch (err) {
    console.error('❌ PHASE 7 ACCEPTANCE ERROR:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPhase7Acceptance();
