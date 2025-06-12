const prisma = require('../utils/prisma');

async function getCars(req, res) {
  const cars = await prisma.car.findMany();
  res.json(cars);
}

async function getCarsById(req, res) {
  const car = await prisma.car.findUnique({ where: { id: Number(req.params.id) } });
  if (!car) return res.status(404).json({ message: 'Mobil tidak ditemukan' });
  res.json(car);
}

async function createCar(req, res) {
  const { name, brand, price } = req.body;
  const car = await prisma.car.create({ data: { name, brand, price } });
  res.status(201).json(car);
}

async function updateCarById(req, res) {
  const { name, brand, price } = req.body;
  const updated = await prisma.car.update({
    where: { id: Number(req.params.id) },
    data: { name, brand, price },
  });
  res.json(updated);
}

async function deleteCarById(req, res) {
  await prisma.car.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Mobil dihapus' });
}

module.exports = { getCars, getCarsById, createCar, updateCarById, deleteCarById };