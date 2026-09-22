const express = require('express');
const router = express.Router();
const telemetryService = require('../services/telemetry.service');

// POST /api/events - Log telemetry event
router.post('/', async (req, res) => {
  try {
    const user = req.user || req.foodPartner;
    const { eventType, entityId, entityType, guestSessionId, context } = req.body;

    if (!eventType) {
      return res.status(400).json({ message: 'eventType is required' });
    }

    const eventRecord = await telemetryService.logEvent({
      user: user?._id || null,
      guestSessionId: guestSessionId || null,
      eventType,
      entityId: entityId || null,
      entityType: entityType || 'video',
      context: context || {}
    });

    return res.status(201).json({
      message: 'Event logged successfully',
      eventId: eventRecord._id
    });
  } catch (err) {
    console.error('Event route error:', err.message);
    return res.status(500).json({ message: 'Server error logging event', error: err.message });
  }
});

module.exports = router;
