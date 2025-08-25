const express = require("express")
const router = express.Router()
const { convertTableToCSV, getUserHistory, downloadCSV } = require("../controllers/tableController")

// POST /api/table/convert - Accept HTML table from frontend, convert to CSV
router.post("/convert", convertTableToCSV)

// GET /api/table/history/:email - Return user conversion history from MongoDB
router.get("/history/:email", getUserHistory)

// GET /api/table/download/:conversionId - Download CSV file
router.get("/download/:conversionId", downloadCSV)

module.exports = router
