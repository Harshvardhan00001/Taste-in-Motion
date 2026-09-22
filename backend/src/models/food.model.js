const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    video: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "dish",
        index: true
    },
    foodPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "foodpartner",
        index: true
    },
    likeCount: {
        type: Number,
        default: 0,
        min: 0
    },
    savesCount: {
        type: Number,
        default: 0,
        min: 0
    },
    viewsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    completionsCount: {
        type: Number,
        default: 0,
        min: 0
    },
    durationSeconds: {
        type: Number,
        default: 15
    }
}, {
    timestamps: true
});

const foodModel = mongoose.model("food", foodSchema);

module.exports = foodModel;