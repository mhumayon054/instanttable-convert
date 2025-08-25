const mongoose = require("mongoose")

const tableConversionSchema = new mongoose.Schema(
  {
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"],
    },
    tableHTML: {
      type: String,
      required: [true, "Table HTML is required"],
      maxlength: [1000000, "Table HTML is too large (max 1MB)"],
    },
    csvFile: {
      type: String,
      trim: true,
      default: null,
    },
    csvData: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      trim: true,
      default: "converted_table.csv",
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    columnCount: {
      type: Number,
      default: 0,
    },
    conversionDate: {
      type: Date,
      default: Date.now,
    },
    conversionStatus: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloaded: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Index for faster queries
tableConversionSchema.index({ userEmail: 1, conversionDate: -1 })
tableConversionSchema.index({ conversionDate: -1 })
tableConversionSchema.index({ conversionStatus: 1 })

// Virtual for conversion age in hours
tableConversionSchema.virtual("ageInHours").get(function () {
  return Math.floor((Date.now() - this.conversionDate) / (1000 * 60 * 60))
})

// Method to mark conversion as completed
tableConversionSchema.methods.markCompleted = function (csvData, rowCount, columnCount) {
  this.conversionStatus = "completed"
  this.csvData = csvData
  this.rowCount = rowCount || 0
  this.columnCount = columnCount || 0
  return this.save()
}

// Method to mark conversion as failed
tableConversionSchema.methods.markFailed = function (errorMessage) {
  this.conversionStatus = "failed"
  this.errorMessage = errorMessage
  return this.save()
}

// Method to increment download count
tableConversionSchema.methods.incrementDownload = function () {
  this.downloadCount += 1
  this.lastDownloaded = new Date()
  return this.save()
}

// Static method to find conversions by email
tableConversionSchema.statics.findByEmail = function (email, limit = 10) {
  return this.find({ userEmail: email }).sort({ conversionDate: -1 }).limit(limit)
}

// Static method to find recent conversions
tableConversionSchema.statics.findRecent = function (hours = 24, limit = 50) {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000)
  return this.find({ conversionDate: { $gte: cutoffDate } })
    .sort({ conversionDate: -1 })
    .limit(limit)
}

// Static method to cleanup old conversions
tableConversionSchema.statics.cleanupOld = function (daysOld = 30) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
  return this.deleteMany({ conversionDate: { $lt: cutoffDate } })
}

module.exports = mongoose.model("TableConversion", tableConversionSchema)
