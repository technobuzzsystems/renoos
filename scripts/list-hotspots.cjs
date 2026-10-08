const fs = require('fs');
const content = fs.readFileSync('src/data/rooms.ts', 'utf8');

const lines = content.split('\n');
let currentRoom = '';
let currentSpace = '';
let currentHotspot = null;
const allHotspots = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const trimmed = line.trim();

  if (trimmed.startsWith("id: '201'") || trimmed.startsWith("id: '202'") || trimmed.startsWith("id: '203'")) {
    currentRoom = trimmed.replace("id: '", '').replace("',", '');
  }
  if (trimmed.match(/^(bedroom|kitchen|washroom):\s*\{/)) {
    currentSpace = trimmed.split(':')[0].trim();
  }
  if (trimmed.startsWith("id: 'hs-")) {
    const id = trimmed.replace("id: '", '').replace("',", '');
    currentHotspot = { room: currentRoom, space: currentSpace, id };
  }
  if (currentHotspot) {
    if (trimmed.startsWith('title:')) {
      currentHotspot.title = trimmed.replace("title: '", '').replace("',", '');
    }
    if (trimmed.startsWith('description:')) {
      currentHotspot.description = trimmed.replace("description: '", '').replace("',", '');
    }
    if (trimmed.startsWith('type:')) {
      currentHotspot.type = trimmed.replace("type: '", '').replace("',", '');
    }
    if (trimmed.startsWith('targetSpaceId:')) {
      currentHotspot.targetSpaceId = trimmed.replace("targetSpaceId: '", '').replace("',", '');
    }
    if (trimmed.startsWith('category:')) {
      currentHotspot.category = trimmed.replace("category: '", '').replace("',", '');
    }
    if (trimmed.startsWith('spherical:')) {
      const match = trimmed.match(/yaw:\s*([-\d.]+),\s*pitch:\s*([-\d.]+)/);
      if (match) {
        currentHotspot.yaw = parseFloat(match[1]);
        currentHotspot.pitch = parseFloat(match[2]);
        allHotspots.push({ ...currentHotspot });
        currentHotspot = null;
      }
    }
  }
}

console.log(`Total hotspots found: ${allHotspots.length}`);
console.table(allHotspots);
fs.writeFileSync('tests/current-hotspots.json', JSON.stringify(allHotspots, null, 2));
