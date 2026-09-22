# Taste in Motion — Task Tracker & Granular Roadmap

This task tracker breaks the Context-Aware Food Discovery Platform transformation into small, sequential chunks. Work is organized phase-by-phase with clear acceptance criteria for each step.

---

## 📊 Phase Overview & Progress

- [x] **Phase 1: Canonical Dish Model & Enhanced Reel Experience**
- [x] **Phase X: Reel + Context-Aware Information Presentation**
- [x] **Phase 2: "I'm Hungry" Mode & Context Collector**
- [x] **Phase 3: Behavioral Telemetry & Dynamic Taste Profiler**
- [x] **Phase 4: 6-Factor Recommendation Engine & Explanations**
- [ ] **Phase 5: Food Map & Multi-Restaurant Dish Comparison**
- [ ] **Phase 6: Multi-Stop Food Trails & Collaborative Crawls**
- [ ] **Phase 7: Restaurant Partner Analytics Cockpit**
- [ ] **Phase 8: Polish, Production Optimization & Verification**

---

## 🛠️ Detailed Task Breakdown

### Phase 1: Canonical Dish Model & Enhanced Reel Experience
> **Goal:** Treat dishes as first-class independent entities, connect them to partner availability and video reels, and enhance the reel UI with context metadata cards and decision actions.

- [x] **Task 1.1: Core Data Models**
  - Create `backend/src/models/dish.model.js` (name, cuisine, spiceLevel, mealType, priceRange, tags, imageUrl, description).
  - Create `backend/src/models/dishAvailability.model.js` (dish, restaurant, price, isAvailable, prepTimeMinutes, isSpecialty).
  - Update `backend/src/models/foodpartner.model.js` to include GeoJSON `location`, `address`, `city`, `phone`, `rating`.
  - Update `backend/src/models/food.model.js` to reference `dish` alongside `foodPartner`.
- [x] **Task 1.2: Realistic Seed Script**
  - Create `backend/src/db/seed.js` with 5+ restaurants with real coordinates, 15+ canonical dishes across cuisines, dish availabilities with price points, and video links.
  - Add npm script `"seed": "node src/db/seed.js"` in `backend/package.json`.
- [x] **Task 1.3: Enhanced Feed Backend API**
  - Update `backend/src/controllers/food.controller.js` to populate dish details and partner location in `/api/food`.
  - Add mock distance calculation and mock reason badges in the interim.
- [x] **Task 1.4: Enhanced 9:16 Reel Card UI**
  - Update `frontend/src/components/ReelFeed.jsx` with:
    - Floating glassmorphism metadata card (Dish Name, Price badge, Restaurant name, Distance tag).
    - Recommendation Reason chip (e.g. `⚡ Under ₹200 • 15 mins`).
    - Action buttons: `View Dish`, `Compare`, `Directions`, `Save`, `Trail`.
  - Update `frontend/src/styles/reels.css` for dark-mode food-media aesthetics.

---

### Phase X: Reel + Context-Aware Information Presentation
> **Goal:** Desktop 2-column split view (Left 9:16 Reel + Right Decision Info: Why Recommended, Taste Match, Restaurant, CTAs) and mobile vertical stack.

- [x] **Task X.1: Multi-Point Decision Signals in Feed API**
  - Enrich `/api/food` items with `whyRecommended` arrays, `tasteMatch` factor breakdowns, and populated `foodPartner` metadata.
- [x] **Task X.2: Dedicated 9:16 Video Anchor Component**
  - Create `ReelVideoAnchor.jsx` with minimal overlays (title, price, distance, like/save counters).
- [x] **Task X.3: Structured Food Decision Panel**
  - Create `FoodDecisionPanel.jsx` rendering category, title, description, context snapshot, why recommended checklist, taste match breakdown, restaurant card, and decision CTAs.
- [x] **Task X.4: Master Presentation Component**
  - Create `ReelContextPresentation.jsx` supporting desktop split view and mobile flow with synchronized reel navigation controls (`01/06`, Prev/Next, Dots, Arrow keys).
- [x] **Task X.5: Home Page Integration & Single-Viewport Styling**
  - Mount presentation on `Home.jsx` and refine `reel-context-presentation.css` so desktop presentation fits cleanly into a single viewport with optional thin auto-scroll on the right panel.

---

### Phase 2: "I'm Hungry" Mode & Context Collector
> **Goal:** Allow hungry users to specify their immediate constraints (budget, available time, distance, cravings) and get instant recommendations.

- [x] **Task 2.1: Context Filtering API**
  - Create `backend/src/controllers/discovery.controller.js` and `backend/src/routes/discovery.routes.js`.
  - Implement `POST /api/discovery/im-hungry`:
    - Accepts `{ budget, timeAvailable, maxDistanceKm, cravings, userLocation }`.
    - Filters dishes & partners matching constraints.
- [x] **Task 2.2: "I'm Hungry" Modal / Drawer Component**
  - Create `frontend/src/components/ImHungryModal.jsx`:
    - Budget slider / quick pills (₹150, ₹300, ₹500, Any).
    - Time selector (15 min quick bite, 30 min meal, 45+ min dine out).
    - Distance radius (1 km, 3 km, 5 km, 10 km).
    - Craving tags (Spicy, Cheesy, Comfort, Healthy, Sweet, Crispy).
    - "Decide For Me" instant submit button.
- [x] **Task 2.3: Integration with Home Feed**
  - Add "I'm Hungry" quick launcher button to `frontend/src/components/TopNav.jsx`.
  - Add filtered state to `Home.jsx` to render context-driven recommendations with active filter chips and clear filter button.

---

### Phase 3: Behavioral Telemetry & Dynamic Taste Profiler
> **Goal:** Capture the 11 PRD events asynchronously and derive a living taste profile from user behavior.

- [x] **Task 3.1: Telemetry Data Model & API**
  - Create `backend/src/models/userEvent.model.js` supporting the 11 events:
    `VIDEO_VIEW`, `VIDEO_COMPLETE`, `VIDEO_SKIP`, `LIKE`, `SAVE`, `SEARCH`, `DISH_VIEW`, `RESTAURANT_VIEW`, `MAP_CLICK`, `MENU_CLICK`, `TRAIL_ADD`.
  - Create `backend/src/services/telemetry.service.js` to log events asynchronously.
  - Create `POST /api/events` endpoint in `backend/src/routes/event.routes.js`.
- [x] **Task 3.2: Dynamic Taste Profile Service**
  - Create `backend/src/models/tasteProfile.model.js` (cuisine affinities, spice level preference, average spend, distance tolerance, summary badge).
  - Implement profile updating logic in `backend/src/services/telemetry.service.js` triggered by events (likes, saves, completions add affinity weights).
  - Create `GET /api/taste-profile` endpoint in `backend/src/routes/taste-profile.routes.js`.
- [x] **Task 3.3: Frontend Telemetry Hooks**
  - Create `frontend/src/hooks/useTelemetry.js` to dispatch events seamlessly on reel view duration, complete, skip, save, and clicks.
- [x] **Task 3.4: Taste Profile View Page**
  - Create `frontend/src/pages/general/TasteProfilePage.jsx` showing visual affinity bars, spice preference meter, typical budget range, and recent food journey.

---

### Phase 4: 6-Factor Recommendation Engine & Explanations
> **Goal:** Implement the transparent weighted ranking formula and generate explainable reason badges for every dish.

- [x] **Task 4.1: Recommendation Scoring Engine**
  - Create `backend/src/services/recommendation.service.js`:
    - Formula: $0.30 \cdot \text{TasteFit} + 0.20 \cdot \text{BudgetFit} + 0.20 \cdot \text{DistanceFit} + 0.15 \cdot \text{TimeFit} + 0.10 \cdot \text{Popularity} + 0.05 \cdot \text{Freshness}$.
    - Configurable weights via config object.
- [x] **Task 4.2: Explainability Engine**
  - Implement badge generator function in `recommendation.service.js` that inspects the dominant contributing factors:
    - If TasteFit > 0.8: *"Matches your love for Spicy Street Food"*
    - If TimeFit + BudgetFit dominate: *"Quick bite under ₹200"*
    - If Popularity dominates: *"Trending near you right now"*
- [x] **Task 4.3: Connect Engine to Home Discovery Feed**
  - Update `GET /api/discovery/feed` to rank all candidates using the recommendation service and return dishes with score breakdown and badge explanation.

---

### Phase 5: Food Map & Multi-Restaurant Dish Comparison
> **Goal:** Connect food content to physical locations and allow side-by-side dish comparison across multiple restaurants.

- [ ] **Task 5.1: Geospatial Nearby API**
  - Implement `GET /api/map/nearby` in `backend/src/controllers/discovery.controller.js` using geospatial queries.
- [ ] **Task 5.2: Multi-Restaurant Dish Comparison API**
  - Create `backend/src/controllers/dish.controller.js`:
    - `GET /api/dishes/:id`: Dish profile with tags, photos, nutrition notes.
    - `GET /api/dishes/:id/compare`: List of all restaurants serving this dish, sorted by price or distance.
- [ ] **Task 5.3: Interactive Food Map Screen**
  - Create `frontend/src/pages/general/FoodMap.jsx`:
    - Interactive visual map with dish pins & price tags.
    - Pin click opens bottom preview card with photo, price, distance, and "Watch Reel" / "View Dish" buttons.
- [ ] **Task 5.4: Dish Detail & Comparison Screen**
  - Create `frontend/src/pages/general/DishDetail.jsx`:
    - Canonical dish hero card.
    - City-wide price benchmark gauge (e.g. ₹180 low, ₹250 avg, ₹320 high).
    - Multi-restaurant comparison cards (Restaurant, Price, Prep time, Rating, Distance, Directions).

---

### Phase 6: Multi-Stop Food Trails & Collaborative Crawls
> **Goal:** Enable users to organize and share multi-stop food routes with friends.

- [ ] **Task 6.1: Food Trail Backend API**
  - Create `backend/src/models/foodTrail.model.js`.
  - Create `backend/src/controllers/trail.controller.js` & `backend/src/routes/trail.routes.js`:
    - `GET /api/trails` (public curated trails)
    - `POST /api/trails` (create trail)
    - `POST /api/trails/:id/stops` (add dish stop)
- [ ] **Task 6.2: Food Trails Page & Builder**
  - Create `frontend/src/pages/general/FoodTrails.jsx`:
    - Trail overview: Stops timeline (Appetizer $\to$ Main $\to$ Dessert).
    - Automatic calculation of total cost, distance, and duration.
    - Quick "Add to Trail" popup when browsing reels or dishes.

---

### Phase 7: Restaurant Partner Analytics Cockpit
> **Goal:** Provide food partners with a data-dense performance dashboard tracking conversions, video completion rates, and menu engagement.

- [ ] **Task 7.1: Analytics Aggregation API**
  - Create `backend/src/controllers/analytics.controller.js` & `backend/src/routes/analytics.routes.js`:
    - Aggregates Video Completion Rate (VCR), saves, directions clicks, and top-performing dishes.
- [ ] **Task 7.2: Partner Analytics Dashboard Screen**
  - Create `frontend/src/pages/food-partner/PartnerAnalytics.jsx`:
    - Metric cards: Total Views, Avg Video Watch Time, Completion Rate, Directions & Menu Clicks.
    - Top Dishes performance table.
    - Conversion funnel (Impression $\to$ 50% Watch $\to$ Complete $\to$ Action).

---

### Phase 8: Polish, Production Optimization & Verification
> **Goal:** End-to-end verification, performance tuning, and responsive UI polish.

- [ ] **Task 8.1: Unified Routing & Navigation**
  - Update `frontend/src/routes/AppRoutes.jsx` to register all routes (`/map`, `/dish/:id`, `/taste-profile`, `/trails`, `/partner/analytics`).
  - Update `BottomNav.jsx` and `TopNav.jsx` for clean tab navigation between Feed, Map, Trails, Saved, and Profile.
- [ ] **Task 8.2: End-to-End Build & API Testing**
  - Verify backend routes and seed data.
  - Run `npm run build` in `frontend/` to ensure zero compilation or styling errors.
  - Test responsive layout across mobile and desktop.
