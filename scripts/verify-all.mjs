import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

async function testRoutes() {
  console.log('--- 1. Testing Live HTTP Server Routes ---');
  const baseUrl = 'http://127.0.0.1:5173';
  const routes = [
    { path: '/', expectedStatus: 200 },
    { path: '/rooms', expectedStatus: 200 },
    { path: '/rooms/201', expectedStatus: 200 },
    { path: '/rooms/202', expectedStatus: 200 },
    { path: '/rooms/203', expectedStatus: 200 },
    { path: '/rooms/999', expectedStatus: 200 }, // SPA route handles 404 in React
    { path: '/unknown-route', expectedStatus: 200 }
  ];

  for (const r of routes) {
    try {
      const res = await fetch(baseUrl + r.path);
      const html = await res.text();
      const hasRoot = html.includes('id="root"');
      console.log(`Route ${r.path.padEnd(16)} -> Status ${res.status} (SPA mounted: ${hasRoot})`);
      if (res.status !== r.expectedStatus || !hasRoot) {
        throw new Error(`Failed on route ${r.path}`);
      }
    } catch (e) {
      console.error(`Error connecting to ${r.path}:`, e.message);
    }
  }
}

async function testRoomData() {
  console.log('\n--- 2. Inspecting Room Dataset & Space Consistency ---');
  // Read rooms.ts
  const roomsPath = path.join(root, 'src', 'data', 'rooms.ts');
  const content = fs.readFileSync(roomsPath, 'utf8');

  // Verify all 3 rooms exist
  const roomIds = ['201', '202', '203'];
  for (const id of roomIds) {
    const hasRoom = content.includes(`id: '${id}'`);
    console.log(`Room ${id} present in rooms.ts:`, hasRoom);
  }

  // Check categories
  const categories = ['Deluxe', 'Premium', 'Executive Suite'];
  for (const cat of categories) {
    const hasCat = content.includes(`category: '${cat}'`);
    console.log(`Category "${cat}" present:`, hasCat);
  }

  // Check no 'Penthouse' category
  const hasPenthouseCat = /category:\s*['"]Penthouse['"]/i.test(content);
  console.log(`No "Penthouse" category assigned:`, !hasPenthouseCat);

  // Check spaces for each room
  const expectedSpaces = ['bedroom', 'kitchen', 'washroom'];
  for (const space of expectedSpaces) {
    const spaceRegex = new RegExp(`type:\\s*['"]${space}['"]`, 'g');
    const matches = content.match(spaceRegex);
    console.log(`Space type "${space}" defined in all 3 rooms:`, matches?.length === 3);
  }
}

async function testAssetIntegrity() {
  console.log('\n--- 3. Verifying Local Asset Existence ---');
  const roomsPath = path.join(root, 'src', 'data', 'rooms.ts');
  const content = fs.readFileSync(roomsPath, 'utf8');

  // Extract all /images/ referenced
  const regex = /['"](\/images\/[^'"]+)['"]/g;
  let match;
  const images = new Set();
  while ((match = regex.exec(content)) !== null) {
    images.add(match[1]);
  }

  let allExist = true;
  for (const img of images) {
    const fullPath = path.join(root, 'public', img);
    const exists = fs.existsSync(fullPath);
    if (!exists) {
      console.error(`Missing image: ${img}`);
      allExist = false;
    }
  }
  console.log(`All ${images.size} referenced room images exist on disk:`, allExist);
}

async function run() {
  await testRoutes();
  await testRoomData();
  await testAssetIntegrity();
  console.log('\nAll QA verification checks executed.');
}

run();
