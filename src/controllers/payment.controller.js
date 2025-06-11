const { XENDIT_API_URL, XENDIT_API_KEY } = require("../config");
const prisma = require("../utils/prisma");

async function CreateInvoice(req, res) {
  try {
    const { email, amount } = req.body

    if (!email || !amount) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'Data Tidak Lengkap'
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(400).json({
        message: 'Gagal Menambahkan User',
        error: 'User Tidak Ditemukan'
      });
    }

    console.log(user)

    const invoice = await fetch(`${XENDIT_API_URL}/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${XENDIT_API_KEY}`
      },
      body: JSON.stringify({
        "external_id": new Date().toISOString(),
        "amount": amount,
        "payer_email": email,
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

    // const payment = await prisma.payment.create({
    //   data: {
    //     amount: amount,
    //     invoiceUrl: invoice.invoice_url
    //   }
    // })

    return res.status(201).json({ message: "Invoice Created", data: invoice })


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = {
  CreateInvoice
}