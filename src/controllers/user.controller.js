const prisma = require('../utils/prisma');

const getAllUsers = async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

const getUserById = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  res.json(user);
};

const createUser = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await prisma.user.create({ data: { name, email, password } });
  res.status(201).json(user);
};

const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const updated = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { name, email },
  });
  res.json(updated);
};

const deleteUser = async (req, res) => {
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'User dihapus' });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };