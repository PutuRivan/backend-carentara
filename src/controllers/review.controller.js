const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// [POST] Buat review baru (hanya USER)
exports.createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user.id;

  try {
    // Cek apakah booking valid dan milik user
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: userId,
        status: 'COMPLETED',
      },
    });

    if (!booking) {
      return res.status(400).json({ message: 'Booking tidak valid atau belum selesai.' });
    }

    // Cek apakah review sudah pernah dibuat untuk booking ini
    const existing = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existing) {
      return res.status(400).json({ message: 'Review untuk booking ini sudah ada.' });
    }

    const newReview = await prisma.review.create({
      data: {
        bookingId,
        userId,
        rating,
        comment,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [PUT] Update review milik sendiri (USER)
exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.userId !== userId) {
      return res.status(403).json({ message: 'Tidak boleh mengedit review ini.' });
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [DELETE] Delete review (USER = miliknya, ADMIN = siapa saja)
exports.deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review tidak ditemukan.' });
    }

    if (userRole !== 'ADMIN' && review.userId !== userId) {
      return res.status(403).json({ message: 'Tidak boleh menghapus review ini.' });
    }

    await prisma.review.delete({ where: { id: reviewId } });
    res.json({ message: 'Review berhasil dihapus.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] Semua review (USER, OWNER, ADMIN)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true,
        booking: {
          include: { car: true },
        },
      },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] Review berdasarkan Booking ID (hanya USER)
exports.getReviewByBookingId = async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId,
        status: 'COMPLETED',
      },
    });

    if (!booking) {
      return res.status(403).json({ message: 'Booking tidak ditemukan atau belum selesai.' });
    }

    const review = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (!review) {
      return res.status(404).json({ message: 'Review belum dibuat.' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// [GET] OWNER melihat review untuk mobil miliknya
exports.getReviewsForOwnCars = async (req, res) => {
  const { carId } = req.params;
  const ownerId = req.user.id;

  try {
    const car = await prisma.car.findFirst({
      where: {
        id: carId,
        ownerId,
      },
    });

    if (!car) {
      return res.status(403).json({ message: 'Mobil ini bukan milikmu.' });
    }

    const reviews = await prisma.review.findMany({
      where: {
        booking: {
          carId,
        },
      },
      include: {
        user: true,
        booking: true,
      },
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
