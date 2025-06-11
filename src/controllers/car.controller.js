const prisma = require('../utils/prisma');

const getCars = async (req, res) => {
  const cars = await prisma.car.findMany();
  res.json(cars);
};

const getCarById = async (req, res) => {
  const car = await prisma.car.findUnique({ where: { id: Number(req.params.id) } });
  if (!car) return res.status(404).json({ message: 'Mobil tidak ditemukan' });
  res.json(car);
};

const createCar = async (req, res) => {
  const { name, brand, price } = req.body;
  const car = await prisma.car.create({ data: { name, brand, price } });
  res.status(201).json(car);
};

const updateCar = async (req, res) => {
  const { name, brand, price } = req.body;
  const updated = await prisma.car.update({
    where: { id: Number(req.params.id) },
    data: { name, brand, price },
  });
  res.json(updated);
};

const deleteCar = async (req, res) => {
  await prisma.car.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Mobil dihapus' });
};

module.exports = { getCars, getCarById, createCar, updateCar, deleteCar };