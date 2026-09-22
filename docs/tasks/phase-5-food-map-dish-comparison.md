# Phase 5: Food Map & Multi-Restaurant Dish Comparison

> **Priority:** P1  
> **Status:** `[ ] Not Started`  
> **Objective:** Connect video discovery to real physical locations via an interactive Food Map, and allow users to view canonical dishes independently with side-by-side restaurant pricing, prep times, and quality comparisons.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/controllers/dish.controller.js` | Dish details & multi-restaurant comparison controller |
| `[NEW]` | `backend/src/routes/dish.routes.js` | Dish endpoints (`/api/dishes/:id`, `/api/dishes/:id/compare`) |
| `[MODIFY]` | `backend/src/controllers/discovery.controller.js` | Add `GET /api/map/nearby` endpoint |
| `[NEW]` | `frontend/src/pages/general/FoodMap.jsx` | Interactive food map with dish pins & floating reel card |
| `[NEW]` | `frontend/src/pages/general/DishDetail.jsx` | Canonical dish profile + side-by-side restaurant comparison table |
| `[NEW]` | `frontend/src/styles/map.css` | Map styling, custom pin icons, preview popups |
| `[NEW]` | `frontend/src/styles/dish-detail.css` | Dish showcase, comparison matrix styling |
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Add `/map` and `/dish/:id` routes |

---

## 📝 Granular Subtasks

### Backend
- [ ] **5.1 Geospatial Map API (`GET /api/map/nearby`)**
  - Accepts user latitude, longitude, and optional radius (default 5 km).
  - Queries active restaurants and their top dishes.
  - Returns geo-located pins with restaurant name, dish name, price, photo, and linked reel video ID.
- [ ] **5.2 Dish Details API (`GET /api/dishes/:id`)**
  - Fetches dish details, high-res photos, description, spice level, tags, and all associated food video reels.
- [ ] **5.3 Side-by-Side Restaurant Comparison API (`GET /api/dishes/:id/compare`)**
  - Finds all restaurants offering this exact dish via `DishAvailability`.
  - Calculates city-wide benchmark: minimum price, average price, maximum price.
  - Returns comparative list:
    ```json
    {
      "dish": { "name": "Butter Chicken", "cuisine": "North Indian" },
      "benchmark": { "minPrice": 240, "avgPrice": 285, "maxPrice": 340 },
      "restaurants": [
        {
          "restaurantName": "Punjabi Grill",
          "price": 260,
          "prepTimeMinutes": 20,
          "distanceKm": 1.4,
          "rating": 4.6,
          "specialty": true
        },
        {
          "restaurantName": "Spice Symphony",
          "price": 310,
          "prepTimeMinutes": 35,
          "distanceKm": 3.2,
          "rating": 4.8,
          "specialty": false
        }
      ]
    }
    ```

### Frontend
- [ ] **5.4 Interactive Food Map Screen (`FoodMap.jsx`)**
  - Interactive map view with custom food dish pins showing price tags directly on the map.
  - Clicking a pin opens a clean floating card at the bottom:
    - Dish thumbnail, title, price, distance, and restaurant.
    - Quick actions: **"Watch Reel"** (jumps directly into reel feed at this video) and **"Get Directions"** / **"View Dish"**.
  - Top category filter chips (e.g. All, Spicy, Fast Prep, Under ₹200).
- [ ] **5.5 Dish Details & Comparison Screen (`DishDetail.jsx`)**
  - **Dish Hero Banner**: High-res dish image/video preview, cuisine tag, spice flame indicator.
  - **City Price Benchmark Bar**: Visual slider showing where each restaurant sits relative to the city average price.
  - **Side-by-Side Comparison Cards**:
    - Compares each restaurant serving this dish.
    - Highlights "Best Value" (lowest price) and "Fastest" (lowest prep + transit time).
    - Direct action buttons: "Directions", "Add to Food Trail".
- [ ] **5.6 Bidirectional Reel $\leftrightarrow$ Map $\leftrightarrow$ Dish Navigation**
  - On any reel, clicking "View Dish" opens `DishDetail.jsx`.
  - On any reel, clicking "Map Pin" navigates to `/map` centered on that restaurant.
  - From map or dish page, clicking the video preview seamlessly plays the food reel.

---

## 🎯 Verification & Acceptance Criteria

1. Navigating to `/map` displays interactive markers with dish names and price tags around the user's location.
2. Clicking a map marker presents the dish preview with a direct button to watch the video reel.
3. Navigating to `/dish/:id` renders the full dish profile and the multi-restaurant comparison table showing price, prep time, and distance differences.
4. City benchmark metrics accurately compute min, avg, and max prices.
