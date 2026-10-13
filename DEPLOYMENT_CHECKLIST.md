# Renoos Hotel — Production Deployment Checklist & Audit Report

**Brand Name:** Renoos Hotel  
**Project Root:** `S:\renoos`  
**Generated Date:** 2026-10-12  
**Target Architecture:** Node.js Express/HTTP Full-Stack Service (Vite React 19 Frontend + TypeScript API Backend)

---

## 1. System Architecture & Audit Findings

### 1.1 Architecture Overview
- **Frontend:** React 19 SPA with TypeScript, Tailwind CSS, Three.js (@react-three/fiber), Lucide icons, and React Router v7.
- **Backend:** Node.js HTTP service with TypeScript API handlers (`server/index.mjs` & `server/apiHandler.ts`).
- **Data Persistence:** Atomic JSON filesystem storage (`data/bookings.json`, `data/users.json`, `data/rooms_config.json`) with `fs.renameSync` transaction safety.
- **Asset Pipeline:** Vite v8.3 bundling static assets with chunks for Three.js and React Three Fiber.
- **Audio System:** 33 authentic prerecorded multilingual voice recordings across English, Hindi, and Marathi, including specific room-selection greetings for Rooms 201–205.

### 1.2 Production-Ready Scripts
```bash
# 1. Install production dependencies
npm install

# 2. Production build (TypeScript compilation + Vite asset bundling)
npm run build

# 3. Start production server (serves API & SPA fallback on $PORT and $HOST)
npm run start
```

---

## 2. Security & Data Integrity Audit

| Component | Audit Status | Production Implementation |
| :--- | :--- | :--- |
| **Price & Tax Validation** | Passed | Calculated strictly on server in `server/apiHandler.ts`. Client cannot tamper with room tariffs, taxes (12% GST), or total amounts. |
| **Booking Overlaps** | Passed | Server verifies `datesOverlap(checkIn, checkOut)` against confirmed and checked-in reservations before saving. Returns HTTP 409 Conflict with details. |
| **Guest Counts** | Passed | Sanitized and bounded server-side (1–10 adults, 0–10 children). |
| **Admin Authentication** | Passed | Constant-time comparison (`crypto.timingSafeEqual`) against `ADMIN_PASSCODE` env var. Rate limited (max 5 failed attempts, 15-min lockout). Cryptographic 32-byte Bearer tokens. |
| **Secrets in Git** | Passed | `.env` and `.env.*` excluded via `.gitignore`. `.env.example` created with placeholders only. |
| **Directory Traversal** | Passed | Path traversal checks in `server/index.mjs` ensure only files within `dist/` can be served. |

---

## 3. Storage & Persistence Evaluation

> [!IMPORTANT]
> The current persistence layer uses JSON files in the `data/` directory (`bookings.json`, `users.json`, `rooms_config.json`).
> - **Persistent Disk Requirement:** If deploying to serverless or ephemeral container hosts (e.g. basic Vercel, free Render web services without disk), files written to disk are wiped on dyno restart or redeploy.
> - **Recommended Hosting:** Use a Persistent Disk (Render Disks, Railway Volume, AWS EBS, or a Linux VPS) mounted at `/data` or project root `data/`.
> - **Migration Path (Phase 2):** For horizontal scaling across multiple container replicas, migrate `server/db.ts` to PostgreSQL or MongoDB with zero changes to frontend code.

---

## 4. Multilingual Receptionist Audio Audit

- [x] **Languages Supported:** English (`en`), Marathi (`mr`), Hindi (`hi`).
- [x] **Audio Assets Verified:**
  - `public/audio/English/` (11 high-fidelity receptionist recordings)
  - `public/audio/Hindi/` (11 high-fidelity receptionist recordings)
  - `public/audio/Marathi/` (11 high-fidelity receptionist recordings)
  - `public/audio/room no/` (Rooms 201–205 announcement recordings in English, Hindi, and Marathi)
- [x] **Autoplay Compliance:** User-gesture gated with fallback to visual subtitles and manual replay pills.
- [x] **Rerender Deduplication:** `hasGreetedRef` and `hasAnnouncedInitialRoomRef` prevent loops on component re-renders.
- [x] **Personalized Greetings:** Logged-in guests are greeted by name in their active language; unauthenticated guests receive a welcome greeting.
- [x] **Honest Labeling:** Clearly identified as authentic prerecorded receptionist voice guide (no misleading claims of dynamic AI generation).

---

## 5. Room & Panorama Experience Audit

- [x] **Brand Consistency:** "Renoos Hotel" consistent across all views, HUDs, modals, and invoices.
- [x] **Room Views:** Kitchen options removed from active room views. Only **Bedroom** and **Bathroom** views are displayed.
- [x] **3D Models:** Planned for future phase; non-blocking placeholders preserved without broken WebGL crashes.
- [x] **360° Panoramas:**
  - Exterior Entrance: `Tropical Sunset Resort Entrance.png` (Wide angle 90° FOV)
  - Lakeside Garden: `garden.png` (82° FOV with swing and lounge hotspots)
  - Grand Reception: `Gemini_Generated_Image_w07y9ew07y9ew07y.png` (Upscaled to 4096x2048 4K Lanczos, 85° wide angle FOV, linear filtering, anti-scattering zoom bounds `minFov: 48`).
  - Rooms 201–205: High-resolution equirectangular tours for bedroom and bathroom spaces.
- [x] **Hotspots & Navigation:** Bidirectional links between Exterior, Garden, Reception, and Room Suites.

---

## 6. SEO, Performance & Assets Audit

- [x] **Favicon:** `public/favicon.svg` with official Renoos Hotel monogram.
- [x] **Robots Configuration:** `public/robots.txt` allowing public routes and disallowing `/admin` and `/api/`.
- [x] **Sitemap:** `public/sitemap.xml` configured for search indexing.
- [x] **Metadata:** Open Graph (`og:*`) and Twitter Card (`twitter:*`) metadata added to `index.html`.
- [x] **Health Check:** `GET /health` and `GET /api/health` return HTTP 200 with uptime and service status.

---

## 7. Recommended Hosting Platforms & Deployment Steps

### Option A: Render (Recommended for Fast Cloud Deployment)
1. Push repository to GitHub or GitLab.
2. In Render Dashboard, click **New + Web Service**.
3. Set **Runtime:** Node.
4. Set **Build Command:** `npm run build`
5. Set **Start Command:** `npm run start`
6. Add Environment Variables from `.env.example`:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `ADMIN_PASSCODE=<your_strong_passcode>`
   - `ADMIN_SESSION_SECRET=<random_secret_key>`
7. Add a **Persistent Disk** mounted at `/app/data` to ensure reservation records persist across redeploys.

### Option B: Railway
1. Create New Project from GitHub repo.
2. Add a persistent volume mounted at `/data`.
3. Set environment variables (`ADMIN_PASSCODE`, `ADMIN_SESSION_SECRET`).
4. Railway automatically detects `package.json` scripts (`build` and `start`).

### Option C: Ubuntu / Linux VPS (PM2 + Nginx)
1. Clone repo to `/var/www/renoos`.
2. Run `npm install && npm run build`.
3. Copy `.env.example` to `.env` and set production secrets.
4. Start via PM2: `pm2 start server/index.mjs --name "renoos-hotel" --interpreter tsx`.
5. Configure Nginx reverse proxy to `http://127.0.0.1:5173` with HTTPS via Let's Encrypt Certbot.

---

## 8. Verification & Sign-off

- [x] **Build Verification:** `npm run build` completes with 0 errors (Vite + TypeScript).
- [x] **Code Quality:** `oxlint` passes with 0 errors.
- [x] **API Connectivity:** `/api/health`, `/api/availability`, `/api/bookings`, `/api/auth/login` verified.
- [x] **Static Fallback:** SPA fallback route loads `index.html` on direct deep link navigation.
