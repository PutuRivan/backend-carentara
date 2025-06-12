const prisma = require('../utils/prisma');

async function getReviews(req, res) {
  const reviews = await prisma.review.findMany();
  res.json(reviews);
}

async function getReviewById(req, res) {
  const review = await prisma.review.findUnique({ where: { id: Number(req.params.id) } });
  if (!review) return res.status(404).json({ message: 'Review tidak ditemukan' });
  res.json(review);
}

async function createReview(req, res) {
  const { userId, carId, rating, comment } = req.body;
  const review = await prisma.review.create({ data: { userId, carId, rating, comment } });
  res.status(201).json(review);
}

async function updateReview(req, res) {
  const { rating, comment } = req.body;
  const updated = await prisma.review.update({
    where: { id: Number(req.params.id) },
    data: { rating, comment },
  });
  res.json(updated);
}

async function deleteReviewById(req, res) {
  await prisma.review.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Review dihapus' });

}


module.exports = { getReviews, getReviewById, createReview, updateReview, deleteReviewById };