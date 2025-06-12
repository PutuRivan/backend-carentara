const prisma = require('../utils/prisma');

async function getAllUsers(req, res) {
  const users = await prisma.user.findMany();
  res.json(users);
}

async function getUserById(req, res) {
  const user = await prisma.user.findUnique({ where: { id: Number(req.params.id) } });

  if (!user) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  res.json(user);
}

async function updateUser(res, res) {
  const { name, email } = req.body;
  const updated = await prisma.user.update({ where: { email }, data: { name, email } });
  res.json(updated);
}

async function deleteUserById(req, res) {
  const { id } = req.body;

  await prisma.user.delete({ where: { id } });

  res.json({ message: 'User dihapus' });

}

module.exports = { getAllUsers, getUserById, updateUser, deleteUserById };