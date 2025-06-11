const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const carRoute = require('./car.route');
const bookingRoute = require('./booking.route');
const reviewRoute = require('./review.route');

const router = express.Router();

// Routing utama
router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/cars', carRoute);
router.use('/bookings', bookingRoute);
router.use('/reviews', reviewRoute);

module.exports = router;