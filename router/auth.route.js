const express = require('express');
const { Login, registerUser, registerOwnerByAdmin, loginGoogle, googleCallback } = require('../controllers/auth.controller');
const authorization = require('../middlewares/Authorization');
const router = express.Router();


router.post('/register', authorization(['GUEST']), registerUser)
router.post('/login', authorization(['GUEST']), Login)
router.post('/registerOwner', authorization(['ADMIN']), registerOwnerByAdmin)
router.get('/google', loginGoogle);
router.get('/google/callback', googleCallback);


module.exports = router