const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/user.controller');
const authorization = require('../middlewares/Authorization');

const router = express.Router();

router.get('/', authorization(['ADMIN']), getAllUsers);
router.get('/:id', authorization(['ADMIN']), getUserById);
router.put('/:id/phone', authorization(['USER', 'OWNER', 'ADMIN']), updateUser);
router.delete('/:id', authorization(['ADMIN']), deleteUser);

module.exports = router;