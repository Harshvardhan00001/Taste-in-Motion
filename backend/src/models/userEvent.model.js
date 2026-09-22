const mongoose = require('mongoose');

const userEventSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    index: true,
    default: null
  },
  guestSessionId: {
    type: String,
    index: true,
    default: null
  },
  eventType: {
    type: String,
    required: true,
    enum: [
      'VIDEO_VIEW',
      'VIDEO_COMPLETE',
      'VIDEO_SKIP',
      'LIKE',
      'SAVE',
      'SEARCH',
      'DISH_VIEW',
      'RESTAURANT_VIEW',
      'MAP_CLICK',
      'MENU_CLICK',
      'TRAIL_ADD'
    ],
    index: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  entityType: {
    type: String,
    enum: ['dish', 'video', 'restaurant', 'trail'],
    default: 'video'
  },
  context: {
    dwellTimeSeconds: { type: Number, default: 0 },
    watchPercentage: { type: Number, default: 0 },
    budget: { type: Number, default: null },
    searchQuery: { type: String, default: null },
    timestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

userEventSchema.index({ createdAt: -1 });

const userEventModel = mongoose.model('userEvent', userEventSchema);
module.exports = userEventModel;
