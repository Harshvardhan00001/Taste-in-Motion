const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes")
const foodRoutes = require("./routes/food.routes")
const foodPartnerRoutes = require('./routes/food-partner.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const dishRoutes = require('./routes/dish.routes');
const trailRoutes = require('./routes/trail.routes');
const eventRoutes = require('./routes/event.routes');
const tasteProfileRoutes = require('./routes/taste-profile.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const path = require("path");
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173"
    ],
    credentials: true
}));

app.use(cookieParser())
app.use(express.json())
app.use('/videos', express.static(path.join(__dirname, '../../videos')));

app.get('/', (req, res) => {
    res.send("hello world")
})

app.use('/api/auth', authRoutes)
app.use('/api/food', foodRoutes)
app.use('/api/food-partner', foodPartnerRoutes);
app.use('/api/discovery', discoveryRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/trails', trailRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/taste-profile', tasteProfileRoutes);
app.use('/api/partner/analytics', analyticsRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

module.exports = app;