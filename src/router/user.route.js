const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET semua user / search
router.get('/', userController.getAllUsers);

// GET user by ID
router.get('/:id', userController.getUserById);

// UPDATE hanya nomor telepon
router.put('/:id/phone', userController.updateUserPhone);

// DELETE user by ID
router.delete('/:id', userController.deleteUser);

module.exports = router;