const userEventModel = require('../models/userEvent.model');
const tasteProfileModel = require('../models/tasteProfile.model');
const foodModel = require('../models/food.model');
const dishModel = require('../models/dish.model');
const dishAvailabilityModel = require('../models/dishAvailability.model');

/**
 * Log a single telemetry event and trigger taste profile recalculation
 */
async function logEvent(eventData) {
  try {
    const {
      user = null,
      guestSessionId = null,
      eventType,
      entityId = null,
      entityType = 'video',
      context = {}
    } = eventData;

    if (!eventType) {
      throw new Error('eventType is required');
    }

    const eventRecord = await userEventModel.create({
      user: user || null,
      guestSessionId: guestSessionId || null,
      eventType,
      entityId: entityId || null,
      entityType,
      context
    });

    // Trigger profile recalculation asynchronously (fire & forget to avoid blocking res)
    recalculateTasteProfile({ userId: user, guestSessionId }).catch(err => {
      console.error('Async TasteProfile recalculation error:', err.message);
    });

    return eventRecord;
  } catch (err) {
    console.error('Error logging telemetry event:', err.message);
    throw err;
  }
}

/**
 * Recalculate learned taste profile from aggregated user events
 */
async function recalculateTasteProfile({ userId, guestSessionId }) {
  if (!userId && !guestSessionId) return null;

  const query = userId ? { user: userId } : { guestSessionId };
  const events = await userEventModel.find(query).sort({ createdAt: -1 }).limit(100);

  if (events.length === 0) return null;

  // Track cuisine scores, spice frequencies, and prices
  const cuisineScores = {
    'North Indian': 0.5,
    'South Indian': 0.4,
    'Pan-Asian': 0.4,
    'Italian': 0.4,
    'Street Food': 0.5,
    'Fast Food': 0.4,
    'Mexican': 0.3
  };

  const spiceCounts = { mild: 0, medium: 0, spicy: 0, 'extra-spicy': 0 };
  const priceList = [];
  let totalInteractions = events.length;

  // Extract video/dish IDs from events
  const videoIds = events.filter(e => e.entityType === 'video' && e.entityId).map(e => e.entityId);
  const dishIds = events.filter(e => e.entityType === 'dish' && e.entityId).map(e => e.entityId);

  const [videos, dishes, availabilities] = await Promise.all([
    foodModel.find({ _id: { $in: videoIds } }).populate('dish'),
    dishModel.find({ _id: { $in: dishIds } }),
    dishAvailabilityModel.find({})
  ]);

  const videoMap = new Map(videos.map(v => [v._id.toString(), v]));
  const dishMap = new Map(dishes.map(d => [d._id.toString(), d]));

  for (const ev of events) {
    let dishObj = null;

    if (ev.entityType === 'video' && ev.entityId && videoMap.has(ev.entityId.toString())) {
      const v = videoMap.get(ev.entityId.toString());
      if (v.dish) dishObj = v.dish;
    } else if (ev.entityType === 'dish' && ev.entityId && dishMap.has(ev.entityId.toString())) {
      dishObj = dishMap.get(ev.entityId.toString());
    }

    if (!dishObj) continue;

    const cuisine = dishObj.cuisine || 'Fusion';
    const spice = dishObj.spiceLevel || 'medium';

    if (spiceCounts[spice] !== undefined) {
      spiceCounts[spice]++;
    }

    let delta = 0;
    switch (ev.eventType) {
      case 'VIDEO_COMPLETE':
        delta = 0.10;
        break;
      case 'LIKE':
        delta = 0.15;
        break;
      case 'SAVE':
        delta = 0.15;
        break;
      case 'DISH_VIEW':
        delta = 0.08;
        break;
      case 'TRAIL_ADD':
        delta = 0.12;
        break;
      case 'VIDEO_SKIP':
        delta = -0.02;
        break;
      default:
        delta = 0.02;
    }

    cuisineScores[cuisine] = Math.min(1.0, Math.max(0.1, (cuisineScores[cuisine] || 0.4) + delta));

    // Find price in availabilities
    const av = availabilities.find(a => a.dish.toString() === dishObj._id.toString());
    if (av) priceList.push(av.price);
  }

  // Determine top cuisine
  let topCuisine = 'Street Food';
  let maxScore = -1;
  for (const [c, s] of Object.entries(cuisineScores)) {
    if (s > maxScore) {
      maxScore = s;
      topCuisine = c;
    }
  }

  // Determine top spice preference
  let topSpice = 'medium';
  let maxSpiceCount = -1;
  for (const [sp, cnt] of Object.entries(spiceCounts)) {
    if (cnt > maxSpiceCount) {
      maxSpiceCount = cnt;
      topSpice = sp;
    }
  }

  // Calculate average budget
  const averageBudget = priceList.length > 0
    ? Math.round(priceList.reduce((a, b) => a + b, 0) / priceList.length)
    : 260;

  // Format summary badge
  const spiceTitle = topSpice.charAt(0).toUpperCase() + topSpice.slice(1);
  const summaryBadge = `${spiceTitle} ${topCuisine} Explorer • Avg ₹${averageBudget}`;

  // Normalize map scores for storage
  const affinitiesMap = new Map();
  for (const [c, score] of Object.entries(cuisineScores)) {
    affinitiesMap.set(c, Number(score.toFixed(2)));
  }

  const profileData = {
    cuisineAffinities: affinitiesMap,
    spicePreference: topSpice,
    averageBudget,
    distanceToleranceKm: 5.0,
    totalInteractions,
    summaryBadge
  };

  if (userId) {
    profileData.user = userId;
  }
  if (guestSessionId) {
    profileData.guestSessionId = guestSessionId;
  }

  const filter = userId ? { user: userId } : { guestSessionId };
  const updatedProfile = await tasteProfileModel.findOneAndUpdate(
    filter,
    profileData,
    { upsert: true, new: true }
  );

  return updatedProfile;
}

/**
 * Get active taste profile for a user or guest
 */
async function getProfile({ userId, guestSessionId }) {
  const query = userId ? { user: userId } : { guestSessionId };
  let profile = await tasteProfileModel.findOne(query);

  if (!profile) {
    // Generate initial baseline profile
    const defaultAffinities = new Map([
      ['North Indian', 0.85],
      ['Street Food', 0.78],
      ['Pan-Asian', 0.65],
      ['Italian', 0.60],
      ['South Indian', 0.55]
    ]);

    profile = {
      user: userId || null,
      guestSessionId: guestSessionId || null,
      cuisineAffinities: Object.fromEntries(defaultAffinities),
      spicePreference: 'medium',
      averageBudget: 260,
      distanceToleranceKm: 5.0,
      totalInteractions: 0,
      summaryBadge: 'Food Discoverer • Open to All Tastes'
    };
  }

  return profile;
}

module.exports = {
  logEvent,
  recalculateTasteProfile,
  getProfile
};
