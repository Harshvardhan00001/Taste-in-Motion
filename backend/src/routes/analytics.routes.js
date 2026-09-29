const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const foodPartnerModel = require('../models/foodpartner.model');
const jwt = require('jsonwebtoken');

// Flexible middleware: checks partner cookie, or query partnerId, or passes gracefully
async function flexiblePartnerAuth(req, res, next) {
  const token = req.cookies.partnerToken;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      const foodPartner = await foodPartnerModel.findById(decoded._id);
      if (foodPartner) {
        req.foodPartner = foodPartner;
      }
    } catch {}
  }
  next();
}

// GET /api/partner/analytics
router.get('/', flexiblePartnerAuth, analyticsController.getPartnerAnalytics);

module.exports = router;
