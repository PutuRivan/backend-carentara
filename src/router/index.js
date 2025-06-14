const express = require('express');
const authRoute = require('./auth.route');
const paymentRoute = require('./payment.route');
const carRoute = require('./car.route');
const bookingRoute = require('./booking.route');
const router = express.Router();

router.use("/auth", authRoute)
router.use("/payment", paymentRoute)
router.use('/auth', authRoute);
router.use('/cars', carRoute);
router.use('/booking', bookingRoute)

module.exports = router;