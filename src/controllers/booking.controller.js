const prisma = require("../utils/prisma");

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

module.exports = { CreateBooking };