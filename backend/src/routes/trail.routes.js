const express = require('express');
const router = express.Router();
const trailController = require('../controllers/trail.controller');
const { optionalUserMiddleware } = require('../middlewares/auth.middleware');

// GET /api/trails - List all curated and public food trails
router.get('/', optionalUserMiddleware, trailController.getTrails);

// GET /api/trails/:id - Get full trail itinerary with stops and math
router.get('/:id', trailController.getTrailById);

// POST /api/trails - Create a new food crawl
router.post('/', optionalUserMiddleware, trailController.createTrail);

// POST /api/trails/:id/stops - Add a dish stop to trail
router.post('/:id/stops', trailController.addStopToTrail);

// DELETE /api/trails/:id/stops/:stopIndex - Remove a stop from trail
router.delete('/:id/stops/:stopIndex', trailController.removeStopFromTrail);

module.exports = router;
