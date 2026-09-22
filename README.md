# 🍽️ Taste in Motion

A short-video food discovery app inspired by Instagram Reels — built for food lovers to scroll through, like, and save food content from local restaurant partners.



---

## 📱 Features

- **Vertical Reel Feed** — Snap-scroll through food videos with autoplay on focus, just like Instagram Reels
- **Like & Save** — Like or bookmark any food reel, with live count updates
- **Saved Collection** — Dedicated page to revisit all your saved food videos
- **Food Partner Profiles** — Restaurants manage their own content and profile page
- **Dual Auth System** — Completely separate login flows for Users and Food Partners
- **Top Navbar** — Shows logged-in user's avatar, name and role badge; Login/Register when logged out
- **JWT Cookie Auth** — Secure HTTP-only cookie sessions with environment-aware settings
- **Dark UI** — Full dark theme with red-orange brand gradient, built for mobile-first

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests with credentials |
| Vite | Build tool |
| CSS Variables | Dark theme design tokens |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| cookie-parser | HTTP-only cookie sessions |
| Multer | Video upload handling |
| ImageKit | Video/media cloud storage |
| CORS | Cross-origin request handling |

---

## 🗂️ Project Structure

```
Taste-in-Motion/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ReelFeed.jsx          # Reusable vertical video feed with autoplay
│       │   ├── TopNav.jsx            # Top navbar with auth-aware avatar
│       │   └── BottomNav.jsx         # Bottom navigation bar
│       ├── context/
│       │   └── AuthContext.jsx       # Global auth state
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── UserLogin.jsx
│       │   │   ├── UserRegister.jsx
│       │   │   ├── FoodPartnerLogin.jsx
│       │   │   ├── FoodPartnerRegister.jsx
│       │   │   └── ChooseRegister.jsx
│       │   ├── general/
│       │   │   ├── Home.jsx          # Main reel feed
│       │   │   └── Saved.jsx         # Saved videos
│       │   └── food-partner/
│       │       ├── CreateFood.jsx    # Upload food video
│       │       └── Profile.jsx       # Partner profile + video grid
│       ├── styles/
│       │   ├── theme.css             # Design tokens (dark theme)
│       │   ├── reels.css             # Reel feed styles
│       │   ├── auth-shared.css       # Auth page styles
│       │   ├── top-nav.css           # Top navbar styles
│       │   └── bottom-nav.css        # Bottom nav styles
│       └── routes/
│           └── AppRoutes.jsx
│
└── backend/
    └── src/
        ├── controllers/
        │   ├── auth.controller.js    # Register, login, logout for both roles
        │   └── food.controller.js    # CRUD, like, save food reels
        ├── middlewares/
        │   └── auth.middleware.js    # JWT verification for user & partner
        ├── models/
        │   ├── user.model.js
        │   ├── foodpartner.model.js
        │   ├── food.model.js
        │   ├── likes.model.js
        │   └── save.model.js
        ├── routes/
        │   ├── auth.routes.js
        │   ├── food.routes.js
        │   └── food-partner.routes.js
        ├── services/
        │   └── storage.service.js    # ImageKit integration
        ├── app.js
        └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- ImageKit account (for video storage)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/Harshvardhan00001/Taste-in-Motion.git
cd Taste-in-Motion
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create `.env` in `/backend`:
```env
PORT=3000
NODE_ENV=development
SECRET_KEY=your_jwt_secret_key
MONGO_URI=your_mongodb_atlas_connection_string
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

Start the backend:
```bash
node src/server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/user/register` | Register a new user | ❌ |
| POST | `/api/auth/user/login` | Login as user | ❌ |
| GET | `/api/auth/user/logout` | Logout user | ❌ |
| POST | `/api/auth/food-partner/register` | Register food partner | ❌ |
| POST | `/api/auth/food-partner/login` | Login as food partner | ❌ |
| POST | `/api/auth/food-partner/logout` | Logout food partner | ❌ |

### Food
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/food` | Get all food reels | User |
| POST | `/api/food` | Upload a food reel | Partner |
| POST | `/api/food/like` | Like / unlike a reel | User |
| GET | `/api/food/save` | Get saved reels | User |
| POST | `/api/food/save` | Save / unsave a reel | User |

### Food Partner
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/food-partner/:id` | Get partner profile + videos | ❌ |

---


## 🔐 Auth Flow

```
User visits app
      ↓
Login → POST /api/auth/user/login
      ↓
Backend signs JWT → sets HTTP-only cookie (userToken)
      ↓
Frontend saves user info to localStorage → TopNav shows avatar
      ↓
All protected requests send cookie automatically (withCredentials: true)
      ↓
Auth middleware verifies cookie → grants access
```

Two separate cookies are used so both roles can be active simultaneously:
- `userToken` — for regular users
- `partnerToken` — for food partners

---

## 🚀 Context-Aware Food Discovery Platform — Upgrade Blueprint

> **Product Direction:** Transform *Taste in Motion* from a food-reel application into a platform that helps users decide what to eat right now using taste, budget, location, time, and situational context.
>
> **Core Loop:** $\text{Discover} \to \text{Understand} \to \text{Decide} \to \text{Visit/Order/Save} \to \text{Learn} \to \text{Improve}$

### 🎯 Key Product Innovations
1. **"I'm Hungry" Mode:** Instant context collector where users specify budget (e.g. ₹300), available time (e.g. 45 mins), distance radius, and mood/cravings to receive ranked recommendations.
2. **Dish-First Discovery:** Dishes treated as first-class entities with city-wide price benchmarks and multi-restaurant side-by-side comparisons.
3. **6-Factor Weighted Recommendation Engine:**
   $$\text{Score} = 0.30 \cdot \text{TasteFit} + 0.20 \cdot \text{BudgetFit} + 0.20 \cdot \text{DistanceFit} + 0.15 \cdot \text{TimeFit} + 0.10 \cdot \text{Popularity} + 0.05 \cdot \text{Freshness}$$
4. **Behavioral Taste Profiling:** Implicit preference tracking derived from `VIDEO_VIEW`, `VIDEO_COMPLETE`, `VIDEO_SKIP`, `LIKE`, `SAVE`, and `MAP_CLICK`.
5. **Food Map & Food Trails:** Geospatial pin exploration with multi-stop collaborative itinerary planning and bill/time estimations.
6. **Restaurant Partner Cockpit:** Data-dense analytics tracking video completion rates (VCR), menu clicks, and local demand heatmaps.

### 🗺️ Implementation Roadmap (Phases 1 to 8)
- **Phase 1 (P0):** Redesign Home/Reel Experience + Introduce Dish Data Model
- **Phase 2 (P0):** "I'm Hungry" Mode + Budget, Location, and Time Constraints
- **Phase 3 (P1):** Behavioral Event Telemetry + Dynamic Taste Profiling
- **Phase 4 (P0):** Weighted Recommendation Engine + Explainable Reason Badges
- **Phase 5 (P1):** Interactive Food Map + Side-by-Side Dish Comparison
- **Phase 6 (P1):** Multi-Stop Food Trails + Collaborative Route Planning
- **Phase 7 (P1):** Restaurant Partner Analytics Dashboard
- **Phase 8 (P2):** Production Optimization, Cache Tuning & Observability
