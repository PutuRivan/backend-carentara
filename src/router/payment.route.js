const express = require('express');
const { CreateInvoice } = require('../controllers/payment.controller');

const router = express.Router();

router.post('/create-invoice', CreateInvoice)



module.exports = router