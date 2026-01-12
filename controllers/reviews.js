const Cafe = require('../models/cafe.js');
const Review = require('../models/review.js');

module.exports.createReview = async (req, res, next) => {
    //console.log("params:", req.params);
    //console.log("body:", req.body);

    const { id } = req.params; //get id of the current cafe
    const cafe = await Cafe.findById(id); //find the cafe with corresponding id
    //const { username, rating, textReview } = req.body.review; //get fields for new review from form
    const review = new Review(req.body.review); //create a new review
    review.author = req.user._id; //set current user as the review author (for obvs reason)

    cafe.reviews.push(review); //Add new review to cafe reviews [] field
    review.cafe = cafe; //set the cafe value in our review

    await cafe.save();
    await review.save();
    req.flash("success", "review has been submitted");
    res.redirect(`/cafes/${id}`)
}

module.exports.deleteReview = async (req, res, next) => {
    const { id, reviewId } = req.params;

    //Delete reference to review in cafe
    await Cafe.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

    //Delete review
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/cafes/${id}`);

}