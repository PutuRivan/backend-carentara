const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');         
const carRoute = require('./car.route');
const bookingRoute = require('./booking.route');
const reviewRoute = require('./review.route');
const paymentRoute = require('./payment.route');

const router = express.Router();

router.use("/auth", authRoute)
router.use('/users', userRoute);                   
router.use('/cars', carRoute);
router.use('/booking', bookingRoute);
router.use('/review', reviewRoute);
router.use("/payment", paymentRoute)


module.exports = router;