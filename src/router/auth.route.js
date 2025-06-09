const express = require('express');
const { register, Login } = require('../controllers/auth.controller');
const router = express.Router();


router.post('/register', register)
router.post('/login', Login)

module.exports = router