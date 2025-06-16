const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Data Tidak Lengkap'
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Email Sudah Terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      },
      select: {
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
      }
    });

    if (!newUser) {
      res.status(500).json({
        message: 'Gagal Menambahkan User',
        error: 'Gagal Menambahkan User'
      });
    }

    res.status(201).json({
      message: 'Berhasil Menambahkan User',
      data:
        newUser
    });

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Gagal Menambahkan User',
      error: error.message
    });
  }
}

async function Login(req, res) {
  try {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
      return res.status(400).json({
        message: 'Gagal Login',
        error: 'Data Tidak Lengkap'
      });
    }

    const user = await prisma.user.findUnique({ where: { email: user_email } });

    if (!user) {
      return res.status(400).json({
        message: 'Gagal Login',
        error: 'User Tidak Ditemukan'
      });
    }

    const isPasswordValid = await bcrypt.compare(user_password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Gagal Login',
        error: 'Password Salah'
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Hapus password, createdAt, updatedAt
    const { password, createdAt, updatedAt, ...userWithoutSensitiveInfo } = user;

    res.status(200).json({
      message: 'Berhasil Login',
      data: userWithoutSensitiveInfo,
      token: token
    });

  } catch (error) {
    res.status(500).json({
      message: 'Gagal Login',
      error: error.message
    });
  }
}

async function registerOwnerByAdmin(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Data Tidak Lengkap'
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Email Sudah Terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      },
      select: {
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
      }
    })

    if (!user) {
      res.status(500).json({
        message: 'Gagal Menambahkan User',
        error: 'Gagal Menambahkan User'
      });
    }

    res.status(201).json({
      message: 'Berhasil Menambahkan User',
      data:
        user
    });

  } catch (error) {
    console.error(error)
    res.status(500).json({
      message: 'Gagal Menambahkan User',
      error: error.message
    });
  }
}


module.exports = {
  registerUser,
  Login,
  registerOwnerByAdmin
}