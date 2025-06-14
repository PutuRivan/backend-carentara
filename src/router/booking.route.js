const express = require('express');
const authorization = require('../middlewares/Authorization');
const { CreateBooking } = require('../controllers/booking.controller');
const router = express.Router();

router.post('/', authorization(['USER']), CreateBooking);


module.exports = router;