const express=require("express");
const cookieParser=require("cookie-parser");
const authRoutes=require("./routes/auth.routes")
const foodRoutes=require("./routes/food.routes")
const foodPartnerRoutes = require('./routes/food-partner.routes');
const cors = require('cors');
require('dotenv').config();



const app=express();
app.use(cors({
    origin: "https://taste-in-motion-q6dv.vercel.app",
    credentials: true
}));
app.use(cookieParser())

app.use(express.json())

app.get('/',(req,res)=>{
    res.send("hello world")
})

app.use('/api/auth',authRoutes)
app.use('/api/food',foodRoutes)
app.use('/api/food-partner', foodPartnerRoutes);

module.exports=app;