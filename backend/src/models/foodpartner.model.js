const mongoose = require("mongoose");

const foodpartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [77.2090, 28.6139] // Default coordinates (Delhi)
        }
    },
    address: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: "Delhi"
    },
    phone: {
        type: String,
        default: ""
    },
    operatingHours: {
        type: String,
        default: "11:00 AM - 11:00 PM"
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 1,
        max: 5
    },
    cuisines: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

foodpartnerSchema.index({ location: '2dsphere' });

const foodpartnerModel = mongoose.model("foodpartner", foodpartnerSchema);
module.exports = foodpartnerModel;