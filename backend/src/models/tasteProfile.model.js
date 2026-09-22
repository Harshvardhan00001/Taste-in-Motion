const mongoose = require('mongoose');

const tasteProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  guestSessionId: {
    type: String
  },
  cuisineAffinities: {
    type: Map,
    of: Number,
    default: {}
  },
  spicePreference: {
    type: String,
    enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
    default: 'medium'
  },
  averageBudget: {
    type: Number,
    default: 250
  },
  distanceToleranceKm: {
    type: Number,
    default: 5.0
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  summaryBadge: {
    type: String,
    default: 'Food Explorer • Open to All Tastes'
  }
}, {
  timestamps: true
});

// Partial filter indexes: enforce uniqueness only when field is present and non-null
tasteProfileSchema.index(
  { user: 1 },
  { unique: true, partialFilterExpression: { user: { $type: 'objectId' } } }
);

tasteProfileSchema.index(
  { guestSessionId: 1 },
  { unique: true, partialFilterExpression: { guestSessionId: { $type: 'string' } } }
);

const tasteProfileModel = mongoose.model('tasteProfile', tasteProfileSchema);
module.exports = tasteProfileModel;
