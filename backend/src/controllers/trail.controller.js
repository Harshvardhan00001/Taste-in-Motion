const foodTrailModel = require('../models/foodTrail.model');
const dishModel = require('../models/dish.model');
const foodpartnerModel = require('../models/foodpartner.model');
const dishAvailabilityModel = require('../models/dishAvailability.model');

/**
 * Helper: Haversine distance in km between two lat/lng points
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.5;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

/**
 * Helper: Recalculate cost, distance, and duration across trail stops
 */
async function recalculateTrailMetrics(trail) {
  if (!trail.stops || trail.stops.length === 0) {
    trail.totalEstimatedCost = 0;
    trail.totalEstimatedDurationMinutes = 0;
    trail.totalDistanceKm = 0;
    return;
  }

  // 1. Total cost
  trail.totalEstimatedCost = trail.stops.reduce((sum, s) => sum + (s.estimatedPrice || 0), 0);

  // 2. Total distance & transit between stops
  const restaurantIds = trail.stops.map(s => s.restaurant).filter(Boolean);
  const partners = await foodpartnerModel.find({ _id: { $in: restaurantIds } });
  const partnerMap = new Map(partners.map(p => [p._id.toString(), p]));

  let totalDistance = 0;
  for (let i = 0; i < trail.stops.length - 1; i++) {
    const p1 = partnerMap.get(trail.stops[i].restaurant?.toString());
    const p2 = partnerMap.get(trail.stops[i + 1].restaurant?.toString());

    if (p1?.location?.coordinates && p2?.location?.coordinates) {
      const [lng1, lat1] = p1.location.coordinates;
      const [lng2, lat2] = p2.location.coordinates;
      totalDistance += calculateDistance(lat1, lng1, lat2, lng2);
    } else {
      totalDistance += 1.8; // realistic urban stop distance
    }
  }

  trail.totalDistanceKm = Number(totalDistance.toFixed(1));

  // 3. Duration: ~25 mins per stop dining/prep + ~4 mins per km transit
  const diningTime = trail.stops.length * 25;
  const transitTime = Math.round(trail.totalDistanceKm * 4);
  trail.totalEstimatedDurationMinutes = diningTime + transitTime;
}

/**
 * Ensure initial curated food trails exist in DB
 */
async function ensureCuratedTrails() {
  try {
    const count = await foodTrailModel.countDocuments({ isCurated: true });
    if (count > 0) return;

    const [dishes, partners] = await Promise.all([
      dishModel.find({}),
      foodpartnerModel.find({})
    ]);

    if (dishes.length < 3 || partners.length < 2) return;

    const fries = dishes.find(d => d.name.toLowerCase().includes('fries')) || dishes[1];
    const butterChicken = dishes.find(d => d.name.toLowerCase().includes('butter chicken')) || dishes[0];
    const pizza = dishes.find(d => d.name.toLowerCase().includes('pizza')) || dishes[3];
    const dosa = dishes.find(d => d.name.toLowerCase().includes('dosa')) || dishes[4];
    const roll = dishes.find(d => d.name.toLowerCase().includes('roll')) || dishes[2];

    const spiceRoute = partners.find(p => p.name.includes('Spice')) || partners[0];
    const smashBurger = partners.find(p => p.name.includes('Smash')) || partners[1];
    const littleItaly = partners.find(p => p.name.includes('Italy')) || partners[2] || partners[0];
    const dosaCafe = partners.find(p => p.name.includes('Dosa')) || partners[3] || partners[0];

    const trail1 = new foodTrailModel({
      title: 'South Delhi Sizzle & Slice Food Crawl',
      description: 'A legendary 3-stop food journey starting with crunchy truffle bites, progressing to rich butter chicken, and concluding with authentic woodfired pizza.',
      coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      isCurated: true,
      isPublic: true,
      stops: [
        {
          order: 1,
          dish: fries._id,
          restaurant: smashBurger._id,
          courseType: 'starter',
          estimatedPrice: 180,
          prepTimeMinutes: 12,
          note: 'Start light with crunchy truffle seasoning and dipping relish.'
        },
        {
          order: 2,
          dish: butterChicken._id,
          restaurant: spiceRoute._id,
          courseType: 'main',
          estimatedPrice: 280,
          prepTimeMinutes: 20,
          note: 'The signature main: rich, creamy smoked gravy with hot naan.'
        },
        {
          order: 3,
          dish: pizza._id,
          restaurant: littleItaly._id,
          courseType: 'dessert',
          estimatedPrice: 340,
          prepTimeMinutes: 20,
          note: 'Sourdough woodfired crust with fresh basil and mozzarella.'
        }
      ]
    });

    const trail2 = new foodTrailModel({
      title: 'Heritage Street Food & Desi Flavors',
      description: 'Experience iconic comfort food from crispy street rolls to golden desi ghee dosas and warm traditional sweets.',
      coverImage: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
      isCurated: true,
      isPublic: true,
      stops: [
        {
          order: 1,
          dish: roll._id,
          restaurant: spiceRoute._id,
          courseType: 'starter',
          estimatedPrice: 160,
          prepTimeMinutes: 15,
          note: 'Smoky spiced cottage cheese rolled in flaky paratha.'
        },
        {
          order: 2,
          dish: dosa._id,
          restaurant: dosaCafe._id,
          courseType: 'main',
          estimatedPrice: 140,
          prepTimeMinutes: 10,
          note: 'Crispy ghee roast served with three fresh chutneys and piping hot sambar.'
        }
      ]
    });

    await recalculateTrailMetrics(trail1);
    await recalculateTrailMetrics(trail2);

    await Promise.all([trail1.save(), trail2.save()]);
    console.log('Seeded curated food trails successfully.');
  } catch (err) {
    console.warn('Could not seed curated food trails:', err.message);
  }
}

/**
 * GET /api/trails
 * Get public, curated, and user-created food trails
 */
async function getTrails(req, res) {
  try {
    await ensureCuratedTrails();

    const targetUserId = req.query.userId || req.user?._id;
    let query = { isPublic: true };

    if (filter === 'curated') {
      query = { isCurated: true };
    } else if (filter === 'my' && targetUserId) {
      query = { creator: targetUserId };
    }

    const trails = await foodTrailModel.find(query)
      .populate('stops.dish')
      .populate('stops.restaurant', 'name address city rating location phone operatingHours cuisines')
      .populate('creator', 'fullName name email')
      .sort({ isCurated: -1, createdAt: -1 });

    return res.status(200).json({
      message: 'Food trails fetched successfully',
      count: trails.length,
      trails
    });
  } catch (err) {
    console.error('Error in getTrails:', err);
    return res.status(500).json({ message: 'Server error fetching trails', error: err.message });
  }
}

/**
 * GET /api/trails/:id
 * Get full food crawl itinerary details
 */
async function getTrailById(req, res) {
  try {
    const { id } = req.params;

    const trail = await foodTrailModel.findById(id)
      .populate('stops.dish')
      .populate('stops.restaurant', 'name address city rating location phone operatingHours cuisines')
      .populate('creator', 'fullName name email')
      .populate('collaborators', 'fullName name email');

    if (!trail) {
      return res.status(404).json({ message: 'Food trail not found' });
    }

    return res.status(200).json({
      message: 'Food trail itinerary retrieved successfully',
      trail
    });
  } catch (err) {
    console.error('Error in getTrailById:', err);
    return res.status(500).json({ message: 'Server error fetching trail itinerary', error: err.message });
  }
}

/**
 * POST /api/trails
 * Create a new custom food crawl
 */
async function createTrail(req, res) {
  try {
    const user = req.user;
    const {
      title,
      description = '',
      coverImage = '',
      isPublic = true,
      initialStop = null
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Trail title is required' });
    }

    const stops = [];
    if (initialStop && initialStop.dishId && initialStop.restaurantId) {
      stops.push({
        order: 1,
        dish: initialStop.dishId,
        restaurant: initialStop.restaurantId,
        courseType: initialStop.courseType || 'starter',
        estimatedPrice: Number(initialStop.estimatedPrice || 200),
        prepTimeMinutes: Number(initialStop.prepTimeMinutes || 20),
        note: initialStop.note || ''
      });
    }

    const trail = new foodTrailModel({
      title: title.trim(),
      description: description.trim(),
      creator: user?._id || null,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      isPublic,
      isCurated: false,
      stops
    });

    await recalculateTrailMetrics(trail);
    await trail.save();

    const populatedTrail = await foodTrailModel.findById(trail._id)
      .populate('stops.dish')
      .populate('stops.restaurant', 'name address city rating location phone operatingHours');

    return res.status(201).json({
      message: 'Food trail created successfully',
      trail: populatedTrail
    });
  } catch (err) {
    console.error('Error in createTrail:', err);
    return res.status(500).json({ message: 'Server error creating trail', error: err.message });
  }
}

/**
 * POST /api/trails/:id/stops
 * Append a dish stop to an existing food trail
 */
async function addStopToTrail(req, res) {
  try {
    const { id } = req.params;
    const {
      dishId,
      restaurantId,
      courseType = 'main',
      estimatedPrice = 200,
      prepTimeMinutes = 20,
      note = ''
    } = req.body;

    if (!dishId || !restaurantId) {
      return res.status(400).json({ message: 'dishId and restaurantId are required to add a stop' });
    }

    const trail = await foodTrailModel.findById(id);
    if (!trail) {
      return res.status(404).json({ message: 'Food trail not found' });
    }

    // Check if dish already in stops
    const existingIndex = trail.stops.findIndex(s => s.dish.toString() === dishId.toString());
    if (existingIndex !== -1) {
      return res.status(400).json({ message: 'This dish is already added to this trail' });
    }

    const newOrder = trail.stops.length + 1;
    trail.stops.push({
      order: newOrder,
      dish: dishId,
      restaurant: restaurantId,
      courseType,
      estimatedPrice: Number(estimatedPrice),
      prepTimeMinutes: Number(prepTimeMinutes),
      note
    });

    await recalculateTrailMetrics(trail);
    await trail.save();

    const updatedTrail = await foodTrailModel.findById(id)
      .populate('stops.dish')
      .populate('stops.restaurant', 'name address city rating location phone operatingHours');

    return res.status(200).json({
      message: 'Stop added to food trail successfully',
      trail: updatedTrail
    });
  } catch (err) {
    console.error('Error in addStopToTrail:', err);
    return res.status(500).json({ message: 'Server error adding stop to trail', error: err.message });
  }
}

/**
 * DELETE /api/trails/:id/stops/:stopIndex
 * Remove a stop from a trail and renumber remaining stops
 */
async function removeStopFromTrail(req, res) {
  try {
    const { id, stopIndex } = req.params;

    const trail = await foodTrailModel.findById(id);
    if (!trail) {
      return res.status(404).json({ message: 'Food trail not found' });
    }

    const idx = parseInt(stopIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= trail.stops.length) {
      return res.status(400).json({ message: 'Invalid stop index' });
    }

    trail.stops.splice(idx, 1);

    // Renumber remaining stops
    trail.stops.forEach((stop, i) => {
      stop.order = i + 1;
    });

    await recalculateTrailMetrics(trail);
    await trail.save();

    const updatedTrail = await foodTrailModel.findById(id)
      .populate('stops.dish')
      .populate('stops.restaurant', 'name address city rating location phone operatingHours');

    return res.status(200).json({
      message: 'Stop removed from trail successfully',
      trail: updatedTrail
    });
  } catch (err) {
    console.error('Error in removeStopFromTrail:', err);
    return res.status(500).json({ message: 'Server error removing stop from trail', error: err.message });
  }
}

module.exports = {
  getTrails,
  getTrailById,
  createTrail,
  addStopToTrail,
  removeStopFromTrail
};
