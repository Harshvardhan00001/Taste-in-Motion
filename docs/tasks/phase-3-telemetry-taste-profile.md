# Phase 3: Behavioral Telemetry & Dynamic Taste Profiler

> **Priority:** P1  
> **Status:** `[x] Completed`  
> **Objective:** Instrument the product with the 11 PRD event types to capture implicit user intent and automatically update a behavioral taste profile (cuisine affinities, spice preferences, budget tolerance, and food habits) without requiring tedious onboarding surveys.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/models/userEvent.model.js` | Schema for 11 telemetry event types |
| `[NEW]` | `backend/src/models/tasteProfile.model.js` | Schema for learned cuisine affinities and preferences |
| `[NEW]` | `backend/src/services/telemetry.service.js` | Async event ingestion & background profile updating |
| `[NEW]` | `backend/src/routes/event.routes.js` | Route for event tracking endpoint (`POST /api/events`) |
| `[NEW]` | `backend/src/routes/taste-profile.routes.js` | Route for taste profile endpoint (`GET /api/taste-profile`) |
| `[NEW]` | `frontend/src/hooks/useTelemetry.js` | Custom React hook to dispatch telemetry events from UI |
| `[NEW]` | `frontend/src/pages/general/TasteProfilePage.jsx` | Profile page showcasing user's learned taste persona |
| `[NEW]` | `frontend/src/styles/taste-profile.css` | Styles for taste persona badge, flame gauge, and affinity bars |
| `[MODIFY]` | `frontend/src/components/ReelVideoAnchor.jsx` | Dispatch watch duration, completion, skip, and action events |
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Add `/taste-profile` route |
| `[MODIFY]` | `frontend/src/components/TopNav.jsx` | Add Taste Profile link in user dropdown menu |
| `[MODIFY]` | `frontend/src/components/BottomNav.jsx` | Add Taste tab in bottom navigation bar |

---

## 📝 Granular Subtasks

### Backend
- [x] **3.1 Create `userEvent.model.js`**
  - Implement schema for the 11 PRD events: `VIDEO_VIEW`, `VIDEO_COMPLETE`, `VIDEO_SKIP`, `LIKE`, `SAVE`, `SEARCH`, `DISH_VIEW`, `RESTAURANT_VIEW`, `MAP_CLICK`, `MENU_CLICK`, `TRAIL_ADD`.
  - Fields: `user`, `guestSessionId`, `eventType`, `entityId`, `entityType`, `context`.
- [x] **3.2 Create `tasteProfile.model.js`**
  - Schema: `user`, `guestSessionId`, `cuisineAffinities`, `spicePreference`, `averageBudget`, `distanceToleranceKm`, `totalInteractions`, `summaryBadge`.
- [x] **3.3 Implement Telemetry & Profiler Service (`telemetry.service.js`)**
  - Event handler: Ingest events into MongoDB.
  - Profile updater:
    - If `VIDEO_COMPLETE`, `LIKE`, `SAVE`, `DISH_VIEW`, or `TRAIL_ADD`: boost affinity weight for that dish's cuisine & spice level (+0.05 to +0.15).
    - If `VIDEO_SKIP`: small negative decay (-0.02).
    - Recalculate `summaryBadge` based on top cuisine and average price of interacted dishes.
- [x] **3.4 Create API Endpoints**
  - `POST /api/events`: Batched or single event ingestion.
  - `GET /api/taste-profile`: Returns the authenticated user's or guest's current learned taste profile.

### Frontend
- [x] **3.5 Build `useTelemetry.js` Hook**
  - Exposes `trackEvent(eventType, entityId, entityType, metadata)`.
  - Automatically manages persistent `guest_session_id` or logged-in JWT user session.
- [x] **3.6 Instrument `ReelVideoAnchor.jsx`**
  - Track `VIDEO_VIEW` on reel entry.
  - Measure video watch percentage: if video plays to $\ge 80\%$, send `VIDEO_COMPLETE`.
  - If swiped away in $< 3$ seconds, send `VIDEO_SKIP`.
  - Hook into like and save action buttons.
- [x] **3.7 Build `TasteProfilePage.jsx`**
  - Visual dashboard rendering:
    - **Taste Persona Badge**: e.g., *"Spicy North Indian Explorer • Avg ₹280"*.
    - **Cuisine Affinity Bars**: Animated progress bars showing affinity % for each cuisine.
    - **Spice Meter**: Visual flame gauge showing user's preferred heat level.
    - **Budget & Distance Comfort Zones**: Average spending habits and transit range.

---

## 🎯 Verification & Acceptance Criteria

1. Watching a video to completion sends `VIDEO_COMPLETE` to `POST /api/events`.
2. Liking a dish increases that dish's cuisine affinity in `TasteProfile`.
3. Navigating to `/taste-profile` displays the live, calculated taste persona and affinity percentages.
4. Skipping videos immediately logs `VIDEO_SKIP` without errors.
