const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    try {
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            video: fileUploadResult.url,
            foodPartner: req.foodPartner._id
        })

        return res.status(201).json({
            message: "food created successfully",
            food: foodItem
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function getFoodItems(req, res) {
    try {
        const foodItems = await foodModel.find({})
        return res.status(200).json({
            message: "Food items fetched successfully",
            foodItems
        })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function likeFood(req, res) {
    try {
        const { foodId } = req.body;
        
        // 1. Fallback check for user object depending on your middleware
        const user = req.user || req.foodPartner; 

        if (!user || !user._id) {
            return res.status(401).json({ message: "Unauthorized: User session not found" });
        }

        if (!foodId) {
            return res.status(400).json({ message: "Bad Request: foodId is required" });
        }

        const isAlreadyLiked = await likeModel.findOne({
            user: user._id,
            food: foodId
        })

        if (isAlreadyLiked) {
            await likeModel.deleteOne({ user: user._id, food: foodId })
            await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: -1 } })
            return res.status(200).json({ message: "Food unliked successfully", like: false })
        }

        await likeModel.create({ user: user._id, food: foodId })
        await foodModel.findByIdAndUpdate(foodId, { $inc: { likeCount: 1 } })

        return res.status(201).json({ message: "Food liked successfully", like: true })
    } catch (err) {
        // This will print the exact internal error to your backend terminal
        console.error("Error in likeFood:", err); 
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}
async function saveFood(req, res) {
    try {
        const { foodId } = req.body;
        const user = req.user;

        const isAlreadySaved = await saveModel.findOne({
            user: user._id,
            food: foodId
        })

        if (isAlreadySaved) {
            await saveModel.deleteOne({ user: user._id, food: foodId })
            await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: -1 } })
            return res.status(200).json({ message: "Food unsaved successfully", save: false })
        }

        const save = await saveModel.create({ user: user._id, food: foodId })
        await foodModel.findByIdAndUpdate(foodId, { $inc: { savesCount: 1 } })

        return res.status(201).json({ message: "Food saved successfully", save: true })
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}

async function getSaveFood(req, res) {
    try {
        const user = req.user;
        const savedFoods = await saveModel.find({ user: user._id }).populate('food');

        return res.status(200).json({
            message: "Saved foods retrieved successfully",
            savedFoods: savedFoods ?? []
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message })
    }
}


module.exports = {
    createFood,
    getFoodItems,
    likeFood,
    saveFood,
    getSaveFood
}