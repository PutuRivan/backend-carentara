const { parsePhoneNumberFromString } = require('libphonenumber-js');
const prisma = require('../utils/prisma');

async function getAllUsers(req, res) {
  try {
    const { search } = req.query;

    const users = await prisma.user.findMany({
      where: search
        ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }
        : {},
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Berhasil mengambil data user',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data user',
      error: error.message
    });
  }
};

async function getUserById(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan'
      });
    }

    res.status(200).json({
      message: 'Berhasil mengambil data user',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data user',
      error: error.message
    });
  }
};

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        message: 'Nomor telepon harus diisi'
      });
    }

    const parsedPhoneNumber = parsePhoneNumberFromString(phoneNumber, 'ID'); // 'ID' untuk Indonesia
    if (!parsedPhoneNumber || !parsedPhoneNumber.isValid()) {
      return res.status(400).json({
        message: 'Format nomor telepon tidak valid'
      });
    }

    const formattedPhoneNumber = parsedPhoneNumber.number; // E.164 format

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { phoneNumber: formattedPhoneNumber },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Nomor telepon berhasil diupdate',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      message: 'Gagal memperbarui user',
      error: error.message
    });
  }
};

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      message: 'User berhasil dihapus'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Gagal menghapus user',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};