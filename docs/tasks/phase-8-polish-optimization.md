# Phase 8: Polish, Production Optimization & Verification

> **Priority:** P2  
> **Status:** `[ ] Not Started`  
> **Objective:** Unify all features into a coherent mobile-first experience, optimize video preloading and caching, verify zero console errors, run full builds, and validate all acceptance criteria from the PRD.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Full route verification & fallback handling |
| `[MODIFY]` | `frontend/src/components/BottomNav.jsx` | Mobile bottom navigation tabs (Reels, Map, Trails, Profile) |
| `[MODIFY]` | `frontend/src/components/TopNav.jsx` | Unified top bar with avatar, context quick launcher, and partner badge |
| `[MODIFY]` | `frontend/src/styles/theme.css` | Dark theme color variables, glassmorphism tokens, and mobile safe areas |
| `[MODIFY]` | `backend/src/server.js` / `app.js` | Middleware validation, error handler, index checks |

---

## 📝 Granular Subtasks

### Navigation & UX Architecture
- [ ] **8.1 Unify Bottom Navigation (`BottomNav.jsx`)**
  - Include 5 core icons:
    1. **Reels (Discovery)** (`/`)
    2. **Food Map** (`/map`)
    3. **Food Trails** (`/trails`)
    4. **Taste Profile** (`/taste-profile`)
    5. **Saved** (`/saved`)
  - Highlight active tab with glowing brand accent (`#FF5722` / gradient).
- [ ] **8.2 Unify Top Navigation (`TopNav.jsx`)**
  - Left: Logo / Brand mark.
  - Center/Right: "⚡ I'm Hungry" glowing quick launcher button.
  - Right: User avatar with taste persona tag or Partner Dashboard badge.

### Performance & Mobile Polish
- [ ] **8.3 Video Intersection & Preloading Optimization**
  - In `ReelFeed.jsx`, preload `metadata` for next reel in queue to eliminate video stutter on scroll.
  - Disconnect video observers cleanly when leaving the feed to prevent memory leaks.
- [ ] **8.4 Mobile Viewport & Touch Gestures**
  - Support mobile safe areas (`env(safe-area-inset-bottom)`).
  - Ensure double-tap to like and smooth touch swipe behavior.

### Verification & Automated Testing
- [ ] **8.5 Frontend Build Validation**
  - Execute `npm run build` in `frontend/`.
  - Fix any linting errors, unused imports, or CSS warnings.
- [ ] **8.6 Backend API Sanity Testing**
  - Test all endpoints with complete request/response cycles:
    - Discovery feed with ranking
    - "I'm Hungry" context search
    - Dish detail & comparison
    - Telemetry event logging
    - Taste profile updates
    - Food trails CRUD
    - Partner analytics aggregation

---

## 🎯 Verification & Acceptance Criteria

1. `npm run build` completes with 0 errors in both frontend and backend.
2. The entire user loop operates seamlessly: **Discover (Reel) $\to$ Understand (Dish Detail / Benchmark) $\to$ Decide ("I'm Hungry" / Map) $\to$ Visit / Save / Trail $\to$ Learn (Taste Profile)**.
3. No console errors or broken navigation links across the app.
4. Clean, responsive UI across both desktop and mobile viewports.
