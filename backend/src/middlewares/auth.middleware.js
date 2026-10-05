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
    const token = req.cookies.userToken || req.cookies.partnerToken;
    if (!token) {
        return res.status(401).json({ message: "Please login first" })
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY)
        let user = await userModel.findById(decoded.id || decoded._id)
        if (!user) {
            const partner = await foodPartnerModel.findById(decoded._id || decoded.id)
            if (partner) {
                req.foodPartner = partner
                req.user = partner
                return next()
            }
            return res.status(401).json({ message: "User not found" })
        }
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" })
    }
}

async function optionalUserMiddleware(req, res, next) {
    const token = req.cookies.userToken;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await userModel.findById(decoded.id || decoded._id);
        req.user = user || null;
    } catch (err) {
        req.user = null;
    }
    next();
}

module.exports = { authFoodPartnerMiddleware, authUserMiddleware, optionalUserMiddleware }