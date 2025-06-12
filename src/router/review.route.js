const express = require('express');
const { getReviews, getReviewById, createReview, updateReview, deleteReviewById } = require('../controllers/review.controller');
const router = express.Router();

router.get('/', getReviews);
router.get('/:id', getReviewById);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReviewById);

module.exports = router;