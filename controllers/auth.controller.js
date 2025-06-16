const prisma = require('../utils/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URL } = require('../config');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URL
);

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Data Tidak Lengkap'
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({
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
      return res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Data Tidak Lengkap'
      });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
      return res.status(400).json({
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
      return res.status(500).json({
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

async function loginGoogle(req, res) {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes
  });

  res.redirect(url); 
}

async function googleCallback(req, res) {
  const code = req.query.code;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();
    const { email, name, id: googleId } = data;

    // Cek user di database
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId, // pastikan ada field googleId di Prisma model user
          role: 'USER', // default role jika baru
        }
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    // Redirect ke frontend (bawa token via query param)
    res.redirect(`https://carentara.vercel.app/auth/callback?token=${token}`);

  } catch (error) {
    console.error('Google OAuth Error:', error);
    res.status(500).json({ message: 'Google OAuth gagal', error: error.message });
  }
}

module.exports = {
  registerUser,
  Login,
  registerOwnerByAdmin,
  loginGoogle,
  googleCallback
}