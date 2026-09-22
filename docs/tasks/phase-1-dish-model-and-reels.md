# Phase 1: Canonical Dish Model & Enhanced Reel Experience

> **Priority:** P0  
> **Status:** `[x] Completed`  
> **Objective:** Treat individual dishes as first-class entities rather than just restaurant video uploads, link them via a dish-availability bridge with pricing and prep time, populate rich seed data, and transform the 9:16 reel cards into decision cards.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/models/dish.model.js` | Schema for canonical dishes (cuisine, spice, mealType, tags) |
| `[NEW]` | `backend/src/models/dishAvailability.model.js` | Bridge between Dish and Restaurant with price & prep time |
| `[MODIFY]` | `backend/src/models/foodpartner.model.js` | Add GeoJSON coordinates, address, city, rating |
| `[MODIFY]` | `backend/src/models/food.model.js` | Add reference to `dish` and telemetry metric counters |
| `[NEW]` | `backend/src/db/seed.js` | Realistic seed script with restaurants, dishes, prices, and videos |
| `[MODIFY]` | `backend/src/controllers/food.controller.js` | Populate dish, restaurant geo-data, and initial reason badge |
| `[MODIFY]` | `frontend/src/components/ReelFeed.jsx` | Redesign reel overlay with glassmorphism metadata & action bar |
| `[MODIFY]` | `frontend/src/styles/reels.css` | Styles for floating metadata card, chips, and decision buttons |

---

## 📝 Granular Subtasks

### Backend
- [x] **1.1 Create `dish.model.js`**
  - Name, cuisine (e.g. North Indian, Italian, Pan-Asian, Mexican), spiceLevel (`mild`, `medium`, `spicy`, `extra-spicy`), mealType (`breakfast`, `lunch`, `snack`, `dinner`, `late-night`), priceRange (`budget`, `mid-range`, `premium`), tags (`["crispy", "cheesy"]`), imageUrl, description.
- [x] **1.2 Create `dishAvailability.model.js`**
  - References `dish` (ObjectId) and `restaurant` (`foodpartner` ObjectId).
  - Stores `price` (Number), `isAvailable` (Boolean), `prepTimeMinutes` (Number), `isSpecialty` (Boolean).
- [x] **1.3 Update `foodpartner.model.js`**
  - Add `location: { type: { type: String, default: 'Point' }, coordinates: [Number] }` (with 2dsphere index).
  - Add `address`, `city`, `phone`, `operatingHours`, `rating`.
- [x] **1.4 Update `food.model.js`**
  - Add `dish: { type: mongoose.Schema.Types.ObjectId, ref: "dish" }`.
  - Add `viewsCount`, `completionsCount`, `durationSeconds`.
- [x] **1.5 Build Realistic Seed Script (`backend/src/db/seed.js`)**
  - 5 authentic restaurants (e.g. Punjabi Grill, Spice Symphony, Tokyo Diner, Dosa Cafe, Crust & Co) with realistic Delhi/Mumbai coordinates.
  - 15+ dishes across cuisines with varied spice levels and meal types.
  - Availability pricing (e.g. Butter Chicken ₹280 at Partner A vs ₹320 at Partner B).
  - Food video reels linked to these dishes and partners.
- [x] **1.6 Update Feed API (`food.controller.js`)**
  - Populate both `dish` and `foodPartner` in `GET /api/food`.
  - Include calculated distance (or user proximity fallback) and temporary reason tag.

### Frontend
- [x] **1.7 Enhance 9:16 Reel Card Overlay (`ReelFeed.jsx`)**
  - Glassmorphic bottom-left card showing:
    - Dish Name & Price Pill (e.g., `Paneer Tikka Roll • ₹160`)
    - Restaurant Name & Walking Distance (e.g., `Spice Junction • 850m`)
    - Recommendation Reason Tag (e.g., `⚡ Under ₹200 & 15 mins away`)
- [x] **1.8 Add Decision Action Bar (`ReelFeed.jsx`)**
  - Vertical or horizontal quick action buttons:
    - **View Dish** (navigates to `/dish/:id`)
    - **Compare** (opens multi-restaurant comparison)
    - **Directions / Map** (opens in map)
    - **Save** (existing bookmark functionality)
    - **Add to Trail** (opens food trail picker)
- [x] **1.9 Style Polish (`reels.css`)**
  - High-contrast typography, frosted glass overlay (`backdrop-filter: blur(12px)`), vibrant accent pills, seamless mobile-touch friendliness.

---

## 🎯 Verification & Acceptance Criteria

1. Running `npm run seed` in `backend/` creates restaurants with geo-coordinates, dishes, availabilities, and video records.
2. `GET /api/food` returns reels populated with `dish` details, partner info, and pricing.
3. Loading the home feed displays the enhanced 9:16 reel with dish title, price, restaurant name, distance, reason badge, and action buttons.
4. Clicking "Like" and "Save" still functions seamlessly with count updates.
