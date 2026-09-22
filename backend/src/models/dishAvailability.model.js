const mongoose = require('mongoose');

const dishAvailabilitySchema = new mongoose.Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'dish',
        required: true,
        index: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        index: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    prepTimeMinutes: {
        type: Number,
        default: 20,
        min: 1
    },
    isSpecialty: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound unique index: a restaurant can only have one availability record per dish
dishAvailabilitySchema.index({ dish: 1, restaurant: 1 }, { unique: true });

const dishAvailabilityModel = mongoose.model('dishAvailability', dishAvailabilitySchema);
module.exports = dishAvailabilityModel;
