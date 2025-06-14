const express = require('express');
const router = express.Router();

const authRoute = require('./auth.route');
const userRoute = require('./user.route');         
const carRoute = require('./car.route');
const bookingRoute = require('./booking.route');
const paymentRoute = require('./payment.route');

// REGISTER ROUTES
router.use('/auth', authRoute);                    
router.use('/users', userRoute);                   
router.use('/cars', carRoute);                     
router.use('/bookings', bookingRoute);             
router.use('/payment', paymentRoute);              

module.exports = router;