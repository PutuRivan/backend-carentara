const express = require('express');
const { getAllReviews, createReview, getReviewsByCarId, deleteReview, updateReview, getReviewByBookingId, } = require('../controllers/review.controller');
const authorization = require('../middlewares/Authorization');
const router = express.Router();


router.get('/', authorization(['USER', 'OWNER', 'ADMIN']), getAllReviews);
router.get('/booking/:bookingId', authorization(['USER']), getReviewByBookingId);
router.get('/owner/cars/:carId', authorization(['OWNER']), getReviewsByCarId);
router.post('/', authorization(['USER']), createReview);
router.put('/:reviewId', authorization(['USER']), updateReview);
router.delete('/:reviewId', authorization(['USER', 'ADMIN']), deleteReview);

module.exports = router