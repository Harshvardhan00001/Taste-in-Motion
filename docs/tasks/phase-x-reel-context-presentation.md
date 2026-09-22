# Phase X — Reel + Context-Aware Information Presentation

> **Priority:** P0 (Core Discovery & Decision Loop)  
> **Status:** `[x] Completed`  
> **Core Principle:** **"Left = Discovery (9:16 Reel), Right = Understanding + Decision (Context Information)"**  
> **Objective:** Transform the reel experience into a complete context-aware website presentation. The user watches the visual food reel while simultaneously understanding what the dish is, where it is available, how much it costs, how far it is, why it is recommended, and what actions they can take.

---

## 📐 Layout Specifications

### Desktop: Two-Column Split Experience (PRD Section 2)
```text
┌──────────────────────────────┬──────────────────────────────────────────┐
│                              │  CATEGORY (e.g., BIRYANI · NORTH INDIAN) │
│                              │                                          │
│                              │  DISH NAME (e.g., Hyderabadi Dum Biryani)│
│                              │                                          │
│          FOOD REEL           │  Short Description (2–3 lines)           │
│         (9:16 VIDEO)         │  ──────────────────────────────────────  │
│                              │  CONTEXT SNAPSHOT                        │
│      Minimal Overlays:       │  [₹280 Price] [1.4 km Distance] [~20 min]│
│      • Dish name             │  ──────────────────────────────────────  │
│      • Price badge           │  WHY RECOMMENDED?                        │
│      • Distance              │  ✓ Matches your spicy-food preference    │
│      • Like & Save counts    │  ✓ Within your ₹300 budget               │
│                              │  ✓ 1.4 km from your current location     │
│                              │  ──────────────────────────────────────  │
│                              │  TASTE MATCH                             │
│                              │  Spicy: 88% | North Indian: 81% (92% Tot)│
│                              │  ──────────────────────────────────────  │
│                              │  RESTAURANT                              │
│                              │  The Spice Route ★ 4.8 (Open now)        │
│                              │  ──────────────────────────────────────  │
│                              │  PRIMARY ACTIONS                         │
│                              │  [View Dish] [View Restaurant]           │
│                              │  [Directions] [Save] [+ Food Trail]      │
├──────────────────────────────┴──────────────────────────────────────────┤
│  Navigation: [← Previous]            01 / 06                   [Next →] │
└─────────────────────────────────────────────────────────────────────────┘
```

### Mobile: Single-Column Vertical Flow (PRD Section 17)
```text
1. Category & Cuisine
2. Dish Name
3. 9:16 Food Reel (Full width, visually dominant)
4. Context Snapshot (Price, Distance, Time)
5. "Why Recommended?" Explainability Box
6. Short Description
7. Restaurant Info Card (Rating, Open status)
8. Action Buttons ([View Dish], [Directions], [Save], [Add to Food Trail])
```

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[MODIFY]` | `backend/src/controllers/food.controller.js` | Include rich `whyRecommended` reason bullet array and `tasteMatch` percentages |
| `[NEW]` | `frontend/src/components/ReelContextPresentation.jsx` | Master two-column desktop / single-column mobile presentation component |
| `[NEW]` | `frontend/src/components/ReelVideoAnchor.jsx` | Dedicated 9:16 vertical video anchor with minimal overlays |
| `[NEW]` | `frontend/src/components/FoodDecisionPanel.jsx` | Structured right-side panel: highlights, why recommended, restaurant, CTAs |
| `[NEW]` | `frontend/src/styles/reel-context-presentation.css` | High-finish styling: split grid, dark glassmorphism, sticky video, chips |
| `[MODIFY]` | `frontend/src/pages/general/Home.jsx` | Render the new Reel + Context-Aware Presentation on Home |

---

## 📝 Granular Subtasks

### Backend
- [x] **X.1 Enrich Feed API with Multi-Point Decision Signals (`food.controller.js`)**
  - Update `getFoodItems` to supply structured decision fields for each reel:
    ```javascript
    {
      whyRecommended: [
        "Matches your spicy-food preference",
        "Within your ₹300 budget",
        "1.4 km from your location (~20 min)",
        "Top-rated dish at The Spice Route"
      ],
      tasteMatch: {
        totalScore: 92,
        factors: [
          { label: "Spicy", percentage: 88 },
          { label: "North Indian", percentage: 81 },
          { label: "Budget Fit", percentage: 95 }
        ]
      },
      restaurant: {
        id: "...",
        name: "The Spice Route",
        rating: 4.8,
        distanceKm: 1.4,
        isOpen: true,
        operatingHours: "12:00 PM - 11:30 PM",
        address: "14 Janpath Road, Connaught Place"
      }
    }
    ```

### Frontend
- [x] **X.2 Create Dedicated 9:16 Video Anchor (`ReelVideoAnchor.jsx`)**
  - Preserves edge-to-edge 9:16 vertical video ratio.
  - Minimal, clean overlays only (no text clutter over video):
    - Dish name & price badge.
    - Walking distance and estimated preparation time.
    - Right-side like and save buttons with live counters.
    - Native play/pause on tap, mute/unmute toggle.
- [x] **X.3 Build Structured Food Decision Panel (`FoodDecisionPanel.jsx`)**
  - **Header Block**: Category, Cuisine tag, and Dish Name.
  - **Description**: Concise 2–3 line appetizing summary.
  - **Context Grid**: Distinct visual pills for Price (₹), Distance (km), and Total Time (prep + transit).
  - **"Why Recommended?" Section (PRD Section 6)**:
    - Dedicated explainability card showing checkmarked bullets answering why this dish was picked.
  - **Taste Match Gauge (PRD Section 14)**:
    - Overall match indicator (e.g. `92% Match`) with mini category breakdown bars.
  - **Restaurant Card (PRD Section 9)**:
    - Restaurant name, star rating badge, open/closed indicator, and distance.
  - **Decision Action Bar (PRD Section 8)**:
    - Primary CTA: **[View Dish]** (opens `/dish/:id` for comparisons).
    - Secondary CTAs: **[View Restaurant]**, **[Directions / Map]**, **[Save]**, and **[+ Add to Food Trail]**.
- [x] **X.4 Build Master Presentation Component (`ReelContextPresentation.jsx`)**
  - Supports both desktop 2-column split view and mobile single-column responsive flow.
  - Synchronized state: switching active reel updates the video on the left and the complete information panel on the right simultaneously.
  - Keyboard navigation (ArrowLeft / ArrowRight / ArrowUp / ArrowDown).
  - Top or bottom navigation bar with counter (`01 / 06`), previous/next buttons, and visual dots.
- [x] **X.5 Integrate into Home Screen (`Home.jsx`)**
  - Replace raw standalone feed on Home with `ReelContextPresentation`.
  - Maintain instant like and save interactivity.
- [x] **X.6 Responsive Styling (`reel-context-presentation.css`)**
  - Desktop: Sticky 9:16 video on the left, smooth scrolling or carousel transition on the right.
  - Mobile: Natural vertical stack (Category $\to$ Title $\to$ 9:16 Video $\to$ Price/Distance $\to$ Why Recommended $\to$ Restaurant $\to$ Actions).

---

## 🎯 Verification & Acceptance Criteria

1. Loading the Home page displays the **two-column layout** on desktop:
   - Left side: 9:16 vertical food reel with minimal overlays.
   - Right side: structured decision panel (Category, Dish Name, Price, Distance, Time, "Why Recommended?", Taste Match, Restaurant, and Action Buttons).
2. Changing the reel (via Next, Previous, or scroll) updates both the video and the right-side information panel simultaneously.
3. "Why Recommended?" clearly articulates why the dish matches the user's current context (budget, distance, spice level).
4. Clicking "View Dish", "Directions", "Save", and "Add to Food Trail" triggers the expected actions.
5. On mobile viewports, the layout collapses into a single-column sequence without shrinking the 9:16 reel to an unreadable thumbnail.
6. `npm run build` runs with 0 errors.
