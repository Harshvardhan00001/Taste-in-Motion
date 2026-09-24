const mongoose = require('mongoose');

const trailStopSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true,
    default: 1
  },
  dish: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'dish',
    required: true
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'foodpartner',
    required: true
  },
  courseType: {
    type: String,
    enum: ['starter', 'main', 'dessert', 'beverage', 'snack'],
    default: 'main'
  },
  estimatedPrice: {
    type: Number,
    default: 200
  },
  prepTimeMinutes: {
    type: Number,
    default: 20
  },
  note: {
    type: String,
    default: ''
  }
}, {
  _id: true,
  timestamps: true
});

const foodTrailSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    default: null
  },
  coverImage: {
    type: String,
    default: ''
  },
  stops: [trailStopSchema],
  totalEstimatedCost: {
    type: Number,
    default: 0
  },
  totalEstimatedDurationMinutes: {
    type: Number,
    default: 0
  },
  totalDistanceKm: {
    type: Number,
    default: 0
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  isCurated: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const foodTrailModel = mongoose.model('foodTrail', foodTrailSchema);
module.exports = foodTrailModel;
