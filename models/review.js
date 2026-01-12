const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    textReview: {
        type: String,
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    cafe: {
        type: Schema.Types.ObjectId,
        ref: 'Cafe'
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 