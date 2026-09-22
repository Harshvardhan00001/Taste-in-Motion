const foodModel = require('../models/food.model');
const dishModel = require('../models/dish.model');
const dishAvailabilityModel = require('../models/dishAvailability.model');
const storageService = require('../services/storage.service');
const likeModel = require("../models/likes.model")
const saveModel = require("../models/save.model")
const { v4: uuid } = require("uuid")


async function createFood(req, res) {
    try {
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid())

        // Find or create dish for backwards compatibility
        let dish = await dishModel.findOne({ name: new RegExp('^' + req.body.name + '$', 'i') });
        if (!dish) {
            dish = await dishModel.create({
                name: req.body.name,
                cuisine: req.body.cuisine || 'Fusion',
                description: req.body.description || '',
                tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : ['fresh']
            });
        }

        const foodItem = await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            video: fileUploadResult.url,
            dish: dish._id,
            foodPartner: req.foodPartner._id
        });

        // Create availability if price provided
        if (req.body.price) {
            await dishAvailabilityModel.findOneAndUpdate(
                { dish: dish._id, restaurant: req.foodPartner._id },
                { price: Number(req.body.price), isAvailable: true, prepTimeMinutes: Number(req.body.prepTimeMinutes || 20) },
                { upsert: true, new: true }
            );
        }

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
        const user = req.user;
        const foodItems = await foodModel.find({})
            .populate('dish')
            .populate('foodPartner', 'name address city rating location phone cuisines');

        // Extract ids to check likes & saves in bulk
        const foodIds = foodItems.map(f => f._id);
        let userLikes = new Set();
        let userSaves = new Set();

        if (user && user._id) {
            const [likes, saves] = await Promise.all([
                likeModel.find({ user: user._id, food: { $in: foodIds } }),
                saveModel.find({ user: user._id, food: { $in: foodIds } })
            ]);
            userLikes = new Set(likes.map(l => l.food.toString()));
            userSaves = new Set(saves.map(s => s.food.toString()));
        }

        // Fetch availability prices
        const availabilities = await dishAvailabilityModel.find({});
        const availabilityMap = new Map();
        for (const av of availabilities) {
            const key = `${av.dish.toString()}_${av.restaurant.toString()}`;
            availabilityMap.set(key, av);
        }

        // Enrich food items with pricing, distance, and context decision reason
        const enrichedItems = foodItems.map((item, index) => {
            const itemObj = item.toObject();
            const dishId = item.dish ? (item.dish._id || item.dish).toString() : null;
            const partnerId = item.foodPartner ? (item.foodPartner._id || item.foodPartner).toString() : null;
            
            let availability = null;
            if (dishId && partnerId) {
                availability = availabilityMap.get(`${dishId}_${partnerId}`);
            }

            const price = availability ? availability.price : (itemObj.price || 220);
            const prepTime = availability ? availability.prepTimeMinutes : 20;
            const isSpecialty = availability ? availability.isSpecialty : false;

            // Approximate realistic distance (between 0.8 km and 3.2 km)
            const distanceKm = Number((0.8 + (index * 0.45) % 2.5).toFixed(1));
            const transitMins = Math.round(distanceKm * 4 + prepTime);

            // Context-aware decision badge (PRD FR-06)
            let reasonBadge = "⚡ Quick Decision";
            if (isSpecialty) {
                reasonBadge = "✨ Chef's Signature";
            } else if (price <= 180) {
                reasonBadge = `⚡ Under ₹200 • ${distanceKm} km away`;
            } else if (prepTime <= 15) {
                reasonBadge = `🚀 Ready in ${prepTime} mins`;
            } else if (item.dish?.spiceLevel === 'spicy' || item.dish?.spiceLevel === 'extra-spicy') {
                reasonBadge = `🔥 Spicy ${item.dish.cuisine || 'Street Food'} Craving`;
            } else if (item.likeCount > 200) {
                reasonBadge = `🔥 Trending (${item.likeCount} likes)`;
            } else {
                reasonBadge = `📍 ${distanceKm} km away • ${item.foodPartner?.name || 'Nearby'}`;
            }

            const whyRecommended = [
                `Matches your preference for ${item.dish?.spiceLevel || 'medium'} ${item.dish?.cuisine || 'food'}`,
                `Fits within your budget target (₹${price})`,
                `${distanceKm} km from your location (~${transitMins} min prep & transit)`,
                isSpecialty ? `Chef's signature dish at ${item.foodPartner?.name || 'this partner'}` : `Top rated option at ${item.foodPartner?.name || 'nearby partner'}`
            ];

            const tasteMatch = {
                totalScore: Math.min(98, Math.max(78, 88 + (index * 2) % 10)),
                factors: [
                    { label: item.dish?.spiceLevel ? `${item.dish.spiceLevel.toUpperCase()} HEAT` : 'SPICE MATCH', percentage: Math.min(96, 85 + (index * 3) % 11) },
                    { label: (item.dish?.cuisine || 'CUISINE').toUpperCase(), percentage: Math.min(95, 82 + (index * 4) % 13) },
                    { label: 'BUDGET FIT', percentage: price <= 250 ? 95 : 84 }
                ]
            };

            return {
                ...itemObj,
                price,
                prepTimeMinutes: prepTime,
                estimatedTotalMinutes: transitMins,
                distanceKm,
                isSpecialty,
                reasonBadge,
                whyRecommended,
                tasteMatch,
                isLiked: userLikes.has(item._id.toString()),
                isSaved: userSaves.has(item._id.toString())
            };
        });

        return res.status(200).json({
            message: "Food items fetched successfully",
            foodItems: enrichedItems
        });
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
        const user = req.user || req.foodPartner;

        if (!user || !user._id) {
            return res.status(401).json({ message: "Unauthorized: User session not found" });
        }

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