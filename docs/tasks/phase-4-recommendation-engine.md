# Phase 4: 6-Factor Recommendation Engine & Explanations

> **Priority:** P0  
> **Status:** `[x] Completed`  
> **Objective:** Build a transparent, configurable recommendation ranking engine combining taste similarity, budget fit, distance, time constraints, popularity, and freshness, accompanied by human-readable explanation badges for why each dish was recommended.

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/services/recommendation.service.js` | 6-Factor scoring formula & reason badge generator |
| `[MODIFY]` | `backend/src/controllers/discovery.controller.js` | Hook recommendation service into `/api/discovery/feed` |
| `[MODIFY]` | `backend/src/routes/discovery.routes.js` | Route definitions for discovery feed |
| `[MODIFY]` | `frontend/src/components/FoodDecisionPanel.jsx` | Render dynamic reason badge and 6-factor score breakdown |
| `[MODIFY]` | `frontend/src/pages/general/Home.jsx` | Load personalized feed from `/api/discovery/feed` |

---

## 📝 Granular Subtasks

### Backend
- [x] **4.1 Implement 6-Factor Scoring Formula (`recommendation.service.js`)**
  - Implement normalized sub-score calculators (each outputs a value between $0.0$ and $1.0$):
    1. **TasteFit ($0.30$):** Dot product / similarity between candidate dish cuisine/spice and user's `TasteProfile`.
    2. **BudgetFit ($0.20$):** Proximity between dish price and user target budget ($1 - \frac{|price - budget|}{budget}$).
    3. **DistanceFit ($0.20$):** Exponential distance decay ($e^{-\frac{distanceKm}{3}}$).
    4. **TimeFit ($0.15$):** Penalty if prep time + transit time exceeds user time constraint.
    5. **Popularity ($0.10$):** Based on video completion rate, like ratio, and save ratio ($\frac{completions + 2 \cdot saves}{views + 1}$).
    6. **Freshness ($0.05$):** Recency decay of dish reel ($e^{-\frac{daysOld}{14}}$).
  - Total Score calculation:
    $$\text{Score} = w_1 \cdot \text{TasteFit} + w_2 \cdot \text{BudgetFit} + w_3 \cdot \text{DistanceFit} + w_4 \cdot \text{TimeFit} + w_5 \cdot \text{Popularity} + w_6 \cdot \text{Freshness}$$
  - Configurable weights object allowing easy tuning.
- [x] **4.2 Build Explainability Engine (`recommendation.service.js`)**
  - Analyze the highest scoring sub-factor to generate transparent explanation badges:
    - If `TasteFit > 0.75`: *"Matches your love for Spicy North Indian"*
    - If `TimeFit` & `DistanceFit` high: *"⚡ 10 mins away • Quick bite"*
    - If `BudgetFit` high: *"💰 Perfect budget match (Under ₹250)"*
    - If `Popularity` high: *"🔥 Trending in your area (85% completion rate)"*
    - If `Freshness` high: *"✨ Fresh drop from Chef Rahul"*
- [x] **4.3 Connect Engine to Discovery Feed API**
  - Create `GET /api/discovery/feed`:
    - Reads user context (authenticated taste profile, user location coordinates, current time).
    - Fetches candidates, scores and ranks them, attaches reason badge and score breakdown, and returns sorted feed.

### Frontend
- [x] **4.4 Render Explanation Badges on Reel Cards**
  - Display the generated reason badge prominently above the dish name in `FoodDecisionPanel.jsx` and `ReelVideoAnchor.jsx`.
  - Add factor breakdown percentage bars (`TASTE FIT`, `BUDGET FIT`, `DISTANCE FIT`, `TIME FIT`, `POPULARITY`).
- [x] **4.5 Connect Home Feed to `/api/discovery/feed`**
  - Update `Home.jsx` to fetch from the context-aware discovery feed instead of the static `/api/food` endpoint.

---

## 🎯 Verification & Acceptance Criteria

1. Calling `GET /api/discovery/feed` returns reels sorted by recommendation score with `reasonBadge` and `score` attached.
2. A user with high Italian cuisine affinity in their `TasteProfile` gets Italian pasta/pizza reels ranked higher with reason badge *"Matches your love for Italian"*.
3. Reels display dynamic, meaningful explanation badges on screen without UI glitches.
4. Score breakdown is transparent and verifiable.
