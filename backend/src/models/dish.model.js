const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    cuisine: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    spiceLevel: {
        type: String,
        enum: ['mild', 'medium', 'spicy', 'extra-spicy'],
        default: 'medium',
        index: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'snack', 'dinner', 'late-night'],
        default: 'lunch',
        index: true
    },
    priceRange: {
        type: String,
        enum: ['budget', 'mid-range', 'premium'],
        default: 'mid-range'
    },
    tags: [{
        type: String,
        trim: true
    }],
    imageUrl: {
        type: String
    },
    description: {
        type: String
    },
    isVegetarian: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

dishSchema.index({ name: 'text', description: 'text', tags: 'text' });

const dishModel = mongoose.model('dish', dishSchema);
module.exports = dishModel;
