const express = require('express');
const router = express.Router();
const discoveryController = require('../controllers/discovery.controller');
const { optionalUserMiddleware } = require('../middlewares/auth.middleware');

// Scored & explainable feed for Home
router.get('/feed', optionalUserMiddleware, discoveryController.getDiscoveryFeed);

// "I'm Hungry" intent filtering
router.post('/im-hungry', optionalUserMiddleware, discoveryController.imHungrySearch);

// Geospatial Map Pins
router.get('/map/nearby', discoveryController.getNearbyMapPins);

module.exports = router;
