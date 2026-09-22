# Phase 7: Restaurant Partner Analytics Cockpit

> **Priority:** P1  
> **Status:** `[ ] Not Started`  
> **Objective:** Deliver a serious, data-dense analytics experience for food partners to monitor video completion rates (VCR), dish engagement, drop-off funnels, and high-intent actions (menu clicks, directions clicks, and saves).

---

## 📂 Affected Files

| Type | Path | Purpose |
|---|---|---|
| `[NEW]` | `backend/src/controllers/analytics.controller.js` | Aggregate partner performance metrics from `userEvent` |
| `[NEW]` | `backend/src/routes/analytics.routes.js` | Endpoint (`GET /api/partner/analytics`) |
| `[MODIFY]` | `backend/src/app.js` | Mount analytics routes |
| `[NEW]` | `frontend/src/pages/food-partner/PartnerAnalytics.jsx` | Data-dense partner cockpit UI |
| `[NEW]` | `frontend/src/styles/partner-analytics.css` | Styling for KPIs, conversion funnel, and performance tables |
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Add `/partner/analytics` route |
| `[MODIFY]` | `frontend/src/pages/food-partner/Profile.jsx` | Link to Analytics Dashboard from partner profile |

---

## 📝 Granular Subtasks

### Backend
- [ ] **7.1 Aggregate Telemetry Pipeline (`analytics.controller.js`)**
  - Implement aggregation queries over `UserEvent` and `FoodVideo`:
    - **Total Video Impressions & Views**: Total `VIDEO_VIEW` events for this partner's videos.
    - **Video Completion Rate (VCR)**: $\frac{\text{VIDEO\_COMPLETE}}{\text{VIDEO\_VIEW}} \times 100\%$.
    - **Drop-off / Skip Rate**: $\frac{\text{VIDEO\_SKIP}}{\text{VIDEO\_VIEW}} \times 100\%$.
    - **High-Intent Conversion Actions**:
      - `SAVE` count.
      - `DISH_VIEW` count.
      - `MAP_CLICK` / Directions count.
      - `TRAIL_ADD` count.
    - **Top Performing Content**: Table ranking videos and dishes by view-to-save ratio and VCR.
- [ ] **7.2 Analytics API Endpoint**
  - Protect `GET /api/partner/analytics` with partner authentication middleware.
  - Return aggregated KPIs, 7-day trend series, and dish conversion tables.

### Frontend
- [ ] **7.3 Build `PartnerAnalytics.jsx` Cockpit**
  - **KPI Header Grid**:
    - Total Video Views (with % change)
    - Video Completion Rate (e.g. `68.4%`)
    - High-Intent Clicks (Directions + Dish Views)
    - Total Saves & Food Trail Inclusions
  - **Conversion Funnel Visualization**:
    - Reel Impression $\to$ Watched $>50\%$ $\to$ Completed $\to$ Clicked Dish / Directions.
    - Clear visualization of drop-off stage.
  - **Dish & Video Performance Matrix**:
    - Sortable table of all uploaded food videos:
      - Thumbnail & Dish Name
      - Views, Likes, Saves
      - Completion Rate badge
      - Directions Generated
- [ ] **7.4 Partner Navigation Integration**
  - In `Profile.jsx` (and TopNav for partners), add a prominent button: **"📊 Partner Analytics Cockpit"**.

---

## 🎯 Verification & Acceptance Criteria

1. Partner can navigate to `/partner/analytics` when logged in.
2. Dashboard shows accurate counts aggregated from real `UserEvent` telemetry records.
3. Video Completion Rate (VCR) is accurately computed as completions divided by views.
4. Top-performing dishes and videos list correctly based on user engagement.
