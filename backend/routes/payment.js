const express = require("express")
const router = express.Router()
const { createPaymentIntent, verifyPayment, getPaymentHistory } = require("../controllers/paymentController")

// POST /api/payment/create - Create Stripe payment intent
router.post("/create", createPaymentIntent)

// POST /api/payment/verify - Verify Stripe webhook/payment status
router.post("/verify", verifyPayment)

// GET /api/payment/history/:email - Get user payment history
router.get("/history/:email", getPaymentHistory)

module.exports = router
