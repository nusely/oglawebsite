// routes/requests.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const { query, run } = require("../config/azure-database");
const {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");
const { sendEmail } = require("../utils/email");
const { logActivity } = require("./activities");
const { generateInvoicePDF } = require("../utils/pdfGenerator");

const router = express.Router();

/**
 * Helper: generate sequential invoice number like OGL-00125YY
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);

  // find last request for the year
  const yearRequests = await query(
    "SELECT TOP(1) request_number FROM requests WHERE request_number LIKE ? ORDER BY request_number DESC",
    [`OGL-%${yearShort}%`]
  );

  let nextNumber = 1;
  if (yearRequests.length > 0) {
    const lastNumber = yearRequests[0].request_number;
    // expecting format OGL-<seq><yy>, e.g. OGL-0012323
    const match = lastNumber.match(/OGL-(\d+)(\d{2})/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `OGL-${String(nextNumber).padStart(3, "0")}${yearShort}`;
};

/**
 * GET / - Get all requests (admin only)
 */
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requests = await query(`
      SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName
      FROM requests r 
      LEFT JOIN users u ON r.userId = u.id 
      ORDER BY r.createdAt DESC
    `);

    // Parse JSON fields and format data
    const formattedRequests = requests.map((request) => {
      let parsedCustomerData = null;
      let parsedItems = [];
      let parsedPdfMetadata = {};

      try {
        parsedCustomerData = request.customerData
          ? JSON.parse(request.customerData)
          : null;
      } catch (e) {
        parsedCustomerData = null;
        console.error("Failed parsing customerData for request", request.id, e);
      }

      try {
        parsedItems = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        parsedItems = [];
        console.error("Failed parsing items for request", request.id, e);
      }

      try {
        parsedPdfMetadata = request.pdfMetadata
          ? JSON.parse(request.pdfMetadata)
          : {};
      } catch (e) {
        parsedPdfMetadata = {};
        console.error("Failed parsing pdfMetadata for request", request.id, e);
      }

      let customerName = "Anonymous Customer";
      let customerEmail = "Unknown";
      let isGuest = false;

      if (parsedCustomerData) {
        customerName =
          `${parsedCustomerData.firstName || ""} ${
            parsedCustomerData.lastName || ""
          }`.trim() || "Anonymous Customer";
        customerEmail = parsedCustomerData.email || "Unknown";
        isGuest = !!parsedCustomerData.isGuest;
      } else if (request.customerName) {
        customerName = request.customerName;
        customerEmail = request.customerEmail || "Unknown";
      }

      if (isGuest) {
        customerName += " (Guest)";
      }

      // Parse Azure SQL date format to ISO string
      let formattedCreatedAt = new Date().toISOString(); // fallback
      try {
        const dateStr = request.createdAt.toString();
        let parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
          // Handle Azure SQL format like "Sep 17 2025  1:12AM" (note the double space)
          const parts = dateStr.match(/(\w+) (\d+) (\d+) +(\d+):(\d+)(\w+)/);
          if (parts) {
            const [, month, day, year, hour, minute, ampm] = parts;
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            parsedDate = new Date(year, monthMap[month], day, hour24, minute);
          }
        }
        if (!isNaN(parsedDate.getTime())) {
          formattedCreatedAt = parsedDate.toISOString();
        }
      } catch (error) {
        console.error('Date parsing error:', error, 'for date:', request.createdAt);
      }

      return {
        ...request,
        items: parsedItems,
        customerData: parsedCustomerData,
        pdfMetadata: parsedPdfMetadata,
        customerName,
        customerEmail,
        isGuest,
        createdAt: formattedCreatedAt,
      };
    });

    return res.json({
      success: true,
      data: { requests: formattedRequests },
    });
  } catch (error) {
    console.error("Get all requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get requests" });
  }
});

/**
 * POST / - Submit new request (optional auth)
 */
router.post(
  "/",
  optionalAuth,
  [
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one item is required"),
    body("items.*.productId")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Valid product ID is required"),
    body("items.*.quantity")
      .isInt({ min: 1 })
      .withMessage("Valid quantity is required"),
    body("items.*.price")
      .isFloat({ min: 0 })
      .withMessage("Valid price is required"),
    body("totalAmount")
      .isFloat({ min: 0 })
      .withMessage("Valid total amount is required"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
    body("customerData")
      .optional()
      .isObject()
      .withMessage("Customer data must be an object"),
  ],
  async (req, res) => {
    try {
      // validations
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { items, totalAmount, notes, customerData } = req.body;
      const userId = req.user ? req.user.id : null;

      // debug info removed for production

      console.log("Generating invoice number...");
      const requestNumber = await generateInvoiceNumber();
      console.log("Generated request number:", requestNumber);

      const pdfMetadata = {
        generated: false,
        generatedAt: null,
        adminDownloaded: false,
        adminDownloadedAt: null,
        adminDownloadedBy: null,
      };

      const customerName = customerData
        ? `${customerData.firstName || ""} ${
            customerData.lastName || ""
          }`.trim() || "Anonymous Customer"
        : "Anonymous Customer";

      // handle guest users
      let finalUserId = userId;
      let finalCustomerData = customerData || null;
      if (!userId && customerData) {
        // For guest users, set userId to NULL and store guest info in customerData
        finalUserId = null;
        const guestId = `guest_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        finalCustomerData = {
          ...customerData,
          isGuest: true,
          guestId: guestId,
          submittedAt: new Date().toISOString(),
        };
        // debug info removed for production
      }

      const customerEmail = customerData?.email || null;
      const customerPhone = customerData?.phone || null;
      const companyName = customerData?.companyName || null;

      console.log("Inserting request into database...");
      console.log("Insert data:", {
        finalUserId,
        customerName,
        customerEmail,
        customerPhone,
        companyName,
        requestNumber,
        totalAmount,
        notes: notes || null,
      });

      const result = await run(
        `INSERT INTO requests (
          userId, customerName, customerEmail, customerPhone, companyName,
          items, totalAmount, status, notes, pdfPath, createdAt, updatedAt,
          request_number, customerData, pdfMetadata
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, GETUTCDATE(), GETUTCDATE(),
          ?, ?, ?
        )`,
        [
          finalUserId,
          customerName,
          customerEmail,
          customerPhone,
          companyName,
          JSON.stringify(items),
          totalAmount,
          "pending",
          notes || null,
          null, // pdfPath
          requestNumber,
          finalCustomerData ? JSON.stringify(finalCustomerData) : null,
          JSON.stringify(pdfMetadata),
        ]
      );

      console.log("Request inserted successfully:", result);

      // Get the inserted ID from the result
      const insertedId = result.insertId ?? result.lastID ?? result.id ?? null;
      console.log("Extracted insertedId:", insertedId);

      // Log activity (include item summary)
      await logActivity(
        finalUserId,
        "request_submitted",
        "request",
        insertedId,
        "User submitted request",
        req,
        {
          requestNumber,
          totalAmount,
          itemCount: Array.isArray(items) ? items.length : 0,
          customerData: finalCustomerData
            ? {
                firstName: finalCustomerData.firstName,
                lastName: finalCustomerData.lastName,
                email: finalCustomerData.email,
                companyName: finalCustomerData.companyName,
                isGuest: !!finalCustomerData.isGuest,
              }
            : null,
        }
      );

      // If we have an email, attempt to generate PDF and send confirmation
      let emailSent = false;
      if (finalCustomerData && finalCustomerData.email) {
        try {
          const pdfData = {
            invoiceNumber: requestNumber,
            customer: finalCustomerData,
            items,
            totalAmount,
            submittedAt: new Date().toISOString(),
            status: "pending",
          };

          try {
            // console.log("🔄 Starting PDF generation for confirmation email...");
            const pdfBuffer = await generateInvoicePDF(pdfData);
            console.log(
              // console.log(
              pdfBuffer.length
            );

            await sendEmail({
              to: finalCustomerData.email,
              template: "requestConfirmation",
              data: {
                customerName: `${finalCustomerData.firstName || ""} ${
                  finalCustomerData.lastName || ""
                }`.trim(),
                requestNumber,
                totalAmount,
                date: new Date().toLocaleDateString("en-GB"),
                status: "pending",
                items: (items || []).map((item) => ({
                  name: item.name || `Product ${item.productId}`,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
              attachments: [
                {
                  filename: `Proforma_Invoice_${requestNumber}.pdf`,
                  content: pdfBuffer,
                  contentType: "application/pdf",
                },
              ],
            });
            emailSent = true;
            console.log(
              "✅ Confirmation email with PDF sent to:",
              finalCustomerData.email
            );
          } catch (pdfError) {
            // fallback: send email without PDF
            await sendEmail({
              to: finalCustomerData.email,
              template: "requestConfirmation",
              data: {
                customerName: `${finalCustomerData.firstName || ""} ${
                  finalCustomerData.lastName || ""
                }`.trim(),
                requestNumber,
                totalAmount,
                date: new Date().toLocaleDateString("en-GB"),
                status: "pending",
                items: (items || []).map((item) => ({
                  name: item.name || `Product ${item.productId}`,
                  quantity: item.quantity,
                  price: item.price,
                })),
              },
            });
            emailSent = true;
            console.log(
              "✅ Fallback confirmation email sent to:",
              finalCustomerData.email
            );
          }
        } catch (emailError) {}
      } else {
        // console.log("⚠️ No email sent - missing customer email.");
      }

      return res.status(201).json({
        success: true,
        message: userId
          ? "Request submitted successfully"
          : "Request submitted successfully. Check your email for the invoice.",
        data: {
          requestId: insertedId,
          requestNumber,
          userId: finalUserId,
          customerName,
          customerEmail: customerEmail || null,
          isGuest: !userId,
          emailSent,
        },
      });
    } catch (error) {
      console.error("Submit request error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      return res.status(500).json({
        success: false,
        message: "Failed to submit request",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

/**
 * POST /:requestNumber/user-pdf
 * Returns user-view invoice data (and records that pdf metadata generated)
 */
router.post("/:requestNumber/user-pdf", optionalAuth, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const requests = await query(
      `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.request_number = ?`,
      [requestNumber]
    );

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const request = requests[0];
    let items = [];
    let customerData = null;

    try {
      items = request.items ? JSON.parse(request.items) : [];
    } catch (e) {
      items = [];
    }
    try {
      customerData = request.customerData
        ? JSON.parse(request.customerData)
        : null;
    } catch (e) {
      customerData = null;
    }

    const userInvoiceData = {
      invoiceNumber: requestNumber,
      customer: customerData || {
        firstName: request.firstName || "Unknown",
        lastName: request.lastName || "Customer",
        email: request.userEmail || "Unknown",
        companyName: request.companyName || "Unknown Company",
        phone: request.customerPhone || "Not provided",
        companyType: "Not specified",
        companyRole: "Not specified",
      },
      items,
      totalAmount: request.totalAmount,
      submittedAt: request.createdAt,
      status: request.status,
    };

    // mark generated true
    const pdfMetadata = {
      generated: true,
      generatedAt: new Date().toISOString(),
      adminDownloaded: false,
      adminDownloadedAt: null,
      adminDownloadedBy: null,
    };

    await query(
      "UPDATE requests SET pdfMetadata = ?, updatedAt = GETUTCDATE() WHERE request_number = ?",
      [JSON.stringify(pdfMetadata), requestNumber]
    );

    return res.json({
      success: true,
      message: "User PDF data generated",
      data: userInvoiceData,
    });
  } catch (error) {
    console.error("User PDF generation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate user PDF data" });
  }
});

/**
 * POST /:requestNumber/pdf-generated
 * Called by frontend after it actually generates a PDF for the user to record metadata
 */
router.post("/:requestNumber/pdf-generated", optionalAuth, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const pdfMetadata = {
      generated: true,
      generatedAt: new Date().toISOString(),
      adminDownloaded: false,
      adminDownloadedAt: null,
      adminDownloadedBy: null,
    };

    await query(
      "UPDATE requests SET pdfMetadata = ?, updatedAt = GETUTCDATE() WHERE request_number = ?",
      [JSON.stringify(pdfMetadata), requestNumber]
    );

    return res.json({ success: true, message: "PDF generation recorded" });
  } catch (error) {
    console.error("PDF generation update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update PDF generation status",
    });
  }
});

/**
 * POST /:requestNumber/admin-pdf
 * Admin-only PDF generation + download (with admin stamp)
 */
router.post(
  "/:requestNumber/admin-pdf",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { requestNumber } = req.params;
      const requests = await query(
        `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.request_number = ?`,
        [requestNumber]
      );

      if (requests.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }

      const request = requests[0];

      let items = [];
      let customerData = null;
      let pdfMetadata = {};

      try {
        items = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        items = [];
      }
      try {
        customerData = request.customerData
          ? JSON.parse(request.customerData)
          : null;
      } catch (e) {
        customerData = null;
      }
      try {
        pdfMetadata = request.pdfMetadata
          ? JSON.parse(request.pdfMetadata)
          : {};
      } catch (e) {
        pdfMetadata = {};
      }

      const adminInvoiceData = {
        invoiceNumber: requestNumber,
        customer: customerData || {
          firstName: request.firstName || "Unknown",
          lastName: request.lastName || "Customer",
          email: request.userEmail || "Unknown",
          companyName: request.companyName || "Unknown Company",
          phone: request.customerPhone || "Not provided",
          companyType: "Not specified",
          companyRole: "Not specified",
        },
        items,
        totalAmount: request.totalAmount,
        submittedAt: request.createdAt,
        status: request.status,
        adminStamp: true,
      };

      // update metadata for admin download
      pdfMetadata.adminDownloaded = true;
      pdfMetadata.adminDownloadedAt = new Date().toISOString();
      pdfMetadata.adminDownloadedBy = req.user?.email || null;

      await query(
        "UPDATE requests SET pdfMetadata = ?, updatedAt = GETUTCDATE() WHERE request_number = ?",
        [JSON.stringify(pdfMetadata), requestNumber]
      );

      // create PDF and send as downloadable buffer
      try {
        console.log("🔄 Starting admin PDF generation...");
        console.log("Admin invoice data:", {
          invoiceNumber: adminInvoiceData.invoiceNumber,
          customerName:
            adminInvoiceData.customer?.firstName +
            " " +
            adminInvoiceData.customer?.lastName,
          itemCount: adminInvoiceData.items?.length || 0,
        });

        const pdfBuffer = await generateInvoicePDF(adminInvoiceData);
        console.log(
          "✅ Admin PDF generated successfully, size:",
          pdfBuffer.length
        );

        await logActivity(
          req.user.id,
          "admin_pdf_downloaded",
          "request",
          request.id,
          "Admin downloaded PDF invoice",
          req,
          {
            requestNumber,
            totalAmount: request.totalAmount,
            itemCount: Array.isArray(items) ? items.length : 0,
            customerData: customerData
              ? {
                  firstName: customerData.firstName,
                  lastName: customerData.lastName,
                  email: customerData.email,
                  companyName: customerData.companyName,
                }
              : null,
          }
        );

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="Admin_Invoice_${requestNumber}.pdf"`
        );
        res.setHeader("Content-Length", pdfBuffer.length);
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        // Ensure binary response
        return res.end(pdfBuffer, "binary");
      } catch (pdfError) {
        console.error("Admin PDF generation failed:", pdfError);
        return res
          .status(500)
          .json({ success: false, message: "Failed to generate admin PDF" });
      }
    } catch (error) {
      console.error("Admin PDF generation error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate admin PDF" });
    }
  }
);

/**
 * POST /:requestNumber/user-pdf
 * User PDF generation + download (without admin stamp)
 * For authenticated users only - they can only download their own PDFs
 */
router.post("/:requestNumber/user-pdf", authenticateToken, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const userId = req.user.id;

    // Get the request - users can only download their own PDFs
    const requests = await query(
      `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.request_number = ? AND r.userId = ?`,
      [requestNumber, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied",
      });
    }

    const request = requests[0];

    let items = [];
    let customerData = null;
    try {
      items = request.items ? JSON.parse(request.items) : [];
      customerData = request.customerData
        ? JSON.parse(request.customerData)
        : null;
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      items = [];
      customerData = null;
    }

    // Prepare invoice data for user PDF (no admin stamp)
    const invoiceData = {
      invoiceNumber: request.request_number,
      customer: customerData || {
        firstName: request.firstName || "Unknown",
        lastName: request.lastName || "User",
        email: request.userEmail || "No email",
        phone: "Not provided",
        companyName: request.companyName || "Not provided",
        companyType: "Not specified",
        companyRole: "Not specified",
      },
      items: items.map((item) => ({
        name: item.name || `Product ${item.productId}`,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: request.totalAmount,
      submittedAt: request.createdAt,
      status: request.status,
    };

    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData, false); // false = no admin stamp

      // Log activity
      await logActivity(
        req.user.id,
        "user_pdf_downloaded",
        "request",
        request.id,
        "User downloaded PDF invoice",
        req,
        {
          requestNumber,
          totalAmount: request.totalAmount,
          itemCount: Array.isArray(items) ? items.length : 0,
        }
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Proforma_Invoice_${requestNumber}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      // Ensure binary response
      return res.end(pdfBuffer, "binary");
    } catch (pdfError) {
      console.error("User PDF generation failed:", pdfError);
      return res
        .status(500)
        .json({ success: false, message: "Failed to generate PDF" });
    }
  } catch (error) {
    console.error("User PDF generation error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to generate PDF" });
  }
});

/**
 * POST /:requestNumber/public-pdf
 * Public PDF generation for guest users
 * Requires email verification for security
 */
router.post("/:requestNumber/public-pdf", async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for PDF download",
      });
    }

    // Get the request - verify email matches the request
    const requests = await query(
      `SELECT r.*, 
         COALESCE(u.firstName, JSON_VALUE(r.customerData, '$.firstName')) as firstName,
         COALESCE(u.lastName, JSON_VALUE(r.customerData, '$.lastName')) as lastName,
         COALESCE(u.email, JSON_VALUE(r.customerData, '$.email')) as userEmail,
         COALESCE(u.companyName, JSON_VALUE(r.customerData, '$.companyName')) as companyName
         FROM requests r 
         LEFT JOIN users u ON r.userId = u.id 
         WHERE r.request_number = ?`,
      [requestNumber]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    const request = requests[0];

    // Extract email from request data
    let requestEmail = request.userEmail;
    if (!requestEmail && request.customerData) {
      try {
        const customerData = JSON.parse(request.customerData);
        requestEmail = customerData.email;
      } catch (e) {
        console.error("Error parsing customer data:", e);
      }
    }

    // Verify email matches (case insensitive)
    if (!requestEmail || requestEmail.toLowerCase() !== email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: "Email does not match the request",
      });
    }

    // Parse request data
    let items = [];
    let customerData = null;
    try {
      items = request.items ? JSON.parse(request.items) : [];
      customerData = request.customerData
        ? JSON.parse(request.customerData)
        : null;
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      items = [];
      customerData = null;
    }

    // Prepare invoice data
    const invoiceData = {
      invoiceNumber: request.request_number,
      customer: customerData || {
        firstName: request.firstName || "Unknown",
        lastName: request.lastName || "User",
        email: requestEmail,
        phone: "Not provided",
        companyName: request.companyName || "Not provided",
        companyType: "Not specified",
        companyRole: "Not specified",
      },
      items: items.map((item) => ({
        name: item.name || `Product ${item.productId}`,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: request.totalAmount,
      submittedAt: request.createdAt,
      status: request.status,
    };

    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData, false);

      // Log activity (no user ID for guest downloads)
      await logActivity(
        null,
        "public_pdf_downloaded",
        "request",
        request.id,
        "Public PDF downloaded via email verification",
        req,
        {
          requestNumber,
          email: email,
          totalAmount: request.totalAmount,
          itemCount: Array.isArray(items) ? items.length : 0,
        }
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="Proforma_Invoice_${requestNumber}.pdf"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      return res.end(pdfBuffer, "binary");
    } catch (pdfError) {
      console.error("Public PDF generation failed:", pdfError);
      return res.status(500).json({
        success: false,
        message: "Failed to generate PDF",
      });
    }
  } catch (error) {
    console.error("Public PDF generation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate PDF",
    });
  }
});

/**
 * GET /:requestNumber/data - get request data for PDF generation (authenticated users only)
 */
router.get("/:requestNumber/data", authenticateToken, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    const userId = req.user.id;

    const requests = await query(
      `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.request_number = ? AND r.userId = ?`,
      [requestNumber, userId]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found or access denied",
      });
    }

    const request = requests[0];

    // Parse JSON fields
    let items = [];
    let customerData = null;
    try {
      items = request.items ? JSON.parse(request.items) : [];
      customerData = request.customerData
        ? JSON.parse(request.customerData)
        : null;
    } catch (parseError) {
      console.error("Error parsing request data:", parseError);
      items = [];
      customerData = null;
    }

    return res.json({
      success: true,
      data: {
        requestNumber: request.request_number,
        items,
        customerData,
        totalAmount: request.totalAmount,
        createdAt: request.createdAt,
        status: request.status,
        customerName: request.customerName,
        customerEmail: request.customerEmail,
      },
    });
  } catch (error) {
    console.error("Get request data error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get request data",
    });
  }
});

/**
 * GET /my-requests - get authenticated user's requests
 */
router.get("/my-requests", authenticateToken, async (req, res) => {
  try {
    const requests = await query(
      "SELECT * FROM requests WHERE userId = ? ORDER BY createdAt DESC",
      [req.user.id]
    );

    const formattedRequests = requests.map((request) => {
      let items = [];
      let customerData = null;
      let pdfMetadata = null;
      
      try {
        items = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        items = [];
      }
      try {
        customerData = request.customerData
          ? JSON.parse(request.customerData)
          : null;
      } catch (e) {
        customerData = null;
      }
      try {
        pdfMetadata = request.pdfMetadata
          ? JSON.parse(request.pdfMetadata)
          : null;
      } catch (e) {
        pdfMetadata = null;
      }

      // Parse Azure SQL date format to ISO string
      let formattedCreatedAt = new Date().toISOString(); // fallback
      try {
        const dateStr = request.createdAt.toString();
        let parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
          // Handle Azure SQL date format like "Sep 17 2025  1:12AM"
          const parts = dateStr.match(/(\w+) (\d+) (\d+) (\d+):(\d+)(\w+)/);
          if (parts) {
            const [, month, day, year, hour, minute, ampm] = parts;
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            parsedDate = new Date(year, monthMap[month], day, hour24, minute);
          }
        }
        if (!isNaN(parsedDate.getTime())) {
          formattedCreatedAt = parsedDate.toISOString();
        }
      } catch (error) {
        console.error('Date parsing error:', error, 'for date:', request.createdAt);
        // Use the raw createdAt if parsing fails
        formattedCreatedAt = request.createdAt;
      }

      return { ...request, items, customerData, pdfMetadata, formattedCreatedAt };
    });

    return res.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error("Get user requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get requests" });
  }
});

/**
 * GET /user/:userId - admin: get requests for a specific user
 */
router.get(
  "/user/:userId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId } = req.params;
      const requests = await query(
        "SELECT * FROM requests WHERE userId = ? ORDER BY createdAt DESC",
        [userId]
      );

      const formattedRequests = requests.map((request) => {
        let parsedItems = [];
        let parsedCustomerData = null;
        let parsedPdfMetadata = null;
        try {
          parsedItems = request.items ? JSON.parse(request.items) : [];
        } catch (e) {
          parsedItems = [];
        }
        try {
          parsedCustomerData = request.customerData
            ? JSON.parse(request.customerData)
            : null;
        } catch (e) {
          parsedCustomerData = null;
        }
        try {
          parsedPdfMetadata = request.pdfMetadata
            ? JSON.parse(request.pdfMetadata)
            : null;
        } catch (e) {
          parsedPdfMetadata = null;
        }
        return {
          ...request,
          items: parsedItems,
          customerData: parsedCustomerData,
          pdfMetadata: parsedPdfMetadata,
        };
      });

      return res.json({ success: true, data: { requests: formattedRequests } });
    } catch (error) {
      console.error("Get user requests error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to get user requests" });
    }
  }
);

/**
 * GET /:id - get a single request by id (authenticated user)
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requests = await query(
      "SELECT * FROM requests WHERE id = ? AND userId = ?",
      [id, req.user.id]
    );

    if (requests.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }

    const request = requests[0];
    let items = [],
      customerData = null,
      pdfMetadata = null;
    try {
      items = request.items ? JSON.parse(request.items) : [];
    } catch (e) {
      items = [];
    }
    try {
      customerData = request.customerData
        ? JSON.parse(request.customerData)
        : null;
    } catch (e) {
      customerData = null;
    }
    try {
      pdfMetadata = request.pdfMetadata
        ? JSON.parse(request.pdfMetadata)
        : null;
    } catch (e) {
      pdfMetadata = null;
    }

    return res.json({
      success: true,
      data: { ...request, items, customerData, pdfMetadata },
    });
  } catch (error) {
    console.error("Get request error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get request" });
  }
});

/**
 * PUT /:id/status - update request status (admin only)
 */
router.put(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  [
    body("status")
      .isIn(["pending", "approved", "rejected"])
      .withMessage("Status must be pending, approved, or rejected"),
    body("notes").optional().isString().withMessage("Notes must be a string"),
  ],
  async (req, res) => {
    // validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    try {
      // ensure request exists
      const requests = await query("SELECT * FROM requests WHERE id = ?", [id]);
      if (requests.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Request not found" });
      }

      const request = requests[0];

      // update status
      await query(
        "UPDATE requests SET status = ?, notes = ?, updatedAt = GETUTCDATE() WHERE id = ?",
        [status, notes || null, id]
      );

      // log activity
      await logActivity(
        req.user.id,
        `admin_request_${status}`,
        "request",
        id,
        `Admin ${status} request`,
        req,
        {
          requestId: id,
          requestNumber: request.request_number,
          previousStatus: request.status,
          newStatus: status,
          notes: notes || null,
          customerId: request.userId,
        }
      );

      // attempt to find customer email and send notification
      let emailSent = false;
      try {
        console.log(
          "📧 Attempting to send status update email for request:",
          request.request_number
        );
        let customerEmail = null;
        let customerName = null;
        let customerData = null;

        // First try to get email from customerData JSON for guest users
        try {
          if (request.customerData) {
            customerData = JSON.parse(request.customerData);
            if (customerData?.email) {
              customerEmail = customerData.email;
              customerName = `${customerData.firstName || ""} ${
                customerData.lastName || ""
              }`.trim();
            }
          }
        } catch (e) {
          console.error("Failed to parse customer data:", e);
        }

        // If no email found and we have a userId, try to get from users table
        if (!customerEmail && request.userId) {
          // logged in user: lookup user row
          const users = await query(
            "SELECT firstName, lastName, email FROM users WHERE id = ?",
            [request.userId]
          );
          if (users.length > 0) {
            const user = users[0];
            customerEmail = user.email;
            customerName = `${user.firstName || ""} ${
              user.lastName || ""
            }`.trim();
            customerData = {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            };
          }
        }

        if (customerEmail && customerName) {
          const emailTemplate =
            status === "approved" ? "requestApproved" : "requestRejected";
          const attachments = [];

          if (status === "approved") {
            // attach approved PDF
            const itemsForPdf = request.items ? JSON.parse(request.items) : [];
            const invoiceData = {
              invoiceNumber: request.request_number,
              customer: customerData,
              items: itemsForPdf,
              totalAmount: request.totalAmount,
              submittedAt: request.createdAt,
              status: "approved",
            };
            try {
              const pdfBuffer = await generateInvoicePDF(invoiceData);
              attachments.push({
                filename: `Proforma_Invoice_${request.request_number}_Approved.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              });
            } catch (pdfError) {
              console.error("Failed to generate approved PDF:", pdfError);
            }
          }

          await sendEmail({
            to: customerEmail,
            template: emailTemplate,
            data: {
              customerName,
              requestNumber: request.request_number,
              status: status.charAt(0).toUpperCase() + status.slice(1),
              notes: notes || "No additional notes provided.",
              date: new Date().toLocaleDateString("en-GB"),
            },
            ...(attachments.length ? { attachments } : {}),
          });

          console.log("✅ Status update email sent to:", customerEmail);
          emailSent = true;
        } else {
          console.log(
            "⚠️ No customer email found for status update (requestId:",
            id,
            ")"
          );
        }
      } catch (emailError) {
        console.error("Request status update email failed:", emailError);
        emailSent = false;
      }

      return res.json({
        success: true,
        message: `Request ${status} successfully`,
        emailSent: emailSent,
      });
    } catch (error) {
      console.error("Update request status error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update request status" });
    }
  }
);

/**
 * GET /admin/all - admin: full list with summary stats
 */
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requests = await query(
      `SELECT 
        r.*,
        u.firstName as userFirstName,
        u.lastName as userLastName,
        u.email as userEmail
      FROM requests r
      LEFT JOIN users u ON r.userId = u.id AND r.userId NOT LIKE 'guest_%'
      ORDER BY r.createdAt DESC`
    );

    const formattedRequests = requests.map((request) => {
      let parsedItems = [];
      let parsedCustomerData = null;
      let parsedPdfMetadata = null;
      try {
        parsedItems = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        parsedItems = [];
      }
      try {
        parsedCustomerData = request.customerData
          ? JSON.parse(request.customerData)
          : null;
      } catch (e) {
        parsedCustomerData = null;
      }
      try {
        parsedPdfMetadata = request.pdfMetadata
          ? JSON.parse(request.pdfMetadata)
          : null;
      } catch (e) {
        parsedPdfMetadata = null;
      }

      let customerName = "Anonymous Customer";
      let customerEmail = "Unknown";
      let isGuest = false;

      if (parsedCustomerData) {
        customerName =
          `${parsedCustomerData.firstName || ""} ${
            parsedCustomerData.lastName || ""
          }`.trim() || "Anonymous Customer";
        customerEmail = parsedCustomerData.email || "Unknown";
        isGuest = !!parsedCustomerData.isGuest;
      } else if (request.userFirstName || request.userLastName) {
        customerName = `${request.userFirstName || ""} ${
          request.userLastName || ""
        }`.trim();
        customerEmail = request.userEmail || "Unknown";
      } else if (
        request.userId &&
        typeof request.userId === "string" &&
        request.userId.startsWith("guest_")
      ) {
        isGuest = true;
      }

      // Parse Azure SQL date format to ISO string
      let formattedCreatedAt = new Date().toISOString(); // fallback
      try {
        const dateStr = request.createdAt.toString();
        let parsedDate = new Date(dateStr);
        if (isNaN(parsedDate.getTime())) {
          // Handle Azure SQL format like "Sep 17 2025  1:12AM" (note the double space)
          const parts = dateStr.match(/(\w+) (\d+) (\d+) +(\d+):(\d+)(\w+)/);
          if (parts) {
            const [, month, day, year, hour, minute, ampm] = parts;
            const monthMap = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            let hour24 = parseInt(hour);
            if (ampm === 'PM' && hour24 !== 12) hour24 += 12;
            if (ampm === 'AM' && hour24 === 12) hour24 = 0;
            parsedDate = new Date(year, monthMap[month], day, hour24, minute);
          }
        }
        if (!isNaN(parsedDate.getTime())) {
          formattedCreatedAt = parsedDate.toISOString();
        }
      } catch (error) {
        console.error('Date parsing error:', error, 'for date:', request.createdAt);
      }

      return {
        ...request,
        items: parsedItems,
        customerData: parsedCustomerData,
        pdfMetadata: parsedPdfMetadata,
        customerName,
        customerEmail,
        isGuest,
        createdAt: formattedCreatedAt,
      };
    });

    return res.json({
      success: true,
      data: {
        requests: formattedRequests,
        total: formattedRequests.length,
        pending: formattedRequests.filter((r) => r.status === "pending").length,
        approved: formattedRequests.filter((r) => r.status === "approved")
          .length,
        rejected: formattedRequests.filter((r) => r.status === "rejected")
          .length,
      },
    });
  } catch (error) {
    console.error("Get admin requests error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get requests" });
  }
});

module.exports = router;
