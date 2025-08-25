const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)
const UserPayment = require("../models/UserPayment")

// Create Stripe payment intent
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, email, currency = "usd" } = req.body

    // Validation
    if (!amount || !email) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "Amount and email are required",
      })
    }

    if (amount < 50) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be at least $0.50",
      })
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: {
        email,
        service: "instanttable-convert",
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    // Save payment record to MongoDB
    const userPayment = new UserPayment({
      email,
      amount: Math.round(amount),
      paymentId: paymentIntent.id,
      currency: currency.toLowerCase(),
      stripePaymentIntentId: paymentIntent.id,
      status: "pending",
    })

    await userPayment.save()

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id,
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
    })
  } catch (error) {
    console.error("Payment intent creation error:", error)
    res.status(500).json({
      error: "Payment processing failed",
      message: error.message || "Unable to create payment intent",
    })
  }
}

// Verify payment status (webhook or manual verification)
const verifyPayment = async (req, res) => {
  try {
    const { paymentId, status } = req.body

    if (!paymentId) {
      return res.status(400).json({
        error: "Missing payment ID",
        message: "Payment ID is required for verification",
      })
    }

    // Find payment in database
    const payment = await UserPayment.findOne({
      $or: [{ paymentId }, { stripePaymentIntentId: paymentId }],
    })

    if (!payment) {
      return res.status(404).json({
        error: "Payment not found",
        message: "No payment record found with the provided ID",
      })
    }

    // If status is provided, update it
    if (status && ["succeeded", "failed", "canceled"].includes(status)) {
      payment.status = status
      await payment.save()
    } else {
      // Verify with Stripe if no status provided
      const paymentIntent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId)
      payment.status = paymentIntent.status === "succeeded" ? "succeeded" : paymentIntent.status
      await payment.save()
    }

    res.status(200).json({
      success: true,
      payment: {
        id: payment.paymentId,
        email: payment.email,
        amount: payment.amount,
        status: payment.status,
        date: payment.date,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    res.status(500).json({
      error: "Payment verification failed",
      message: error.message || "Unable to verify payment",
    })
  }
}

// Get user payment history
const getPaymentHistory = async (req, res) => {
  try {
    const { email } = req.params
    const { limit = 10, page = 1 } = req.query

    if (!email) {
      return res.status(400).json({
        error: "Missing email",
        message: "Email parameter is required",
      })
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const payments = await UserPayment.find({ email })
      .sort({ date: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)
      .select("-stripePaymentIntentId -metadata")

    const total = await UserPayment.countDocuments({ email })

    res.status(200).json({
      success: true,
      payments,
      pagination: {
        current: Number.parseInt(page),
        total: Math.ceil(total / Number.parseInt(limit)),
        count: payments.length,
        totalRecords: total,
      },
    })
  } catch (error) {
    console.error("Payment history error:", error)
    res.status(500).json({
      error: "Failed to fetch payment history",
      message: error.message || "Unable to retrieve payment history",
    })
  }
}

module.exports = {
  createPaymentIntent,
  verifyPayment,
  getPaymentHistory,
}
