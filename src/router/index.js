const express = require('express');
const authRoute = require('./auth.route');
const paymentRoute = require('./payment.route');

const router = express.Router();

router.use("/auth", authRoute)
router.use("/payment", paymentRoute)


module.exports = router