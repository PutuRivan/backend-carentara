const express = require('express');
const authorization = require('../middlewares/Authorization');
const {
  CreateBooking,
  GetUserBookings,
  GetBookingDetail,
  CancelBooking
} = require('../controllers/booking.controller');

const router = express.Router();

router.post('/', authorization(['USER']), CreateBooking);
router.get('/', authorization(['USER']), GetUserBookings);
router.get('/detail/:bookingId', authorization(['USER']), GetBookingDetail);
router.patch('/cancel/:bookingId', authorization(['USER']), CancelBooking);

module.exports = router;
