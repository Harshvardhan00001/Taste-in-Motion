# Phase 6: Multi-Stop Food Trails & Collaborative Crawls

> **Priority:** P1  
> **Status:** `[ ] Not Started`  
> **Objective:** Enable food planners and friends to organize multi-stop food crawl itineraries (e.g. Starter $\to$ Main $\to$ Dessert), compute total trip budget and travel duration, and share itineraries collaboratively.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/models/foodTrail.model.js` | Schema for food trails, ordered stops, and participants |
| `[NEW]` | `backend/src/controllers/trail.controller.js` | CRUD controller for food trails |
| `[NEW]` | `backend/src/routes/trail.routes.js` | Endpoints (`/api/trails`, `/api/trails/:id`, `/api/trails/:id/stops`) |
| `[NEW]` | `frontend/src/pages/general/FoodTrails.jsx` | Trails gallery, trail itinerary builder, and stop timeline |
| `[NEW]` | `frontend/src/components/AddToTrailModal.jsx` | Quick popup to add any reel or dish to an existing/new trail |
| `[NEW]` | `frontend/src/styles/trails.css` | Styles for trail timeline, stop cards, cost/time breakdown |
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Add `/trails` and `/trails/:id` routes |

---

## 📝 Granular Subtasks

### Backend
- [ ] **6.1 Create `foodTrail.model.js`**
  - Fields:
    - `title`: String (e.g. "Chandni Chowk Street Food Crawl")
    - `description`: String
    - `creator`: ObjectId ref `user`
    - `stops`: Array of objects:
      - `order`: Number
      - `dish`: ObjectId ref `dish`
      - `restaurant`: ObjectId ref `foodpartner`
      - `courseType`: Enum (`starter`, `main`, `dessert`, `beverage`, `snack`)
      - `estimatedPrice`: Number
      - `note`: String
    - `totalEstimatedCost`: Number
    - `totalEstimatedDurationMinutes`: Number
    - `totalDistanceKm`: Number
    - `collaborators`: [ObjectId ref `user`]
    - `isPublic`: Boolean (default true)
- [ ] **6.2 Trail CRUD Endpoints (`trail.controller.js`)**
  - `GET /api/trails`: Returns curated and public trails.
  - `GET /api/trails/:id`: Returns full itinerary with populated dish, restaurant, and route math.
  - `POST /api/trails`: Create a new food trail.
  - `POST /api/trails/:id/stops`: Append or reorder a stop; automatically recalculates total cost and duration.
  - `DELETE /api/trails/:id/stops/:stopIndex`: Remove a stop.

### Frontend
- [ ] **6.3 Food Trails Page (`FoodTrails.jsx`)**
  - **Curated Trails Showcase**: Featured trails with banner images, total cost badge, and stop count.
  - **Create Trail Flow**: Simple form to start a new food trail.
  - **Interactive Itinerary Timeline**:
    - Chronological vertical timeline:
      - Stop 1: Starter / Appetizer (Dish name, photo, partner, price, prep time).
      - Transit connector: estimated walking/driving time to Stop 2.
      - Stop 2: Main Course.
      - Stop 3: Dessert.
    - Summary Box: Total Estimated Bill (₹), Total Walking Distance (km), and Estimated Food Crawl Time (hrs).
- [ ] **6.4 Add-to-Trail Quick Action (`AddToTrailModal.jsx`)**
  - Clickable from the reel feed or dish page:
    - Select existing trail or "Create New Trail".
    - Pick course type (`Starter`, `Main`, `Dessert`, `Snack`).
    - Instantly adds the dish and updates trail statistics.

---

## 🎯 Verification & Acceptance Criteria

1. Users can create a new food trail with title and description.
2. Adding dishes from reels or dish pages adds them to the timeline with order, price, and partner.
3. Total estimated cost and duration update dynamically as stops are added or removed.
4. Curated trails load with accurate stops, photos, and calculated route details.
