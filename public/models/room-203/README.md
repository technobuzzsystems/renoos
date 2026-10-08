# ROOM-203 3D Model Assets (Phase 2)

This directory stores GLB / GLTF 3D architectural models for room-203.

## Model Specifications
- **Format**: Binary GLTF (`.glb`)
- **Scale**: Real-world meters (1 unit = 1 meter)
- **Geometry**: Optimized low-drawcall meshes with Draco compression
- **PBR Textures**: Roughness/Metallic workflow, max 2K maps
- **Target Files**:
  - `bedroom.glb`
  - `kitchen.glb`
  - `washroom.glb`

## Phase 2 Three.js / R3F Integration
The `Model3DViewer` component loads these models via `useGLTF` from `@react-three/drei` inside a bounded `Canvas` with `OrbitControls`, lighting presets, and clean memory disposal on unmount.
