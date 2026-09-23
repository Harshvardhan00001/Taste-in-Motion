const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dish.controller');

// GET /api/dishes/:id - Canonical dish profile & media reels
router.get('/:id', dishController.getDishDetails);

// GET /api/dishes/:id/compare - Multi-restaurant comparison & city-wide benchmark
router.get('/:id/compare', dishController.compareDishRestaurants);

module.exports = router;
