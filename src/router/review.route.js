// const express = require('express');
// const { getAllReviews, getReviewsById, createReview, updateReviewStatus, deleteReviewById, getSearchReviews } = require('../controllers/review.controller');
// const authorization = require('../middlewares/Authorization');
// const router = express.Router();


// router.get('/', authorization(['USER', 'OWNER', 'ADMIN']), getAllReviews);
// router.get('/booking/:bookingId', authorization(['USER']), getReviewsById);
// router.get('/owner/cars/:carId', authorization(['OWNER']), getSearchReviews);
// router.post('/', authorization(['USER']), createReview);
// router.put('/:reviewId', authorization(['USER']), updateReviewStatus);
// router.delete('/:reviewId', authorization(['USER', 'ADMIN']), deleteReviewById);

// module.exports = router