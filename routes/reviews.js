const express = require('express');
const router = express.Router({ mergeParams: true }); //allows us ot get params from mounted route

const Cafe = require('../models/cafe.js');
const Review = require('../models/review.js');
const wrapAsync = require('../helpers/WrapAsync.js');
const ExpressError = require('../helpers/ExpressError.js');
//const { reviewSchema } = require('../schemas.js');
const { isLoggedIn, validateReview, verifyReviewAuthor } = require('../middleware.js');
const ReviewsController = require('../controllers/reviews.js');

//Adding a new review to cafe with given id:
router.post('/', validateReview, isLoggedIn, wrapAsync(ReviewsController.createReview))

router.delete('/:reviewId', isLoggedIn, verifyReviewAuthor, wrapAsync(ReviewsController.deleteReview));

module.exports = router;