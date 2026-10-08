import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const rooms = ['room-201', 'room-202', 'room-203'];
const spaces = ['bedroom', 'kitchen', 'washroom'];

// 1. Panoramas placeholders
for (const room of rooms) {
  const dir = path.join(projectRoot, 'public', 'panoramas', room);
  fs.mkdirSync(dir, { recursive: true });

  const readmeContent = `# ${room.toUpperCase()} Panorama Assets (Phase 2)

This directory stores 2:1 equirectangular panorama textures for ${room}.

## Image Specifications
- **Projection**: Equirectangular (Spherical 360° x 180°)
- **Aspect Ratio**: 2:1 strictly (e.g., 4096 x 2048 or 8192 x 4096)
- **Format**: JPEG or WebP (color profile: sRGB)
- **Target Files**:
  - \`bedroom.jpg\`
  - \`kitchen.jpg\`
  - \`washroom.jpg\`

## Phase 2 Three.js / R3F Integration
The \`PanoramaViewer\` component loads these files using \`THREE.TextureLoader\` or \`useTexture\` and maps them onto an inverted sphere (\`scale={[-1, 1, 1]}\`) at world origin \`[0, 0, 0]\`.
`;

  fs.writeFileSync(path.join(dir, 'README.md'), readmeContent);

  for (const space of spaces) {
    const meta = {
      room,
      space,
      status: "pending_capture",
      aspectRatio: "2:1",
      recommendedResolution: "4096x2048",
      format: "equirectangular_jpg",
      expectedFilePath: `/panoramas/${room}/${space}.jpg`,
      fov: { initial: 75, min: 40, max: 95 },
      notes: "High dynamic range architectural capture scheduled for Phase 2."
    };
    fs.writeFileSync(
      path.join(dir, `${space}.placeholder.json`),
      JSON.stringify(meta, null, 2)
    );
  }
}

// 2. 3D Model placeholders
for (const room of rooms) {
  const dir = path.join(projectRoot, 'public', 'models', room);
  fs.mkdirSync(dir, { recursive: true });

  const readmeContent = `# ${room.toUpperCase()} 3D Model Assets (Phase 2)

This directory stores GLB / GLTF 3D architectural models for ${room}.

## Model Specifications
- **Format**: Binary GLTF (\`.glb\`)
- **Scale**: Real-world meters (1 unit = 1 meter)
- **Geometry**: Optimized low-drawcall meshes with Draco compression
- **PBR Textures**: Roughness/Metallic workflow, max 2K maps
- **Target Files**:
  - \`bedroom.glb\`
  - \`kitchen.glb\`
  - \`washroom.glb\`

## Phase 2 Three.js / R3F Integration
The \`Model3DViewer\` component loads these models via \`useGLTF\` from \`@react-three/drei\` inside a bounded \`Canvas\` with \`OrbitControls\`, lighting presets, and clean memory disposal on unmount.
`;

  fs.writeFileSync(path.join(dir, 'README.md'), readmeContent);

  for (const space of spaces) {
    const meta = {
      room,
      space,
      status: "pending_modeling",
      format: "binary_gltf_glb",
      expectedFilePath: `/models/${room}/${space}.glb`,
      cameraPreset: {
        position: [0, 1.6, 3.5],
        target: [0, 1.2, 0]
      },
      notes: "BIM / CAD architectural GLB export scheduled for Phase 2."
    };
    fs.writeFileSync(
      path.join(dir, `${space}.placeholder.json`),
      JSON.stringify(meta, null, 2)
    );
  }
}

console.log('Created all documented placeholders and README specifications in public/panoramas and public/models.');
