const cheerio = require("cheerio")

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// HTML sanitization options
const ALLOWED_TAGS = ["table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col"]
const ALLOWED_ATTRIBUTES = ["colspan", "rowspan", "scope", "headers"]

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false
  return EMAIL_REGEX.test(email.trim().toLowerCase())
}

/**
 * Validate payment amount
 * @param {number} amount - Amount in cents
 * @returns {object} - Validation result with isValid and message
 */
const validatePaymentAmount = (amount) => {
  if (!amount || typeof amount !== "number") {
    return {
      isValid: false,
      message: "Amount must be a valid number",
    }
  }

  if (amount < 50) {
    return {
      isValid: false,
      message: "Amount must be at least $0.50 (50 cents)",
    }
  }

  if (amount > 99999999) {
    return {
      isValid: false,
      message: "Amount cannot exceed $999,999.99",
    }
  }

  return {
    isValid: true,
    message: "Valid amount",
  }
}

/**
 * Validate HTML table structure
 * @param {string} html - HTML string to validate
 * @returns {object} - Validation result with isValid and message
 */
const validateTableHTML = (html) => {
  if (!html || typeof html !== "string") {
    return {
      isValid: false,
      message: "HTML content is required",
    }
  }

  // Check if HTML is too large (1MB limit)
  if (html.length > 1000000) {
    return {
      isValid: false,
      message: "HTML content is too large (maximum 1MB allowed)",
    }
  }

  try {
    const $ = cheerio.load(html)
    const tables = $("table")

    if (tables.length === 0) {
      return {
        isValid: false,
        message: "No table element found in HTML",
      }
    }

    // Check if table has content
    const firstTable = tables.first()
    const rows = firstTable.find("tr")

    if (rows.length === 0) {
      return {
        isValid: false,
        message: "Table has no rows",
      }
    }

    // Check if table has columns
    const firstRow = rows.first()
    const cells = firstRow.find("td, th")

    if (cells.length === 0) {
      return {
        isValid: false,
        message: "Table has no columns",
      }
    }

    return {
      isValid: true,
      message: "Valid table HTML",
      stats: {
        tableCount: tables.length,
        rowCount: rows.length,
        columnCount: cells.length,
      },
    }
  } catch (error) {
    return {
      isValid: false,
      message: `Invalid HTML structure: ${error.message}`,
    }
  }
}

/**
 * Sanitize HTML to only allow table-related tags and safe attributes
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
const sanitizeHTML = (html) => {
  if (!html || typeof html !== "string") return ""

  try {
    const $ = cheerio.load(html)

    // Remove all script tags and their content
    $("script").remove()

    // Remove all style tags and their content
    $("style").remove()

    // Remove all link tags
    $("link").remove()

    // Remove all meta tags
    $("meta").remove()

    // Remove dangerous event handlers and attributes
    const dangerousAttributes = [
      "onload",
      "onerror",
      "onclick",
      "onmouseover",
      "onmouseout",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
      "onreset",
      "onselect",
      "onkeydown",
      "onkeypress",
      "onkeyup",
      "javascript:",
      "vbscript:",
      "data:",
      "style",
    ]

    $("*").each((i, element) => {
      const $element = $(element)

      // Remove dangerous attributes
      dangerousAttributes.forEach((attr) => {
        $element.removeAttr(attr)
      })

      // If element is not in allowed tags, unwrap it (keep content, remove tag)
      if (!ALLOWED_TAGS.includes(element.tagName?.toLowerCase())) {
        $element.replaceWith($element.html() || "")
      } else {
        // For allowed tags, only keep allowed attributes
        const attributes = element.attribs || {}
        Object.keys(attributes).forEach((attr) => {
          if (!ALLOWED_ATTRIBUTES.includes(attr.toLowerCase())) {
            $element.removeAttr(attr)
          }
        })
      }
    })

    // Return only the table content
    const tables = $("table")
    if (tables.length > 0) {
      return tables.first().toString()
    }

    return html
  } catch (error) {
    console.error("HTML sanitization error:", error)
    return ""
  }
}

/**
 * Validate file name for CSV export
 * @param {string} fileName - File name to validate
 * @returns {object} - Validation result with isValid, message, and sanitized name
 */
const validateFileName = (fileName) => {
  if (!fileName || typeof fileName !== "string") {
    return {
      isValid: true,
      message: "Using default filename",
      sanitizedName: "converted_table.csv",
    }
  }

  // Remove dangerous characters
  let sanitized = fileName
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, "") // Remove dangerous characters
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/\.+/g, ".") // Replace multiple dots with single dot
    .trim()

  // Ensure it's not empty after sanitization
  if (!sanitized) {
    sanitized = "converted_table"
  }

  // Ensure .csv extension
  if (!sanitized.toLowerCase().endsWith(".csv")) {
    sanitized += ".csv"
  }

  // Limit length
  if (sanitized.length > 100) {
    const nameWithoutExt = sanitized.slice(0, -4)
    sanitized = nameWithoutExt.slice(0, 96) + ".csv"
  }

  return {
    isValid: true,
    message: "Valid filename",
    sanitizedName: sanitized,
  }
}

/**
 * Escape CSV field value
 * @param {string} value - Value to escape
 * @returns {string} - Escaped CSV value
 */
const escapeCSVField = (value) => {
  if (value === null || value === undefined) return ""

  const stringValue = String(value)

  // If the value contains comma, newline, or double quote, wrap in quotes
  if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
    // Escape existing double quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""')
    return `"${escapedValue}"`
  }

  return stringValue
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of headers
 * @returns {string} - CSV string
 */
const arrayToCSV = (data, headers = null) => {
  if (!Array.isArray(data) || data.length === 0) {
    return ""
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0])

  // Create header row
  const headerRow = csvHeaders.map(escapeCSVField).join(",")

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders.map((header) => escapeCSVField(row[header] || "")).join(",")
  })

  return [headerRow, ...dataRows].join("\n")
}

/**
 * Log API request for debugging
 * @param {object} req - Express request object
 * @param {string} action - Action being performed
 * @param {object} metadata - Additional metadata to log
 */
const logAPIRequest = (req, action, metadata = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${new Date().toISOString()} - ${action}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get("User-Agent"),
      ...metadata,
    })
  }
}

/**
 * Log error with context
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 * @param {object} metadata - Additional metadata
 */
const logError = (error, context, metadata = {}) => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${context}`, {
    message: error.message,
    stack: error.stack,
    ...metadata,
  })
}

module.exports = {
  isValidEmail,
  validatePaymentAmount,
  validateTableHTML,
  sanitizeHTML,
  validateFileName,
  escapeCSVField,
  arrayToCSV,
  logAPIRequest,
  logError,
}
