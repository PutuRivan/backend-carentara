const express = require('express');
const { Login, registerUser, registerOwnerByAdmin } = require('../controllers/auth.controller');
const router = express.Router();


router.post('/register', registerUser)
router.post('/login', Login)
router.post('/registerOwner', registerOwnerByAdmin)


module.exports = router