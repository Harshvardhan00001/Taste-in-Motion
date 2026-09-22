/**
 * 6-Factor Recommendation Engine & Explainability Service
 * PRD Priority: P0 (Phase 4)
 * 
 * Formula:
 * Score = w1*TasteFit + w2*BudgetFit + w3*DistanceFit + w4*TimeFit + w5*Popularity + w6*Freshness
 */

const DEFAULT_WEIGHTS = {
  taste: 0.30,
  budget: 0.20,
  distance: 0.20,
  time: 0.15,
  popularity: 0.10,
  freshness: 0.05
};

const SPICE_LEVELS = ['mild', 'medium', 'spicy', 'extra-spicy'];

/**
 * 1. TasteFit (0.30): Similarity between candidate dish cuisine/spice and user's TasteProfile
 */
function calculateTasteFit(dishObj, profile) {
  if (!dishObj) return 0.60;

  const cuisine = dishObj.cuisine || 'Fusion';
  const spice = dishObj.spiceLevel || 'medium';

  // Cuisine affinity lookup
  let cuisineScore = 0.50;
  if (profile && profile.cuisineAffinities) {
    if (typeof profile.cuisineAffinities.get === 'function') {
      cuisineScore = profile.cuisineAffinities.get(cuisine) ?? 0.50;
    } else if (typeof profile.cuisineAffinities === 'object') {
      cuisineScore = profile.cuisineAffinities[cuisine] ?? 0.50;
    }
  }

  // Spice alignment
  const userSpicePref = profile?.spicePreference || 'medium';
  const dishSpiceIdx = SPICE_LEVELS.indexOf(spice);
  const userSpiceIdx = SPICE_LEVELS.indexOf(userSpicePref);

  let spiceScore = 0.50;
  if (dishSpiceIdx !== -1 && userSpiceIdx !== -1) {
    const diff = Math.abs(dishSpiceIdx - userSpiceIdx);
    if (diff === 0) spiceScore = 1.0;
    else if (diff === 1) spiceScore = 0.75;
    else if (diff === 2) spiceScore = 0.50;
    else spiceScore = 0.25;
  }

  // Weighted combination for taste
  const combined = 0.70 * cuisineScore + 0.30 * spiceScore;
  return Math.min(1.0, Math.max(0.10, Number(combined.toFixed(2))));
}

/**
 * 2. BudgetFit (0.20): Proximity between dish price and target budget
 * 1 - (|price - budget| / budget)
 */
function calculateBudgetFit(price, targetBudget = 300) {
  if (!price || price <= 0 || !targetBudget || targetBudget <= 0) return 0.70;

  const diff = Math.abs(price - targetBudget);
  const ratio = diff / targetBudget;

  let score = 1.0 - ratio;
  if (price <= targetBudget) {
    // Bonus for staying under budget
    score = Math.max(0.60, 1.0 - (diff / (targetBudget * 1.5)));
  }

  return Math.min(1.0, Math.max(0.10, Number(score.toFixed(2))));
}

/**
 * 3. DistanceFit (0.20): Exponential distance decay e^(-distanceKm / 3.0)
 */
function calculateDistanceFit(distanceKm) {
  const dist = typeof distanceKm === 'number' && !isNaN(distanceKm) ? distanceKm : 1.5;
  const score = Math.exp(-dist / 3.0);
  return Math.min(1.0, Math.max(0.05, Number(score.toFixed(2))));
}

/**
 * 4. TimeFit (0.15): Penalty if prep time + transit time exceeds time constraint
 */
function calculateTimeFit(transitMins, targetTimeAvailable = 45) {
  const totalMins = typeof transitMins === 'number' && !isNaN(transitMins) ? transitMins : 25;
  const target = typeof targetTimeAvailable === 'number' && !isNaN(targetTimeAvailable) ? targetTimeAvailable : 45;

  if (totalMins <= target) {
    const score = 1.0 - (0.20 * (totalMins / target));
    return Math.min(1.0, Math.max(0.20, Number(score.toFixed(2))));
  } else {
    const overflow = (totalMins - target) / target;
    const score = Math.max(0.10, 1.0 - overflow);
    return Math.min(1.0, Math.max(0.05, Number(score.toFixed(2))));
  }
}

/**
 * 5. Popularity (0.10): (completions + 2*saves + likes) / (views + 10)
 */
function calculatePopularity(item) {
  const completions = item.completionsCount || 0;
  const saves = item.savesCount || 0;
  const likes = item.likeCount || 0;
  const views = item.viewsCount || 0;

  // Normalized scoring formula
  const numerator = completions * 1.5 + saves * 2.0 + likes * 0.5;
  const denominator = views > 0 ? (views + 10) : 50;
  let rawRatio = numerator / denominator;

  // Baseline floor so new items don't score zero
  let normalized = 0.50 + Math.min(0.45, rawRatio * 0.5);
  return Math.min(1.0, Math.max(0.10, Number(normalized.toFixed(2))));
}

/**
 * 6. Freshness (0.05): Recency decay e^(-daysOld / 14.0)
 */
function calculateFreshness(createdAt) {
  const createdDate = createdAt ? new Date(createdAt).getTime() : Date.now();
  const daysOld = Math.max(0.1, (Date.now() - createdDate) / (1000 * 60 * 60 * 24));
  const score = Math.exp(-daysOld / 14.0);
  return Math.min(1.0, Math.max(0.10, Number(score.toFixed(2))));
}

/**
 * Calculate 6-factor composite score and return sub-score breakdown
 */
function calculate6FactorScore({
  item,
  dishObj,
  price,
  distanceKm,
  transitMins,
  profile,
  context = {},
  weights = DEFAULT_WEIGHTS
}) {
  const targetBudget = context.budget || profile?.averageBudget || 300;
  const targetTime = context.timeAvailable || 45;

  const tasteFit = calculateTasteFit(dishObj, profile);
  const budgetFit = calculateBudgetFit(price, targetBudget);
  const distanceFit = calculateDistanceFit(distanceKm);
  const timeFit = calculateTimeFit(transitMins, targetTime);
  const popularity = calculatePopularity(item);
  const freshness = calculateFreshness(item.createdAt);

  const w = { ...DEFAULT_WEIGHTS, ...weights };

  const compositeScore = 
    w.taste * tasteFit +
    w.budget * budgetFit +
    w.distance * distanceFit +
    w.time * timeFit +
    w.popularity * popularity +
    w.freshness * freshness;

  const totalScorePercent = Math.min(99, Math.max(65, Math.round(compositeScore * 100)));

  return {
    compositeScore: Number(compositeScore.toFixed(3)),
    totalScorePercent,
    subScores: {
      tasteFit,
      budgetFit,
      distanceFit,
      timeFit,
      popularity,
      freshness
    },
    weightedContributions: {
      taste: Number((w.taste * tasteFit).toFixed(3)),
      budget: Number((w.budget * budgetFit).toFixed(3)),
      distance: Number((w.distance * distanceFit).toFixed(3)),
      time: Number((w.time * timeFit).toFixed(3)),
      popularity: Number((w.popularity * popularity).toFixed(3)),
      freshness: Number((w.freshness * freshness).toFixed(3))
    },
    targetBudget,
    targetTime
  };
}

/**
 * Explainability Engine: Generate human-readable reason badge based on dominant factors
 */
function generateReasonBadge({ subScores, dishObj, partnerObj, price, distanceKm, transitMins, isSpecialty, likeCount }) {
  const cuisine = dishObj?.cuisine || 'Cuisine';
  const spice = dishObj?.spiceLevel;
  const partnerName = partnerObj?.name || 'Local Kitchen';

  // Check specialty first
  if (isSpecialty) {
    return `✨ Chef's Signature • ${cuisine}`;
  }

  // Find the top performing sub-score
  const entries = [
    { factor: 'taste', val: subScores.tasteFit },
    { factor: 'budget', val: subScores.budgetFit },
    { factor: 'distance', val: subScores.distanceFit },
    { factor: 'time', val: subScores.timeFit },
    { factor: 'popularity', val: subScores.popularity }
  ];

  entries.sort((a, b) => b.val - a.val);
  const topFactor = entries[0];

  if (topFactor.factor === 'taste' && subScores.tasteFit >= 0.70) {
    if (spice && spice !== 'mild') {
      const formattedSpice = spice.charAt(0).toUpperCase() + spice.slice(1);
      return `🔥 Matches your love for ${formattedSpice} ${cuisine}`;
    }
    return `🎯 Matches your taste for ${cuisine}`;
  }

  if ((topFactor.factor === 'time' || topFactor.factor === 'distance') && distanceKm <= 2.5) {
    return `⚡ ${distanceKm} km away • Quick ~${transitMins}m bite`;
  }

  if (topFactor.factor === 'budget' && subScores.budgetFit >= 0.80) {
    return `💰 Perfect budget match (₹${price})`;
  }

  if (topFactor.factor === 'popularity' && (likeCount > 80 || subScores.popularity >= 0.75)) {
    return `🔥 Trending in your area (${likeCount} likes)`;
  }

  if (subScores.freshness >= 0.80) {
    return `✨ Fresh drop from ${partnerName}`;
  }

  return `⚡ ${distanceKm} km away • ${cuisine} pick`;
}

/**
 * Build structured whyRecommended bullet points for explainability
 */
function buildWhyRecommended({ subScores, dishObj, partnerObj, price, targetBudget, distanceKm, transitMins, isSpecialty }) {
  const cuisine = dishObj?.cuisine || 'Food';
  const spice = dishObj?.spiceLevel || 'medium';
  const partnerName = partnerObj?.name || 'Partner Kitchen';

  const bullets = [];

  // Bullet 1: Taste affinity
  bullets.push(`Matches your preference for ${spice} ${cuisine} (${Math.round(subScores.tasteFit * 100)}% fit)`);

  // Bullet 2: Budget fit
  if (price <= targetBudget) {
    bullets.push(`Within target budget (₹${price} vs ₹${targetBudget})`);
  } else {
    bullets.push(`Close to target budget (₹${price})`);
  }

  // Bullet 3: Distance & transit
  bullets.push(`${distanceKm} km away (~${transitMins} min prep & transit)`);

  // Bullet 4: Signature / Popularity
  if (isSpecialty) {
    bullets.push(`Chef's specialty signature dish at ${partnerName}`);
  } else {
    bullets.push(`High engagement & completion rate at ${partnerName}`);
  }

  return bullets;
}

/**
 * Build structured tasteMatch factor breakdown for UI progress bars
 */
function buildTasteMatchBreakdown({ totalScorePercent, subScores, dishObj }) {
  const cuisineLabel = (dishObj?.cuisine || 'CUISINE').toUpperCase();

  return {
    totalScore: totalScorePercent,
    factors: [
      { label: 'TASTE FIT', percentage: Math.round(subScores.tasteFit * 100) },
      { label: 'BUDGET FIT', percentage: Math.round(subScores.budgetFit * 100) },
      { label: 'DISTANCE FIT', percentage: Math.round(subScores.distanceFit * 100) },
      { label: 'TIME FIT', percentage: Math.round(subScores.timeFit * 100) },
      { label: 'POPULARITY', percentage: Math.round(subScores.popularity * 100) }
    ]
  };
}

/**
 * Main Candidate Ranking Engine:
 * Takes food items, runs 6-Factor scoring, attaches explainability badges,
 * and returns ranked candidate array.
 */
function scoreAndRankCandidates(foodItems, profile, context = {}, availabilityMap = new Map()) {
  const scoredItems = foodItems.map((item, index) => {
    const itemObj = typeof item.toObject === 'function' ? item.toObject() : { ...item };
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

    // Calculate real or simulated distance
    let distanceKm = Number((0.8 + (index * 0.45) % 2.5).toFixed(1));
    if (context.userLocation?.latitude && context.userLocation?.longitude && partnerObj?.location?.coordinates) {
      const [lng, lat] = partnerObj.location.coordinates;
      const dLat = (lat - context.userLocation.latitude) * Math.PI / 180;
      const dLng = (lng - context.userLocation.longitude) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(context.userLocation.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = Number((6371 * c).toFixed(1));
    }

    const transitMins = Math.round(distanceKm * 4 + prepTime);

    // Run 6-factor calculation
    const scoreResult = calculate6FactorScore({
      item: itemObj,
      dishObj,
      price,
      distanceKm,
      transitMins,
      profile,
      context
    });

    // Generate explainable reason badge
    const reasonBadge = generateReasonBadge({
      subScores: scoreResult.subScores,
      dishObj,
      partnerObj,
      price,
      distanceKm,
      transitMins,
      isSpecialty,
      likeCount: itemObj.likeCount || 0
    });

    // Generate whyRecommended list
    const whyRecommended = buildWhyRecommended({
      subScores: scoreResult.subScores,
      dishObj,
      partnerObj,
      price,
      targetBudget: scoreResult.targetBudget,
      distanceKm,
      transitMins,
      isSpecialty
    });

    // Generate structured tasteMatch breakdown
    const tasteMatch = buildTasteMatchBreakdown({
      totalScorePercent: scoreResult.totalScorePercent,
      subScores: scoreResult.subScores,
      dishObj
    });

    return {
      ...itemObj,
      price,
      prepTimeMinutes: prepTime,
      estimatedTotalMinutes: transitMins,
      distanceKm,
      isSpecialty,
      matchScore: scoreResult.compositeScore,
      scorePercent: scoreResult.totalScorePercent,
      subScores: scoreResult.subScores,
      weightedContributions: scoreResult.weightedContributions,
      reasonBadge,
      whyRecommended,
      tasteMatch
    };
  });

  // Sort descending by composite match score
  scoredItems.sort((a, b) => b.matchScore - a.matchScore);

  return scoredItems;
}

module.exports = {
  DEFAULT_WEIGHTS,
  calculateTasteFit,
  calculateBudgetFit,
  calculateDistanceFit,
  calculateTimeFit,
  calculatePopularity,
  calculateFreshness,
  calculate6FactorScore,
  generateReasonBadge,
  buildWhyRecommended,
  buildTasteMatchBreakdown,
  scoreAndRankCandidates
};
