# Taste in Motion — Context-Aware Food Discovery Platform
## Implementation Plan & Architectural Blueprint

Transform **Taste in Motion** from a food-reel viewer into a platform that helps users decide what to eat right now based on taste, budget, location, time, and context.

---

## 1. System Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │                 Consumer UI                  │
                  │   Reel Feed • I'm Hungry • Map • Dish Page   │
                  └──────────────────────┬───────────────────────┘
                                         │
             User Events (11 types)      │ REST API / Context Queries
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │                 Backend API                  │
                  │ Express.js • Middleware • Services • Routing │
                  └──────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────┼──────────────────────────────┐
         ▼                       ▼                              ▼
┌──────────────────┐   ┌───────────────────────┐   ┌──────────────────────────┐
│ Telemetry &      │   │ Recommendation Engine │   │ Core Data Layer          │
│ Taste Profiler   │   │ 6-Factor Weighted     │   │ MongoDB + Mongoose       │
│ Event batching & │   │ Ranking + Constraints │   │ Dishes, Availability,    │
│ preference drift │   │ Reason generation     │   │ GeoJSON Partners, Trails │
└──────────────────┘   └───────────────────────┘   └──────────────────────────┘
```

---

## 2. Recommendation Algorithm MVP

Transparent weighted scoring:
$$\text{Score} = w_1 \cdot \text{TasteFit} + w_2 \cdot \text{BudgetFit} + w_3 \cdot \text{DistanceFit} + w_4 \cdot \text{TimeFit} + w_5 \cdot \text{Popularity} + w_6 \cdot \text{Freshness}$$

- **TasteFit ($0.30$):** Matches user's behavioral cuisine & spice preferences from `TasteProfile`.
- **BudgetFit ($0.20$):** Inverted delta between user's current budget constraint and dish price.
- **DistanceFit ($0.20$):** Haversine proximity between user coordinates and restaurant.
- **TimeFit ($0.15$):** Preparation time + transit time fitting inside user's available time.
- **Popularity ($0.10$):** Normalized completion rate, likes, and saves.
- **Freshness ($0.05$):** Recency decay of reel upload.

---

## 3. Data Models Specification

### 1. `Dish` (Canonical Dish Entity)
- `name`: String (e.g. "Butter Chicken Roll")
- `cuisine`: String (e.g. "North Indian", "Italian", "Pan-Asian")
- `spiceLevel`: String (`mild`, `medium`, `spicy`, `extra-spicy`)
- `mealType`: String (`breakfast`, `lunch`, `snack`, `dinner`, `late-night`)
- `priceRange`: String (`budget`, `mid-range`, `premium`)
- `tags`: [String] (e.g. `["crispy", "cheesy", "comfort-food"]`)
- `imageUrl`: String
- `description`: String

### 2. `DishAvailability` (Dish ↔ Partner Bridge)
- `dish`: ObjectId ref `Dish`
- `restaurant`: ObjectId ref `FoodPartner`
- `price`: Number (INR)
- `isAvailable`: Boolean
- `prepTimeMinutes`: Number
- `isSpecialty`: Boolean

### 3. `FoodPartner` (Enhanced with GeoJSON)
- Existing fields: `name`, `email`, `password`
- New fields:
  - `location`: `{ type: 'Point', coordinates: [longitude, latitude] }`
  - `address`: String
  - `city`: String
  - `phone`: String
  - `openingHours`: String
  - `rating`: Number

### 4. `FoodVideo` / `Food` (Enhanced Reel Model)
- `video`: String (ImageKit URL)
- `caption`: String
- `dish`: ObjectId ref `Dish`
- `foodPartner`: ObjectId ref `FoodPartner`
- `viewsCount`: Number
- `completionsCount`: Number
- `likesCount`: Number
- `savesCount`: Number
- `durationSeconds`: Number

### 5. `UserEvent` (Behavioral Telemetry)
- `userId`: ObjectId ref `User` (or guest session id)
- `eventType`: Enum (`VIDEO_VIEW`, `VIDEO_COMPLETE`, `VIDEO_SKIP`, `LIKE`, `SAVE`, `SEARCH`, `DISH_VIEW`, `RESTAURANT_VIEW`, `MAP_CLICK`, `MENU_CLICK`, `TRAIL_ADD`)
- `entityId`: ObjectId (Dish / Reel / Partner / Trail)
- `entityType`: String
- `context`: `{ budget, location: [lng, lat], timeAvailable, timestamp }`

### 6. `TasteProfile` (Behavior-Derived Profiling)
- `user`: ObjectId ref `User`
- `cuisineAffinities`: Map (e.g. `{ "North Indian": 0.85, "Italian": 0.40 }`)
- `spicePreference`: String (`mild`, `medium`, `spicy`)
- `averageSpend`: Number
- `distanceToleranceKm`: Number
- `summaryBadge`: String (e.g. "Spicy Street Food Hunter • Avg ₹250")

### 7. `FoodTrail` (Multi-Stop Food Itineraries)
- `title`: String
- `description`: String
- `creator`: ObjectId ref `User`
- `stops`: Array of `{ dish, restaurant, order, estimatedCost, note }`
- `totalEstimatedCost`: Number
- `totalDistanceKm`: Number
- `totalDurationMins`: Number
- `collaborators`: [ObjectId ref `User`]

---

## 4. UI / UX Design System

1. **Reel Feed Discovery Layer**:
   - 9:16 vertical fullscreen reels with auto-intersection play/pause.
   - Clean floating glassmorphism card:
     - Dish Title & Price tag (e.g., `₹180`)
     - Restaurant name & distance (e.g., `1.2 km away • 15 min`)
     - Context Reason Badge (e.g., `⚡ Under ₹200 & 15 mins away`)
     - Decision actions: **View Dish**, **Compare**, **Map Directions**, **Save**, **Add to Trail**.

2. **"I'm Hungry" Instant Context Flow**:
   - Quick modal / sticky header sheet:
     - Budget slider (₹100 to ₹1000+)
     - Time available (15m, 30m, 45m, 60m+)
     - Distance radius (1km, 3km, 5km, 10km)
     - Craving tags (Spicy, Cheesy, Comfort, Healthy, Sweet, Crispy)
     - Instant filter that runs the recommendation engine in real-time.

3. **Dish Page & Multi-Restaurant Comparison (`/dish/:id`)**:
   - Canonical dish details, spice level, tags.
   - City-wide price benchmark (Average price vs low/high).
   - Side-by-side restaurant card list: Price, Prep Time, Distance, Rating, Directions button.

4. **Interactive Food Map (`/map`)**:
   - Visual map with dish markers nearby.
   - Clicking a pin pops up the dish card with price, photo, and instant jump to reels.

5. **Food Trails (`/trails`)**:
   - Multi-stop food crawl builder (Appetizer $\to$ Main $\to$ Dessert).
   - Dynamic total cost and transit calculation.

6. **Partner Analytics Cockpit (`/partner/analytics`)**:
   - Video Completion Rate (VCR), saves, directions clicks, and top dish performance.

---

## 5. Phase X: Reel + Context-Aware Presentation Architecture

> **Core Philosophy:** "Left = Discovery (9:16 Food Reel), Right = Understanding + Decision (Context Information)"  
> **Intended Product Loop:** Discover $\to$ Understand $\to$ Decide $\to$ Visit/Order/Save $\to$ Learn from behavior $\to$ Improve recommendations.

### 1. Two-Column Desktop Architecture
- **Left Column (Visual Anchor)**:
  - 9:16 vertical food video player with minimal non-intrusive overlays (dish title, price pill, distance, like/save counters).
  - Keeps the reel clean and visually dominant.
- **Right Column (Decision Engine)**:
  - **Category / Cuisine**: Tag (e.g. `BIRYANI · NORTH INDIAN`)
  - **Dish Title**: Bold canonical dish name
  - **Short Description**: 2–3 line summary
  - **Context Snapshot**: Clear grid for Price (₹), Distance (km), and Preparation/Transit Time (min)
  - **"Why Recommended?" (P0 Explainability)**: Direct transparent checklist of why this dish was picked (budget fit, taste affinity, proximity)
  - **Taste Match Gauge**: Learned preference score breakdown (e.g., Spicy 88%, North Indian 81%, 92% Match)
  - **Restaurant Card**: Name, rating badge (★ 4.8), open/closed status, distance
  - **Primary Decision Actions**: `[View Dish]`, `[View Restaurant]`, `[Directions]`, `[Save]`, `[+ Add to Food Trail]`

### 2. Mobile Responsive Flow
- Collapses cleanly into a single-column sequence:
  Category $\to$ Dish Name $\to$ 9:16 Food Reel $\to$ Price / Distance / Time $\to$ Why Recommended $\to$ Description $\to$ Restaurant $\to$ Actions.

### 3. Synchronized State
- Active reel index synchronizes the video and the right-side information panel simultaneously across carousel steps or scroll triggers.
