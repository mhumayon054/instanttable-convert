const mongoose = require("mongoose")

const userPaymentSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.5, "Amount must be at least $0.50"],
      max: [999999, "Amount cannot exceed $999,999"],
    },
    paymentId: {
      type: String,
      required: [true, "Payment ID is required"],
      unique: true,
      trim: true,
    },
    currency: {
      type: String,
      default: "usd",
      enum: ["usd", "eur", "gbp"],
    },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "canceled"],
      default: "pending",
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
userPaymentSchema.index({ email: 1, date: -1 })
userPaymentSchema.index({ paymentId: 1 })
userPaymentSchema.index({ stripePaymentIntentId: 1 })

// Virtual for formatted amount
userPaymentSchema.virtual("formattedAmount").get(function () {
  return `$${(this.amount / 100).toFixed(2)}`
})

// Method to check if payment is successful
userPaymentSchema.methods.isSuccessful = function () {
  return this.status === "succeeded"
}

// Static method to find payments by email
userPaymentSchema.statics.findByEmail = function (email) {
  return this.find({ email }).sort({ date: -1 })
}

module.exports = mongoose.model("UserPayment", userPaymentSchema)
