const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/phone', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;