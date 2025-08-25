const cheerio = require("cheerio")
const createCsvWriter = require("csv-writer").createObjectCsvWriter
const TableConversion = require("../models/TableConversion")
const { validateTableHTML, sanitizeHTML } = require("../utils/validation")

// Convert HTML table to CSV
const convertTableToCSV = async (req, res) => {
  try {
    const { tableHTML, userEmail, fileName = "converted_table.csv" } = req.body

    // Validation
    if (!tableHTML) {
      return res.status(400).json({
        error: "Missing table HTML",
        message: "Table HTML is required for conversion",
      })
    }

    // Validate and sanitize HTML
    const validationResult = validateTableHTML(tableHTML)
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: "Invalid table HTML",
        message: validationResult.message,
      })
    }

    const sanitizedHTML = sanitizeHTML(tableHTML)

    // Create conversion record
    const conversion = new TableConversion({
      userEmail: userEmail || null,
      tableHTML: sanitizedHTML,
      fileName: fileName.endsWith(".csv") ? fileName : `${fileName}.csv`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      conversionStatus: "processing",
    })

    await conversion.save()

    try {
      // Parse HTML table using Cheerio
      const $ = cheerio.load(sanitizedHTML)
      const tables = $("table")

      if (tables.length === 0) {
        await conversion.markFailed("No table found in provided HTML")
        return res.status(400).json({
          error: "No table found",
          message: "The provided HTML does not contain a valid table element",
        })
      }

      // Process the first table found
      const table = tables.first()
      const rows = []
      let maxColumns = 0

      // Extract table headers
      const headers = []
      table
        .find("thead tr, tr")
        .first()
        .find("th, td")
        .each((i, element) => {
          const text = $(element).text().trim() || `Column ${i + 1}`
          headers.push(text)
        })

      if (headers.length === 0) {
        await conversion.markFailed("Table has no columns")
        return res.status(400).json({
          error: "Empty table",
          message: "The table appears to be empty or has no columns",
        })
      }

      maxColumns = headers.length

      // Extract table rows
      table.find("tbody tr, tr").each((rowIndex, row) => {
        const rowData = {}
        $(row)
          .find("td, th")
          .each((colIndex, cell) => {
            if (colIndex < headers.length) {
              const cellText = $(cell).text().trim()
              rowData[headers[colIndex]] = cellText
            }
          })

        // Only add non-empty rows
        if (Object.values(rowData).some((value) => value !== "")) {
          rows.push(rowData)
        }
      })

      if (rows.length === 0) {
        await conversion.markFailed("Table has no data rows")
        return res.status(400).json({
          error: "Empty table",
          message: "The table has no data rows to convert",
        })
      }

      // Convert to CSV format
      let csvContent = ""

      // Add headers
      csvContent += headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(",") + "\n"

      // Add data rows
      rows.forEach((row) => {
        const rowValues = headers.map((header) => {
          const value = row[header] || ""
          return `"${value.replace(/"/g, '""')}"`
        })
        csvContent += rowValues.join(",") + "\n"
      })

      // Mark conversion as completed
      await conversion.markCompleted(csvContent, rows.length, maxColumns)

      res.status(200).json({
        success: true,
        conversionId: conversion._id,
        csvData: csvContent,
        fileName: conversion.fileName,
        stats: {
          rows: rows.length,
          columns: maxColumns,
          size: Buffer.byteLength(csvContent, "utf8"),
        },
        downloadUrl: `/api/table/download/${conversion._id}`,
      })
    } catch (conversionError) {
      console.error("Table conversion error:", conversionError)
      await conversion.markFailed(conversionError.message)

      res.status(500).json({
        error: "Conversion failed",
        message: "Unable to convert table to CSV format",
        details: conversionError.message,
      })
    }
  } catch (error) {
    console.error("Table conversion controller error:", error)
    res.status(500).json({
      error: "Server error",
      message: error.message || "Unable to process table conversion",
    })
  }
}

// Get user conversion history
const getUserHistory = async (req, res) => {
  try {
    const { email } = req.params
    const { limit = 10, page = 1, status } = req.query

    if (!email) {
      return res.status(400).json({
        error: "Missing email",
        message: "Email parameter is required",
      })
    }

    const query = { userEmail: email }
    if (status && ["processing", "completed", "failed"].includes(status)) {
      query.conversionStatus = status
    }

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)
    const conversions = await TableConversion.find(query)
      .sort({ conversionDate: -1 })
      .limit(Number.parseInt(limit))
      .skip(skip)
      .select("-tableHTML -csvData") // Exclude large fields

    const total = await TableConversion.countDocuments(query)

    res.status(200).json({
      success: true,
      conversions: conversions.map((conv) => ({
        id: conv._id,
        fileName: conv.fileName,
        status: conv.conversionStatus,
        rowCount: conv.rowCount,
        columnCount: conv.columnCount,
        conversionDate: conv.conversionDate,
        downloadCount: conv.downloadCount,
        lastDownloaded: conv.lastDownloaded,
        downloadUrl: conv.conversionStatus === "completed" ? `/api/table/download/${conv._id}` : null,
      })),
      pagination: {
        current: Number.parseInt(page),
        total: Math.ceil(total / Number.parseInt(limit)),
        count: conversions.length,
        totalRecords: total,
      },
    })
  } catch (error) {
    console.error("User history error:", error)
    res.status(500).json({
      error: "Failed to fetch conversion history",
      message: error.message || "Unable to retrieve conversion history",
    })
  }
}

// Download CSV file
const downloadCSV = async (req, res) => {
  try {
    const { conversionId } = req.params

    const conversion = await TableConversion.findById(conversionId)
    if (!conversion) {
      return res.status(404).json({
        error: "Conversion not found",
        message: "No conversion found with the provided ID",
      })
    }

    if (conversion.conversionStatus !== "completed") {
      return res.status(400).json({
        error: "Conversion not ready",
        message: "The conversion is not yet completed or has failed",
      })
    }

    if (!conversion.csvData) {
      return res.status(404).json({
        error: "CSV data not found",
        message: "The CSV data is no longer available",
      })
    }

    // Increment download count
    await conversion.incrementDownload()

    // Set headers for file download
    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="${conversion.fileName}"`)
    res.setHeader("Content-Length", Buffer.byteLength(conversion.csvData, "utf8"))

    res.status(200).send(conversion.csvData)
  } catch (error) {
    console.error("CSV download error:", error)
    res.status(500).json({
      error: "Download failed",
      message: error.message || "Unable to download CSV file",
    })
  }
}

module.exports = {
  convertTableToCSV,
  getUserHistory,
  downloadCSV,
}
