const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes")
const foodRoutes = require("./routes/food.routes")
const foodPartnerRoutes = require('./routes/food-partner.routes');
const discoveryRoutes = require('./routes/discovery.routes');
const dishRoutes = require('./routes/dish.routes');
const eventRoutes = require('./routes/event.routes');
const tasteProfileRoutes = require('./routes/taste-profile.routes');
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
app.use('/api/events', eventRoutes);
app.use('/api/taste-profile', tasteProfileRoutes);

module.exports = app;