# 🍽️ Taste in Motion

A short-video food discovery app inspired by Instagram Reels — built for food lovers to explore, like, and save food content from local restaurant partners.

**Live Demo:** [taste-in-motion.vercel.app](https://taste-in-motion.vercel.app)

---

## 📱 Features

- **Vertical Reel Feed** — Snap-scroll through food videos, auto-play on focus
- **Like & Save** — Interact with food reels, view saved content anytime
- **Food Partner Profiles** — Restaurants upload videos and manage their presence
- **Dual Auth System** — Separate login for Users and Food Partners
- **JWT Authentication** — Secure cookie-based sessions

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Axios | HTTP requests |
| Vite | Build tool |
| CSS Variables | Theming & design tokens |

### Backend
| Tech | Purpose |
|------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| cookie-parser | Cookie management |
| Multer | File/video upload handling |
| CORS | Cross-origin requests |

---

## 🗂️ Project Structure

```
taste-in-motion/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosInstance.js       # Shared axios config
│   │   ├── components/
│   │   │   ├── ReelFeed.jsx           # Reusable vertical video feed
│   │   │   └── BottomNav.jsx          # Bottom navigation bar
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── UserLogin.jsx
│   │   │   │   ├── UserRegister.jsx
│   │   │   │   ├── FoodPartnerLogin.jsx
│   │   │   │   ├── FoodPartnerRegister.jsx
│   │   │   │   └── ChooseRegister.jsx
│   │   │   ├── general/
│   │   │   │   ├── Home.jsx           # Main reel feed
│   │   │   │   └── Saved.jsx          # Saved videos
│   │   │   └── food-partner/
│   │   │       ├── CreateFood.jsx     # Upload food video
│   │   │       └── Profile.jsx        # Partner profile page
│   │   ├── styles/
│   │   │   ├── theme.css
│   │   │   ├── reels.css
│   │   │   ├── auth-shared.css
│   │   │   └── bottom-nav.css
│   │   └── routes/
│   │       └── AppRoutes.jsx
│   └── .env.production
│
└── backend/
    └── src/
        ├── controllers/
        │   ├── auth.controller.js
        │   └── food.controller.js
        ├── middlewares/
        │   └── auth.middleware.js
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
        │   └── storage.service.js
        ├── app.js
        └── server.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repo
```bash
git clone https://github.com/your-username/taste-in-motion.git
cd taste-in-motion
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:
```env
SECRET_KEY=your_jwt_secret_key_here
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=3000
```

Start the backend:
```bash
node src/server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env.development` file in `/frontend`:
```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/user/register` | Register a user | ❌ |
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
| POST | `/api/food/save` | Save / unsave a reel | User |
| GET | `/api/food/save` | Get saved reels | User |

### Food Partner
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/food-partner/:id` | Get partner profile | ❌ |

---

## ☁️ Deployment

| Service | Platform |
|---------|----------|
| Frontend | [Vercel](https://vercel.com) |
| Backend | [Render](https://render.com) |
| Database | [MongoDB Atlas](https://cloud.mongodb.com) |

### Deploy Backend (Render)
1. New Web Service → connect GitHub repo
2. Root Directory: `backend`
3. Start Command: `node src/server.js`
4. Add env vars: `SECRET_KEY`, `MONGODB_URI`

### Deploy Frontend (Vercel)
1. Import GitHub repo → Vercel
2. Root Directory: `frontend`
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`

---

