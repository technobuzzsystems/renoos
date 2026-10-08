import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const assets = [
  // General & Hero
  {
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85',
    dest: 'public/images/hero.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/about.jpg'
  },

  // Room 201 (Deluxe Room - Warm minimalist luxury)
  {
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-main.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-bedroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-kitchen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-washroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-gallery-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-201-gallery-2.jpg'
  },

  // Room 202 (Premium Room - Contemporary elegance & panoramic balcony)
  {
    url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-main.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-bedroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-kitchen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-washroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-gallery-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-202-gallery-2.jpg'
  },

  // Room 203 (Executive Suite - Bespoke luxury penthouse aesthetic)
  {
    url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-main.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-bedroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-kitchen.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-washroom.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-gallery-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/rooms/room-203-gallery-2.jpg'
  },

  // Hotel Gallery
  {
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/gallery/infinity-pool.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/gallery/spa-wellness.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/gallery/michelin-dining.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1506059612708-99d6c258160e?auto=format&fit=crop&w=1400&q=85',
    dest: 'public/images/gallery/terrace-lounge.jpg'
  }
];

async function downloadFile(url, destPath) {
  const fullPath = path.resolve(projectRoot, destPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  fs.writeFileSync(fullPath, Buffer.from(arrayBuffer));
  console.log(`Saved: ${destPath} (${Math.round(arrayBuffer.byteLength / 1024)} KB)`);
}

async function run() {
  console.log('Downloading curated luxury hotel assets...');
  for (const item of assets) {
    try {
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }
  console.log('All image assets processed successfully.');
}

run();
