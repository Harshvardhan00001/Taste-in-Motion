const foodModel = require('../models/food.model');
const dishModel = require('../models/dish.model');
const dishAvailabilityModel = require('../models/dishAvailability.model');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');
const recommendationService = require('../services/recommendation.service');
const telemetryService = require('../services/telemetry.service');

/**
 * POST /api/discovery/im-hungry
 * Context-aware candidate search & recommendation for hungry users
 */
async function imHungrySearch(req, res) {
    try {
        const {
            budget = 1000,
            timeAvailable = 60,
            maxDistanceKm = 10,
            cravings = [],
            userLocation = null
        } = req.body;

        const user = req.user;

        // Fetch all food reels with populated dish and partner info
        const foodItems = await foodModel.find({})
            .populate('dish')
            .populate('foodPartner', 'name address city rating location phone operatingHours');

        // Extract food ids for bulk likes/saves lookup
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

        // Fetch availability records
        const availabilities = await dishAvailabilityModel.find({});
        const availabilityMap = new Map();
        for (const av of availabilities) {
            const key = `${av.dish.toString()}_${av.restaurant.toString()}`;
            availabilityMap.set(key, av);
        }

        // Process and score all candidates against user's situational constraints
        const processedItems = foodItems.map((item, index) => {
            const itemObj = item.toObject();
            const dishObj = item.dish ? (typeof item.dish === 'object' ? item.dish : null) : null;
            const dishId = dishObj ? dishObj._id.toString() : null;
            const partnerObj = item.foodPartner ? (typeof item.foodPartner === 'object' ? item.foodPartner : null) : null;
            const partnerId = partnerObj ? partnerObj._id.toString() : null;

            let availability = null;
            if (dishId && partnerId) {
                availability = availabilityMap.get(`${dishId}_${partnerId}`);
            }

            const price = availability ? availability.price : (itemObj.price || 220);
            const prepTime = availability ? availability.prepTimeMinutes : 20;
            const isSpecialty = availability ? availability.isSpecialty : false;

            // Distance calculation (fallback to realistic simulation if no coordinates provided)
            let distanceKm = Number((0.8 + (index * 0.45) % 2.5).toFixed(1));
            if (userLocation && userLocation.latitude && userLocation.longitude && partnerObj && partnerObj.location && partnerObj.location.coordinates) {
                const [lng, lat] = partnerObj.location.coordinates;
                const dLat = (lat - userLocation.latitude) * Math.PI / 180;
                const dLng = (lng - userLocation.longitude) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(userLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                distanceKm = Number((6371 * c).toFixed(1));
            }

            const transitMins = Math.round(distanceKm * 4 + prepTime);

            // Cravings match evaluation
            const dishCuisine = (dishObj?.cuisine || '').toLowerCase();
            const dishSpice = (dishObj?.spiceLevel || '').toLowerCase();
            const dishName = (dishObj?.name || itemObj.name || '').toLowerCase();
            const dishTags = (dishObj?.tags || []).map(t => t.toLowerCase());

            const matchedCravings = [];
            const normalizedCravings = cravings.map(c => c.replace(/[^\w\s]/gi, '').trim().toLowerCase()).filter(Boolean);

            for (const craving of normalizedCravings) {
                if (
                    dishCuisine.includes(craving) ||
                    dishSpice.includes(craving) ||
                    dishName.includes(craving) ||
                    dishTags.some(t => t.includes(craving)) ||
                    (craving === 'spicy' && (dishSpice === 'spicy' || dishSpice === 'extra-spicy')) ||
                    (craving === 'healthy' && dishObj?.isVegetarian)
                ) {
                    matchedCravings.push(craving.charAt(0).toUpperCase() + craving.slice(1));
                }
            }

            // Constraint evaluation
            const budgetPass = price <= budget;
            const timePass = transitMins <= timeAvailable;
            const distancePass = distanceKm <= maxDistanceKm;
            const cravingsPass = cravings.length === 0 || matchedCravings.length > 0;

            const isStrictMatch = budgetPass && timePass && distancePass && cravingsPass;

            // Scoring formula for ranking
            let score = 100;
            score -= Math.max(0, (price - budget) * 0.2);
            score -= Math.max(0, (transitMins - timeAvailable) * 1.5);
            score -= distanceKm * 5;
            if (matchedCravings.length > 0) score += matchedCravings.length * 20;
            if (isSpecialty) score += 15;

            // Tailored whyRecommended bullet points for explainability
            const whyRecommended = [];
            if (budgetPass) {
                whyRecommended.push(`Fits within your target budget (₹${price} ≤ ₹${budget})`);
            } else {
                whyRecommended.push(`Close to budget (₹${price})`);
            }

            if (distancePass) {
                whyRecommended.push(`${distanceKm} km away (within ${maxDistanceKm} km radius)`);
            } else {
                whyRecommended.push(`${distanceKm} km from location`);
            }

            if (timePass) {
                whyRecommended.push(`Ready in ~${transitMins} min (${prepTime} min prep + transit)`);
            } else {
                whyRecommended.push(`~${transitMins} min total time`);
            }

            if (matchedCravings.length > 0) {
                whyRecommended.push(`Matches cravings: ${matchedCravings.join(', ')}`);
            } else if (dishObj?.cuisine) {
                whyRecommended.push(`Fresh ${dishObj.cuisine} option`);
            }

            // Reason badge
            let reasonBadge = `⚡ Under ₹${budget} • ${distanceKm} km`;
            if (matchedCravings.length > 0) {
                reasonBadge = `🔥 ${matchedCravings[0]} Match • ₹${price}`;
            } else if (timePass && transitMins <= 25) {
                reasonBadge = `⏱️ Quick ~${transitMins} min meal`;
            }

            const tasteMatch = {
                totalScore: Math.min(99, Math.max(75, Math.round(score))),
                factors: [
                    { label: 'BUDGET FIT', percentage: budgetPass ? 95 : Math.max(50, Math.round(100 - (price - budget) * 0.2)) },
                    { label: 'TIME FIT', percentage: timePass ? 92 : Math.max(40, Math.round(100 - (transitMins - timeAvailable) * 2)) },
                    { label: (dishObj?.cuisine || 'CUISINE').toUpperCase(), percentage: matchedCravings.length > 0 ? 94 : 82 }
                ]
            };

            return {
                ...itemObj,
                price,
                prepTimeMinutes: prepTime,
                estimatedTotalMinutes: transitMins,
                distanceKm,
                isSpecialty,
                isStrictMatch,
                matchScore: score,
                matchedCravings,
                reasonBadge,
                whyRecommended,
                tasteMatch,
                isLiked: userLikes.has(item._id.toString()),
                isSaved: userSaves.has(item._id.toString())
            };
        });

        // Filter strict matches first
        let candidateItems = processedItems.filter(i => i.isStrictMatch);

        // Soft fallback: if strict filtering yields empty results, return top candidates matching budget/distance
        if (candidateItems.length === 0) {
            candidateItems = processedItems.filter(i => i.price <= budget * 1.25);
        }
        if (candidateItems.length === 0) {
            candidateItems = processedItems;
        }

        // Sort by match score descending
        candidateItems.sort((a, b) => b.matchScore - a.matchScore);

        return res.status(200).json({
            message: "Contextual candidates retrieved successfully",
            count: candidateItems.length,
            foodItems: candidateItems
        });
    } catch (err) {
        console.error("Error in imHungrySearch:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

/**
 * GET /api/discovery/feed
 * 6-Factor scored, explainable recommendation feed for Home
 */
async function getDiscoveryFeed(req, res) {
    try {
        const user = req.user;
        const guestSessionId = req.query.guestSessionId || req.headers['x-guest-session-id'] || null;

        // Contextual parameters (budget, timeAvailable, location)
        let userLocation = null;
        if (req.query.lat && req.query.lng) {
            userLocation = {
                latitude: parseFloat(req.query.lat),
                longitude: parseFloat(req.query.lng)
            };
        }

        const budget = req.query.budget ? Number(req.query.budget) : undefined;
        const timeAvailable = req.query.timeAvailable ? Number(req.query.timeAvailable) : undefined;

        // Fetch candidate food reels with populated dish and partner info
        const foodItems = await foodModel.find({})
            .populate('dish')
            .populate('foodPartner', 'name address city rating location phone operatingHours cuisines');

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

        // Fetch availability records
        const availabilities = await dishAvailabilityModel.find({});
        const availabilityMap = new Map();
        for (const av of availabilities) {
            const key = `${av.dish.toString()}_${av.restaurant.toString()}`;
            availabilityMap.set(key, av);
        }

        // Fetch TasteProfile for user or guest
        const profile = await telemetryService.getProfile({
            userId: user?._id || null,
            guestSessionId
        });

        // Run 6-factor scoring and ranking
        const rankedItems = recommendationService.scoreAndRankCandidates(
            foodItems,
            profile,
            { budget, timeAvailable, userLocation },
            availabilityMap
        );

        // Attach user like and save statuses
        const finalItems = rankedItems.map(item => ({
            ...item,
            isLiked: userLikes.has(item._id.toString()),
            isSaved: userSaves.has(item._id.toString())
        }));

        return res.status(200).json({
            message: "Personalized discovery feed generated successfully",
            count: finalItems.length,
            foodItems: finalItems
        });
    } catch (err) {
        console.error("Error in getDiscoveryFeed:", err);
        return res.status(500).json({ message: "Server error generating discovery feed", error: err.message });
    }
}

module.exports = {
    imHungrySearch,
    getDiscoveryFeed
};
