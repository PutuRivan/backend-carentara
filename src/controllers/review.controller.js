const prisma = require('../utils/prisma');

const getReviews = async (req, res) => {
  const reviews = await prisma.review.findMany();
  res.json(reviews);
};

const getReviewById = async (req, res) => {
  const review = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });
  if (!review) return res.status(404).json({ message: 'Review tidak ditemukan' });
  res.json(review);
};

const createReview = async (req, res) => {
  const { userId, carId, rating, comment } = req.body;
  const review = await prisma.review.create({ data: { userId, carId, rating, comment } });
  res.status(201).json(review);
};

const updateReview = async (req, res) => {
  const { rating, comment } = req.body;
  const updated = await prisma.review.update({
    where: { id: Number(req.params.id) },
    data: { rating, comment },
  });
  res.json(updated);
};

const deleteReview = async (req, res) => {
  await prisma.review.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Review dihapus' });
};

module.exports = { getReviews, getReviewById, createReview, updateReview, deleteReview };