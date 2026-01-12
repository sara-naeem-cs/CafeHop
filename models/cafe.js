const mongoose = require('mongoose');
const Review = require('./review.js');
const Schema = mongoose.Schema;

const opts = { toJSON: { virtuals: true } };

const CafeSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Cafe name missing!']
    },
    image: {
        url: String,
        filename: String
    },
    price: {
        type: String,
        enum: ["", "$", "$$", "$$$", null]

    },
    seating: {
        type: String,
        enum: ["", "pickup_only", "limited", "lots", null]
    },
    wifi: {
        type: Boolean
    },
    description: {
        type: String
    },
    location: {
        type: String
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CafeSchema.index({ geometry: '2dsphere' });

CafeSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/cafes/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

module.exports = mongoose.model('Cafe', CafeSchema)
