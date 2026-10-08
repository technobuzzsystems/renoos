# ROOM-201 Panorama Assets (Phase 2)

This directory stores 2:1 equirectangular panorama textures for room-201.

## Image Specifications
- **Projection**: Equirectangular (Spherical 360° x 180°)
- **Aspect Ratio**: 2:1 strictly (e.g., 4096 x 2048 or 8192 x 4096)
- **Format**: JPEG or WebP (color profile: sRGB)
- **Target Files**:
  - `bedroom.jpg`
  - `kitchen.jpg`
  - `washroom.jpg`

## Phase 2 Three.js / R3F Integration
The `PanoramaViewer` component loads these files using `THREE.TextureLoader` or `useTexture` and maps them onto an inverted sphere (`scale={[-1, 1, 1]}`) at world origin `[0, 0, 0]`.
