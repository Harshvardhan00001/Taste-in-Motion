const foodPartnerModel = require("../models/foodpartner.model")
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

async function authFoodPartnerMiddleware(req, res, next) {
    const token = req.cookies.partnerToken;  // ✅ was "token"
    if (!token) {
        return res.status(401).json({ message: "please login first as food partner" })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const foodPartner = await foodPartnerModel.findById(decoded._id)
        if (!foodPartner) {
            return res.status(401).json({ message: "Food partner not found" })
        }
        req.foodPartner = foodPartner
        next()
    } catch (err) {
        return res.status(401).json({ message: "invalid token" })
    }
}

async function authUserMiddleware(req, res, next) {
    const token = req.cookies.userToken;  // ✅ was "token"
    if (!token) {
        return res.status(401).json({ message: "Please login first" })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        const user = await userModel.findById(decoded.id)  // ✅ was decoded._id, token signed with { id }
        if (!user) {
            return res.status(401).json({ message: "User not found" })
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

module.exports = { authFoodPartnerMiddleware, authUserMiddleware }