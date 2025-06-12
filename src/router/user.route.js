const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser, deleteUserById } = require('../controllers/user.controller');

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUserById);

module.exports = router;