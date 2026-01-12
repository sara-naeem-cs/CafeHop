const Joi = require('joi');

module.exports.cafeSchema = Joi.object({
    cafe: Joi.object({
        title: Joi.string().trim().min(2).required(),
        price: Joi.string().valid('', '$', '$$', '$$$').optional(),//.min(0),
        seating: Joi.string().valid('', 'pickup_only', 'limited', 'lots').optional(),
        wifi: Joi.boolean()
            .truthy('on')
            .falsy('off')
            .optional(),
        //image: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().trim().min(2).required()
    }).required(),
    deleteImage: Joi.boolean()
        .truthy('on')
        .falsy('off')
        .optional()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        textReview: Joi.string().required(),
    }).required()
});