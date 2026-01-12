const { cafeSchema, reviewSchema } = require('./schemas.js'); //Joi used to validate data
const Cafe = require('./models/cafe.js');
const Review = require('./models/review.js');
const ExpressError = require('./helpers/ExpressError.js');


// File for middlewares that are used by multiple route files:

const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        //store url the user is at before logging in, redirect to there
        req.session.returnTo = req.originalUrl;
        req.flash('error', "You must be signed in to view this page");
        return res.redirect('./login');
    }
    next();
}

const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

const validateCafe = (req, res, next) => {
    const { error } = cafeSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

const verifyAuthor = async (req, res, next) => {
    const { id } = req.params;
    const cafe = await Cafe.findById(id);

    //Check that we have the correct user making the update:
    if (!cafe.author.equals(req.user._id)) {
        req.flash("error", "Only the author can update!");
        return res.redirect(`/cafes/${cafe._id}`);
    }
    next(); //user has permission to change the campground so we keep going.   
}

const verifyReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);

    //Check that we have the correct user making the update:
    if (!review.author.equals(req.user._id)) {
        req.flash("error", "Only the author can update!");
        return res.redirect(`/cafes/${id}`);
    }
    next(); //user has permission to change the campground so we keep going.   
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(', ')
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isLoggedIn = isLoggedIn;
module.exports.storeReturnTo = storeReturnTo;
module.exports.verifyAuthor = verifyAuthor;
module.exports.verifyReviewAuthor = verifyReviewAuthor;
module.exports.validateCafe = validateCafe;
module.exports.validateReview = validateReview;