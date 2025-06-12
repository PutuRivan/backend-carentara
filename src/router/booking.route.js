const express = require('express');
const { getBookings, getBookingById, createBooking, updateBooking, deleteBookingById } = require('../controllers/booking.controller');
const router = express.Router();

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', createBooking);
router.put('/:id', updateBooking);
router.delete('/:id', deleteBookingById);

module.exports = router;