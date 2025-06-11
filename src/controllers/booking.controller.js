const prisma = require('../utils/prisma');

const getBookings = async (req, res) => {
  const bookings = await prisma.booking.findMany();
  res.json(bookings);
};

const getBookingById = async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: Number(req.params.id) } });
  if (!booking) return res.status(404).json({ message: 'Booking tidak ditemukan' });
  res.json(booking);
};

const createBooking = async (req, res) => {
  const { userId, carId, startDate, endDate } = req.body;
  const booking = await prisma.booking.create({ data: { userId, carId, startDate, endDate } });
  res.status(201).json(booking);
};

const updateBooking = async (req, res) => {
  const { startDate, endDate } = req.body;
  const updated = await prisma.booking.update({
    where: { id: Number(req.params.id) },
    data: { startDate, endDate },
  });
  res.json(updated);
};

const deleteBooking = async (req, res) => {
  await prisma.booking.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Booking dihapus' });
};

module.exports = { getBookings, getBookingById, createBooking, updateBooking, deleteBooking };