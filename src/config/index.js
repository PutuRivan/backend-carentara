require("dotenv").config()

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: process.env.PORT,
  XENDIT_API_URL: process.env.XENDIT_API_URL,
  XENDIT_API_KEY: process.env.XENDIT_API_KEY
}