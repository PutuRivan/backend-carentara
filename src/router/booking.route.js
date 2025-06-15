const express = require('express');
const authorization = require('../middlewares/Authorization');
const {
  CreateBooking,
  GetBookingDetailOnOwnCar,
  CancelBooking,
  GetOwnBookingByUser,
  deleteBookingByAdmin,
  updateBookingOnOwnCar
} = require('../controllers/booking.controller');

const router = express.Router();

router.post('/', authorization(['USER']), CreateBooking);
router.get('/', authorization(['USER']), GetOwnBookingByUser);
router.get('/detail/:bookingId', authorization(['OWNER']), GetBookingDetailOnOwnCar);
router.put('/cancel/:bookingId', authorization(['USER']), CancelBooking);
router.put('/update/:bookingId', authorization(['OWNER']), updateBookingOnOwnCar);
router.delete('/delete/:bookingId', authorization(['ADMIN']), deleteBookingByAdmin);

module.exports = router;
