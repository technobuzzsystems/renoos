# THE AURA — Premium Hotel Virtual-Tour Platform (Phase 1)

A modern, high-end hotel room exploration and virtual-tour demo website built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Three.js / React Three Fiber**.

This project establishes the architectural foundation and luxury UI design for exploring hotel accommodations, individual spaces (Bedroom, Kitchenette, Marble Washroom), with pre-wired integration for **2:1 equirectangular 360° panoramas**, **interactive hotspots**, and **GLB/GLTF 3D spatial models**.

---

## 1. Project Overview

- **Aesthetic**: Minimal, luxurious, editorial hospitality brand design (dark onyx, warm gold brass accents, Cormorant Garamond serif headings, Plus Jakarta Sans body typography).
- **Core Functionality**:
  - Dynamic, data-driven room directory (Room 201, Room 202, Room 203).
  - Multi-space exploration per room: **Bedroom Chamber**, **Artisan Kitchenette**, and **Spa Washroom**.
  - Tri-modal space explorer:
    1. **High-Res Architectural Photography** with feature specifications.
    2. **360° Equirectangular Spherical Projection Rig** (Three.js / R3F Canvas with interactive OrbitControls and hotspot binding).
    3. **3D Spatial Geometry Canvas** (Three.js / R3F CAD volume with real-time rotate, zoom, and pan).
  - High-resolution photo gallery with accessible lightbox and keyboard navigation (Esc, Arrow keys).
  - Seamless inter-room switcher allowing guests to explore adjacent suites without reloading.
  - Zero backend dependencies in Phase 1 (no databases, no auth, client-ready demo).

---

## 2. Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8 (ESM, Code-splitting, Rolldown engine)
- **Styling**: Tailwind CSS + PostCSS + Autoprefixer
- **Typography**: Cormorant Garamond (luxury editorial serif) + Plus Jakarta Sans (high-legibility geometric sans)
- **Icons**: Lucide React
- **3D & Canvas Engine**:
  - Three.js
  - `@react-three/fiber` (R3F)
  - `@react-three/drei`
- **Routing**: React Router v7 (`react-router-dom`)
- **Animation**: Framer Motion & CSS custom keyframes

---

## 3. Folder Structure

```
hotel/
├── public/
│   ├── favicon.svg
│   ├── images/
│   │   ├── hero.jpg                 # Hero LCP background
│   │   ├── about.jpg                # Architectural narrative image
│   │   ├── rooms/                   # High-res room photography
│   │   │   ├── room-201-*.jpg       # Room 201 spaces & gallery
│   │   │   ├── room-202-*.jpg       # Room 202 spaces & gallery
│   │   │   └── room-203-*.jpg       # Room 203 spaces & gallery
│   │   └── gallery/                 # Hotel amenities (pool, spa, dining, lounge)
│   ├── panoramas/                   # 2:1 Equirectangular textures (Phase 2)
│   │   ├── room-201/                # bedroom, kitchen, washroom
│   │   ├── room-202/                # bedroom, kitchen, washroom
│   │   └── room-203/                # bedroom, kitchen, washroom
│   └── models/                      # GLB / GLTF 3D models (Phase 2)
│       ├── room-201/                # bedroom, kitchen, washroom
│       ├── room-202/                # bedroom, kitchen, washroom
│       └── room-203/                # bedroom, kitchen, washroom
│
├── src/
│   ├── types/                       # Reusable TypeScript interfaces
│   │   ├── room.ts                  # Room, Amenity, RoomImages
│   │   ├── space.ts                 # Space, SpaceType, SpaceImages
│   │   ├── panorama.ts              # PanoramaConfig, FOV bounds
│   │   ├── model3d.ts               # Model3DConfig, camera presets
│   │   ├── hotspot.ts               # Hotspot, coordinates, types
│   │   └── index.ts                 # Type barrel export
│   │
│   ├── data/
│   │   └── rooms.ts                 # Central data for Room 201, 202, 203
│   │
│   ├── components/
│   │   ├── common/                  # Navbar, Footer, SectionHeader, HeroSection, CTASection, ScrollToTop
│   │   ├── rooms/                   # RoomCard, RoomGrid, RoomDetails, AmenityList, Gallery, SpaceSelector, RoomSwitcher
│   │   ├── spaces/                  # SpaceViewer (Tri-modal exploration coordinator)
│   │   ├── panorama/                # PanoramaViewer (Three.js equirectangular sphere)
│   │   ├── model3d/                 # Model3DViewer (Three.js CAD bounding box + OrbitControls)
│   │   └── hotspots/                # HotspotPin, HotspotList, HotspotOverlay
│   │
│   ├── pages/
│   │   ├── HomePage.tsx             # Hotel landing, hero, intro, featured rooms, experiences, CTA
│   │   ├── RoomsPage.tsx            # All rooms directory, filter tabs, architectural matrix table
│   │   ├── RoomDetailPage.tsx       # Dynamic route handler driven entirely by room data
│   │   └── NotFoundPage.tsx         # Luxury 404 handler
│   │
│   ├── lib/
│   │   └── utils.ts                 # cn (clsx + twMerge), formatting helpers
│   ├── App.tsx                      # App router with lazy-loaded route chunks
│   ├── main.tsx                     # React root mount
│   └── index.css                    # Tailwind base, utilities, custom luxury scrollbar
│
├── scripts/
│   ├── download-assets.mjs          # Local high-res asset fetcher
│   └── generate-placeholders.mjs    # Documented placeholder & specification generator
├── package.json
├── tailwind.config.js
├── tsconfig.app.json
├── vite.config.ts
└── README.md
```

---

## 4. Installation & Local Development

### Prerequisites
- Node.js `v18.0.0` or later (tested on Node v24)
- npm `v9.0.0` or later

### Install Dependencies
```bash
npm install
```

### Run Locally (Development Server)
```bash
npm run dev
```
Open your browser to `http://localhost:5173`.

### Production Build
```bash
npm run build
```
Generates an optimized production bundle inside `dist/` with chunked vendor packages and code-split routes.

### Preview Production Build
```bash
npm run preview
```

---

## 5. Data Architecture & Adding New Rooms

Room data is completely decoupled from the UI components. All accommodations are defined in:

```
src/data/rooms.ts
```

### How to Add Room 204
To add a new room (e.g. `Room 204 — Presidential Penthouse`), simply append a new object to the `ROOMS_DATA` array in `src/data/rooms.ts`. **No component or page code needs to be modified or duplicated.**

```typescript
{
  id: '204',
  roomNumber: '204',
  name: 'Presidential Penthouse',
  tagline: 'Private rooftop pavilion with infinity edge plunge pool',
  category: 'Presidential Suite',
  description: '...',
  longDescription: '...',
  area: 145,
  guestCapacity: 4,
  bedType: 'Grand Emperor Bed',
  viewType: '360° Alpine Summit Vista',
  floor: 'Floor 4 — Apex Tower',
  previewImages: {
    hero: '/images/rooms/room-204-main.jpg',
    card: '/images/rooms/room-204-main.jpg',
    thumbnail: '/images/rooms/room-204-main.jpg',
    gallery: [ ... ]
  },
  amenities: [ ... ],
  spaces: {
    bedroom: { ... },
    kitchen: { ... },
    washroom: { ... },
  }
}
```

The home page, rooms directory, filter tabs, comparison matrix, route `/rooms/204`, space explorer, and inter-room switcher will automatically recognize and display Room 204!

---

## 6. Asset Guidelines

### Room & Gallery Images
- **Location**: `public/images/rooms/` and `public/images/gallery/`
- **Format**: High-resolution JPG or WebP (1400px–1920px wide, quality 85).
- **Naming Convention**: `room-[number]-[space].jpg` (e.g. `room-201-bedroom.jpg`).

### 360° Panorama Files (Phase 2)
- **Location**: `public/panoramas/room-[number]/`
  - `public/panoramas/room-201/bedroom.jpg`
  - `public/panoramas/room-201/kitchen.jpg`
  - `public/panoramas/room-201/washroom.jpg`
- **Projection**: Equirectangular (Spherical 360° horizontal × 180° vertical).
- **Aspect Ratio**: **2:1 strictly** (e.g., 4096 × 2048 or 8192 × 4096).
- **Color Profile**: sRGB.

### 3D Model Files (Phase 2)
- **Location**: `public/models/room-[number]/`
  - `public/models/room-201/bedroom.glb`
  - `public/models/room-201/kitchen.glb`
  - `public/models/room-201/washroom.glb`
- **Format**: Binary GLTF (`.glb`).
- **Scale**: Real-world meters (1 Three.js unit = 1 meter).
- **Optimization**: Draco compressed meshes, max 2K PBR metallic/roughness textures.

---

## 7. How the 360° & 3D Next Phases Plug In

The current architecture is purposely engineered so that Phase 2 can be enabled with **zero rewrites** to the `RoomDetails` or `SpaceViewer` components:

1. **Panorama Texture Mapping**:
   In `src/components/panorama/PanoramaViewer.tsx`, the component currently renders a wireframe spherical projection cage inside a responsive Three.js R3F Canvas. In Phase 2:
   ```tsx
   // Replace wireframe with Drei useTexture:
   const texture = useTexture(config.imageSrc)
   <Sphere args={[500, 60, 40]} scale={[-1, 1, 1]}>
     <meshBasicMaterial map={texture} side={THREE.BackSide} />
   </Sphere>
   ```
2. **Interactive Hotspot Projection**:
   Hotspot coordinates are already stored as `{ yaw, pitch }` in `config.hotspots`. In Phase 2, convert yaw/pitch to 3D Cartesian coordinates (`x = R * cos(lat) * sin(lon)`) and render interactive `<Html>` pins from `@react-three/drei`.
3. **GLB Model Loading**:
   In `src/components/model3d/Model3DViewer.tsx`, the `Canvas` and `OrbitControls` are already mounted. In Phase 2:
   ```tsx
   const { scene } = useGLTF(config.modelSrc)
   <primitive object={scene} />
   ```

---

## 8. Accessibility & Performance Highlights

- **LCP Optimization**: The hero image specifies `fetchPriority="high"` without lazy loading, while offscreen gallery images utilize native `loading="lazy"`.
- **Code-Splitting**: Routes are chunked using `React.lazy` and `Suspense`, isolating Three.js and Drei so initial home page load remains lightweight.
- **Keyboard Navigation**: The photo gallery lightbox supports `Escape` to close, and `ArrowLeft` / `ArrowRight` to cycle through photographs.
- **Semantic HTML**: Fully semantic `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` elements with ARIA tablist/tab patterns for space switching.
