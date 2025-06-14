const prisma = require("../utils/prisma");

async function GetUserBookings(req, res) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: 'User ID tidak ditemukan' });
    }

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: { car: true } // include mobil terkait jika mau
    });

    return res.status(200).json({ message: 'List booking ditemukan', data: bookings });
  } catch (error) {
    console.error('GetUserBookings Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async function GetBookingDetail(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id; // dari middleware authorization

    if (!bookingId || !userId) {
      return res.status(400).json({ message: 'Booking ID atau User ID tidak ditemukan' });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { car: true } // jika mau detail mobil
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    return res.status(200).json({ message: 'Detail booking ditemukan', data: booking });
  } catch (error) {
    console.error('GetBookingDetail Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async function CreateBooking(req, res) {
  try {
    const { userId, carId, startDate, endDate, totalPrice, phoneNumber } = req.body;

    if (!userId || !carId || !startDate || !endDate || !totalPrice || !phoneNumber) {
      return res.status(400).json({ message: 'Data booking tidak lengkap' });
    }

    // Validasi format E.164 phone number
    const e164Regex = /^\+?[1-9]\d{1,14}$/;
    if (!e164Regex.test(phoneNumber)) {
      return res.status(400).json({
        message: 'Format nomor telepon tidak valid',
        error: 'Gunakan format E.164 (contoh: +6281234567890)'
      });
    }

    // Cek booking aktif user
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: userId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'ONGOING']
        }
      }
    });

    if (existingBooking) {
      return res.status(400).json({
        message: 'User sudah memiliki booking aktif',
        error: 'Hanya diperbolehkan 1 booking aktif per user'
      });
    }

    // Cek apakah mobil tersedia
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car || !car.isAvailable) {
      return res.status(400).json({
        message: 'Mobil tidak tersedia',
        error: 'Car not available'
      });
    }

    // Buat booking baru
    const booking = await prisma.booking.create({
      data: {
        userId,
        carId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice,
        phoneNumber,
        status: 'PENDING'
      }
    });

    // Update status mobil
    await prisma.car.update({
      where: { id: carId },
      data: { isAvailable: false }
    });

    return res.status(201).json({ message: 'Booking berhasil dibuat', data: booking });

  } catch (error) {
    console.error('CreateBooking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

async function CancelBooking(req, res) {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id; // dari middleware authorization
    const { cancelReason } = req.body;

    if (!bookingId || !userId || !cancelReason) {
      return res.status(400).json({ message: 'Data pembatalan tidak lengkap' });
    }

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ message: 'Booking tidak bisa dibatalkan karena status bukan PENDING' });
    }

    // Update status booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelReason
      }
    });

    // Update mobil jadi available lagi
    await prisma.car.update({
      where: { id: booking.carId },
      data: { isAvailable: true }
    });

    return res.status(200).json({ message: 'Booking berhasil dibatalkan' });
  } catch (error) {
    console.error('CancelBooking Error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


module.exports = { CreateBooking, GetUserBookings, GetBookingDetail, CancelBooking };