const express = require('express');
const { CreateInvoice, getOwnPayment, getPaymentForOwnCars } = require('../controllers/payment.controller');
const authorization = require('../middlewares/Authorization');

const router = express.Router();

router.post('/create-invoice', authorization(['USER']), CreateInvoice)
router.get('/', authorization(['USER']), getOwnPayment)
router.get('/owner/cars', authorization(['OWNER']), getPaymentForOwnCars)

router.post('/xendit-callback', CreateInvoice)


module.exports = router