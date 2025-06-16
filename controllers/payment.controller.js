const { XENDIT_CALLBACK_TOKEN } = require("../config");
const prisma = require("../utils/prisma");
const { XenditCreateInvoice } = require("../utils/xendit/create-invoice");

async function CreateInvoice(req, res) {
  try {
    const { email, amount, bookingId } = req.body

    if (!email || !amount || !bookingId) {
      res.status(400).json({
        message: 'Data Tidak Lengkap',
        error: 'Data Tidak Lengkap'
      });
    }

    const user = await prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      res.status(400).json({
        message: 'Data User Tidak Ditemukan',
        error: 'User Tidak Ditemukan atau Tidak Memiliki Nomor Telepon'
      });
    }

    if (!user.phoneNumber) {
      res.status(400).json({
        message: 'Data User Tidak Ditemukan',
        error: 'User Tidak Ditemukan atau Tidak Memiliki Nomor Telepon'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      res.status(400).json({
        message: 'Data Booking Tidak Ditemukan',
        error: 'Booking Tidak Ditemukan'
      });
    }

    if (booking.status !== 'PENDING') {
      res.status(400).json({
        message: 'Data Booking Tidak Ditemukan',
        error: 'Booking Tidak Ditemukan'
      });
    }

    const invoice = await XenditCreateInvoice(user.email, amount, booking.id, user.name, user.phoneNumber);

    if (!invoice) {
      res.status(400).json({
        message: 'Invoice Gagal Dibuat',
        error: 'Invoice Tidak Ditemukan'
      });
    }

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: amount,
        transactionId: invoice.id,
        invoiceUrl: invoice.invoice_url,
      }
    })

    return res.status(201).json({ message: "Invoice Created", data: payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function UpdateInvoice(req, res) {
  const callbackToken = req.headers['X-CALLBACK-TOKEN'];
  const weebHookId = req.headers['webhook-id'];
  
  if (callbackToken !== XENDIT_CALLBACK_TOKEN || !weebHookId) {
    return res.status(403).json({ message: 'Invalid callback token' });
  }

  // lanjut update payment seperti biasa
  const { id, status } = req.body;

  const payment = await prisma.payment.findUnique({
    where: { transactionId: id },
  });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (status === 'PAID') {
    await prisma.payment.update({
      where: { transactionId: id },
      data: { status: 'SUCCESS' },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  res.status(200).json({ message: 'Callback processed' });
}

async function getOwnPayment(req, res) {
  try {
    const userId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: {
        booking: { userId }
      },
    });

    if (!payments) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment found', data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getPaymentForOwnCars(req, res) {
  try {
    const ownerId = req.user.id;

    const payments = await prisma.payment.findMany({
      where: {
        booking: { car: { ownerId } }
      },
    });

    if (!payments) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment found', data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function updatePaymentStatusByAdmin(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: { status },
    });

    res.status(200).json({ message: 'Payment status updated', data: updatedPayment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function getAllPayments(req, res) {
  try {
    const payments = await prisma.payment.findMany();

    if (!payments) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.status(200).json({ message: 'Payment found', data: payments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function deletePaymentByAdmin(req, res) {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    await prisma.payment.delete({ where: { id } });

    res.status(200).json({ message: 'Payment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  CreateInvoice,
  UpdateInvoice,
  getOwnPayment,
  getPaymentForOwnCars,
  updatePaymentStatusByAdmin,
  getAllPayments,
  deletePaymentByAdmin
}