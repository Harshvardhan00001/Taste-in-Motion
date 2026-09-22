# Phase 2: "I'm Hungry" Intent Mode & Context Collector

> **Priority:** P0  
> **Status:** `[x] Completed`  
> **Objective:** Turn passive browsing into immediate decision-making. Hungry users can instantly specify their active situational constraints (budget, time available, distance radius, and craving) to receive a dynamically filtered, ranked list of dishes.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/controllers/discovery.controller.js` | Handle `im-hungry` context search & candidate retrieval |
| `[NEW]` | `backend/src/routes/discovery.routes.js` | Express routes for discovery API (`/api/discovery/im-hungry`) |
| `[MODIFY]` | `backend/src/app.js` | Register discovery routes |
| `[NEW]` | `frontend/src/components/ImHungryModal.jsx` | Interactive bottom sheet/drawer with context sliders & chips |
| `[MODIFY]` | `frontend/src/components/TopNav.jsx` | Add prominent "⚡ I'm Hungry" quick launcher trigger |
| `[MODIFY]` | `frontend/src/pages/general/Home.jsx` | Connect context filters to feed state with active filter badges |
| `[NEW]` | `frontend/src/styles/im-hungry.css` | Styles for context modal, slider controls, and craving chips |

---

## 📝 Granular Subtasks

### Backend
- [x] **2.1 Discovery Controller & Route Setup**
  - Create `backend/src/controllers/discovery.controller.js`.
  - Create `backend/src/routes/discovery.routes.js` and mount under `/api/discovery`.
- [x] **2.2 Implement `POST /api/discovery/im-hungry`**
  - Input payload:
    ```json
    {
      "budget": 300,
      "timeAvailable": 45,
      "maxDistanceKm": 5,
      "cravings": ["Spicy", "Street Food"],
      "userLocation": { "latitude": 28.6139, "longitude": 77.2090 }
    }
    ```
  - Filtering logic:
    - Match `DishAvailability` where `price <= budget` (or within 15% tolerance).
    - Match `prepTimeMinutes <= timeAvailable`.
    - Match dishes matching cuisine or cravings tags.
    - Match restaurants within `maxDistanceKm` using spatial distance.
    - Return populated dishes, associated video reels, prices, and calculated transit/prep times.

### Frontend
- [x] **2.3 Create `ImHungryModal.jsx`**
  - **Budget Selector**:
    - Interactive slider and fast preset chips (`₹150 Quick Bite`, `₹300 Standard`, `₹600 Treat Yourself`, `No Limit`).
  - **Time Available Selector**:
    - Chips (`15 mins` grab & go, `30 mins` fast meal, `45 mins` dine out, `60+ mins`).
  - **Distance Radius Selector**:
    - Slider or pills (`1 km Walking`, `3 km Bike/Quick`, `5 km Delivery/Drive`, `10 km City-wide`).
  - **Cravings / Mood Multi-Select**:
    - Chips: `🔥 Spicy`, `🧀 Cheesy`, `🍲 Comfort`, `🥗 Healthy`, `🍗 Crispy`, `🍰 Sweet`, `🍜 Street Food`.
  - **Submit Button**: High-energy *"⚡ Find What to Eat"* CTA.
- [x] **2.4 Update `TopNav.jsx`**
  - Add stylized, glowing "⚡ I'm Hungry" button on the navbar so users can open the context collector at any time.
- [x] **2.5 Update `Home.jsx` State**
  - If "I'm Hungry" filters are applied, show active filter bar with chips (e.g. `₹300 max`, `30 mins`, `Spicy`) and a `Clear Filters` button.
  - Render filtered reel items dynamically with instant response.

---

## 🎯 Verification & Acceptance Criteria

1. Submitting `POST /api/discovery/im-hungry` with `{ budget: 200, timeAvailable: 30 }` returns only dishes priced $\le ₹200$ and prep time $\le 30$ mins.
2. Clicking "⚡ I'm Hungry" in the top navbar opens the sleek context collector modal.
3. Choosing ₹300 budget and "Spicy" filter smoothly updates the home feed with dishes meeting those exact criteria.
4. Clicking "Clear Filters" restores the complete home feed.
