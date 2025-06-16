const express = require('express');
const { getAllReviews, createReview, getReviewsByOwnCar, deleteReview, updateReview, getReviewByBookingId, } = require('../controllers/review.controller');
const authorization = require('../middlewares/Authorization');
const router = express.Router();


router.get('/', authorization(['GUEST', 'USER', 'OWNER', 'ADMIN']), getAllReviews);
router.get('/booking/:bookingId', authorization(['USER']), getReviewByBookingId);
router.get('/owner/cars/:carId', authorization(['OWNER']), getReviewsByOwnCar);
router.post('/', authorization(['USER']), createReview);
router.put('/:reviewId', authorization(['USER']), updateReview);
router.delete('/:reviewId', authorization(['USER', 'ADMIN']), deleteReview);

module.exports = router