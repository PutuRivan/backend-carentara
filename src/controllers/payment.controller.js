const { XENDIT_API_URL, XENDIT_API_KEY } = require("../config");
const prisma = require("../utils/prisma");

async function CreateInvoice(req, res) {
  try {
    const { id_user, amount } = req.body

    if (!id_user || !amount) {
      res.status(400).json({
        message: 'Data User Tidak Lengkap',
        error: 'Data Tidak Lengkap'
      });
    }

    const user = await prisma.user.findUnique({ where: { id: id_user } });

    if (!user && !user.phoneNumber) {
      res.status(400).json({
        message: 'Data User Tidak Ditemukan',
        error: 'User Tidak Ditemukan atau Tidak Memiliki Nomor Telepon'
      });
    }

    const booking = await prisma.booking.findUnique({ where: { id: id_user } });

    if (!booking) {
      res.status(400).json({
        message: 'Data Booking Tidak Ditemukan',
        error: 'Booking Tidak Ditemukan'
      });
    }

    const invoice = await fetch(`${XENDIT_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${XENDIT_API_KEY}`
      },
      body: JSON.stringify({
        "external_id": booking.id,
        "amount": amount,
        "payer_email": user.email,
        "description": "Pembayaran untuk sewa mobil",
        "customer": {
          "given_names": user.name,
          "email": user.email,
          "mobile_number": user.phoneNumber
        },
        "customer_notification_preference": {
          "invoice_created": ["whatsapp", "email"],
          "invoice_paid": ["whatsapp", "email"]
        },
        "payment_methods": ["BCA", "BNI", "BRI", "MANDIRI", "QRIS"]
      })
    }).then(res => res.json());

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

    return res.status(201).json({ message: "Invoice Created", data: payment })


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  CreateInvoice
}