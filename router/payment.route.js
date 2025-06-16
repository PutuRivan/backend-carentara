const express = require('express');
const { CreateInvoice, getOwnPayment, getPaymentForOwnCars, updatePaymentStatusByAdmin, getAllPayments, deletePaymentByAdmin, UpdateInvoice } = require('../controllers/payment.controller');
const authorization = require('../middlewares/Authorization');

const router = express.Router();

router.post('/create-invoice', authorization(['USER']), CreateInvoice)
router.get('/', authorization(['USER']), getOwnPayment)
router.get('/owner/cars', authorization(['OWNER']), getPaymentForOwnCars)
router.put('/admin/update-invoice', authorization(['ADMIN']), updatePaymentStatusByAdmin)
router.get('/admin', authorization(['ADMIN']), getAllPayments)
router.delete('/admin/:id', authorization(['ADMIN']), deletePaymentByAdmin)

router.post('/xendit-callback', UpdateInvoice)


module.exports = router