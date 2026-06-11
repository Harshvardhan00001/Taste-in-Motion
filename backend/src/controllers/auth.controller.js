const userModel = require('../models/user.model')
const foodPartnerModel = require("../models/foodpartner.model")
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")

async function registerUser(req, res) {
    try {
        const { fullName, email, password } = req.body;

        const userAlreadyExists = await userModel.findOne({ email })
        if (userAlreadyExists) {
            return res.status(400).json({ message: "user already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await userModel.create({ fullName, email, password: hashedPassword })

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)  // ✅ consistent key

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })

        return res.status(201).json({
            message: "user register success",
            _id: user._id,
            email: user.email,
            fullName: user.fullName
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "email invalid" })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "invalid password" })
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY)  // ✅ was _id, now id — matches middleware

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })

        return res.status(200).json({
            message: "login successfully",
            user: { _id: user._id, email: user.email }
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function logOut(req, res) {
    res.clearCookie("token")
    return res.status(200).json({ message: "log out success" })
}

// FOOD PARTNER -----------------------------

async function registerFoodPartner(req, res) {
    try {
        const { name, email, password } = req.body;

        const isAccountExist = await foodPartnerModel.findOne({ email })
        if (isAccountExist) {
            return res.status(400).json({ message: "user already exists as foodpartner" })  // ✅ added return
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const foodPartner = await foodPartnerModel.create({ name, email, password: hashedPassword })

        const token = jwt.sign({ _id: foodPartner._id }, process.env.SECRET_KEY)  // ✅ consistent key

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })

        return res.status(201).json({
            message: "register success of food partner",
            foodPartner: { _id: foodPartner._id, email: foodPartner.email, name: foodPartner.name }
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function loginFoodPartner(req, res) {
    try {
        const { email, password } = req.body;

        const user = await foodPartnerModel.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "email not exists of food partner" })  // ✅ added return
        }

        const checkpass = await bcrypt.compare(password, user.password)
        if (!checkpass) {
            return res.status(401).json({ message: "user password is wrong" })  // ✅ added return
        }

        const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY)  // ✅ consistent key

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        })

        return res.status(200).json({  // ✅ was 201, login should return 200
            message: "login success as foodpartner",  // ✅ fixed typo "messgae"
            user: { _id: user._id, email: user.email }
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function logoutFoodPartner(req, res) {  // ✅ was (res, res) — both params were res!
    res.clearCookie("token")
    return res.status(200).json({ message: "log out success" })
}

module.exports = { registerUser, loginUser, logOut, registerFoodPartner, loginFoodPartner, logoutFoodPartner }