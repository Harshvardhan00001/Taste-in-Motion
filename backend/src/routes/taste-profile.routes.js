const express = require('express');
const router = express.Router();
const telemetryService = require('../services/telemetry.service');

// GET /api/taste-profile - Get active taste profile for user or guest
router.get('/', async (req, res) => {
  try {
    const user = req.user || req.foodPartner;
    const guestSessionId = req.query.guestSessionId || null;

    const profile = await telemetryService.getProfile({
      userId: user?._id || null,
      guestSessionId
    });

    return res.status(200).json({
      message: 'Taste profile retrieved successfully',
      profile
    });
  } catch (err) {
    console.error('TasteProfile route error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving taste profile', error: err.message });
  }
});

module.exports = router;
