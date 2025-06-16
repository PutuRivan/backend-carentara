const { XENDIT_API_URL, XENDIT_API_KEY } = require("../../config");


async function XenditCreateInvoice(email, amount, bookingId, name, phoneNumber) {
  const response = await fetch(`${XENDIT_API_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${XENDIT_API_KEY}`
    },
    body: JSON.stringify({
      "external_id": bookingId,
      "amount": amount,
      "payer_email": email,
      "description": "Pembayaran untuk sewa mobil",
      "customer": {
        "given_names": name,
        "email": email,
        "mobile_number": phoneNumber
      },
      "customer_notification_preference": {
        "invoice_created": ["whatsapp", "email"],
        "invoice_paid": ["whatsapp", "email"]
      },
      "payment_methods": ["BCA", "BNI", "BRI", "MANDIRI", "QRIS"]
    })
  })

  const data = await response.json()
  return data
}

module.exports = { XenditCreateInvoice };