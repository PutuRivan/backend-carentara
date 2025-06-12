const prisma = require('../utils/prisma');

async function getBookings(req, res) {
  const bookings = await prisma.booking.findMany();
  res.json(bookings);
}

async function getBookingById(req, res) {
  const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
  if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
  res.json(booking);
}

async function createBooking(req, res) {
  const { userId, carId, startDate, endDate } = req.body;
  const booking = await prisma.booking.create({ data: { userId, carId, startDate, endDate } });
  res.status(201).json(booking);
}

async function updateBooking(req, res) {
  const { startDate, endDate } = req.body;
  const updated = await prisma.booking.update({
    where: { id: Number(req.params.id) },
    data: { startDate, endDate },
  });
  res.json(updated);
}

async function deleteBookingById(req, res) {
  await prisma.booking.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Booking dihapus' });
}


module.exports = { getBookings, getBookingById, createBooking, updateBooking, deleteBookingById };