import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else {
      results.push(filePath.replace(/\\/g, '/'));
    }
  });
  return results;
}

const publicFiles = walk('./public');
console.log('Total files in public/:', publicFiles.length);

const srcFiles = walk('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const assetRegex = /['"](\/(images|panoramas|models)\/[^'"]+)['"]/g;

const referenced = new Set();
srcFiles.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = assetRegex.exec(content)) !== null) {
    referenced.add(match[1]);
  }
});

console.log('Total unique referenced assets in src/:', referenced.size);

let missing = [];
referenced.forEach(ref => {
  const diskPath = path.join('./public', ref).replace(/\\/g, '/');
  if (!fs.existsSync(diskPath)) {
    missing.push({ ref, diskPath });
  }
});

console.log('Missing referenced assets:', missing.length);
if (missing.length > 0) {
  console.log('Missing assets details:', missing);
} else {
  console.log('All referenced assets exist on disk!');
}

const imageFiles = publicFiles.filter(f => f.startsWith('public/images/'));
let unreferenced = [];
imageFiles.forEach(f => {
  const rel = f.replace(/^public/, '');
  if (!referenced.has(rel)) {
    unreferenced.push(rel);
  }
});
console.log('Image files in public:', imageFiles.length);
console.log('Unreferenced image files in public:', unreferenced);
