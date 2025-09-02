const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run } = require('../config/database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('./activities');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

const router = express.Router();

// Helper function to generate sequential invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const yearShort = year.toString().slice(-2);
  
  // Get the highest number for this year from database
  const yearRequests = await query(
    'SELECT requestNumber FROM requests WHERE requestNumber LIKE ? ORDER BY requestNumber DESC LIMIT 1',
    [`OGL-%${yearShort}`]
  );
  
  let nextNumber = 1;
  if (yearRequests.length > 0) {
    // Extract the number part from the last request number
    const lastNumber = yearRequests[0].requestNumber;
    const match = lastNumber.match(/OGL-(\d+)(\d{2})/);
    if (match) {
      nextNumber = parseInt(match[1]) + 1;
    }
  }
  
  return `OGL-${String(nextNumber).padStart(3, "0")}${yearShort}`;
};

// Get all requests (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const requests = await query(`
      SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
      FROM requests r 
      LEFT JOIN users u ON r.userId = u.id 
      ORDER BY r.createdAt DESC
    `);

    // Parse JSON fields and format data
    const formattedRequests = requests.map(request => {
      let parsedCustomerData = null;
      let parsedItems = [];
      let parsedPdfMetadata = {};
      
      try {
        parsedCustomerData = request.customerData ? JSON.parse(request.customerData) : null;
        parsedItems = request.items ? JSON.parse(request.items) : [];
        parsedPdfMetadata = request.pdfMetadata ? JSON.parse(request.pdfMetadata) : {};
      } catch (parseError) {
        console.error('Error parsing JSON data for request:', request.id, parseError);
      }
      
      // Determine customer name and email
      let customerName = 'Anonymous Customer';
      let customerEmail = 'Unknown';
      let isGuest = false;
      
      if (parsedCustomerData) {
        customerName = `${parsedCustomerData.firstName || ''} ${parsedCustomerData.lastName || ''}`.trim() || 'Anonymous Customer';
        customerEmail = parsedCustomerData.email || 'Unknown';
        isGuest = parsedCustomerData.isGuest || false;
      } else if (request.customerName) {
        customerName = request.customerName;
        customerEmail = request.customerEmail || 'Unknown';
      }
      
      // Add guest indicator to customer name if applicable
      if (isGuest) {
        customerName += ' (Guest)';
      }
      
      return {
        ...request,
        items: parsedItems,
        customerData: parsedCustomerData,
        pdfMetadata: parsedPdfMetadata,
        customerName,
        customerEmail,
        isGuest
      };
    });

    res.json({
      success: true,
      data: {
        requests: formattedRequests
      }
    });

  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests'
    });
  }
});

// Submit new request
router.post('/', optionalAuth, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').optional().isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('customerData').optional().isObject().withMessage('Customer data must be an object')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, totalAmount, notes, customerData } = req.body;
    const userId = req.user ? req.user.id : null;
    
    console.log('Request submission debug:', {
      hasUser: !!req.user,
      userId: userId,
      userEmail: req.user?.email,
      customerData: customerData
    });

    // Generate unified invoice number
    const requestNumber = await generateInvoiceNumber();

    // Store PDF generation metadata
    const pdfMetadata = {
      generated: false,
      generatedAt: null,
      adminDownloaded: false,
      adminDownloadedAt: null,
      adminDownloadedBy: null
    };

    // Extract customer information for database fields
    const customerName = customerData ? `${customerData.firstName} ${customerData.lastName}`.trim() : 'Anonymous Customer';
    // Handle guest users properly
    let finalUserId = userId;
    let finalCustomerData = customerData;
    
    if (!userId && customerData) {
      // Guest user - generate a unique identifier
      finalUserId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Enhance customer data with guest identifier
      finalCustomerData = {
        ...customerData,
        isGuest: true,
        guestId: finalUserId,
        submittedAt: new Date().toISOString()
      };
      
      console.log('Guest user request - generated ID:', finalUserId);
    }
    
    const customerEmail = customerData?.email || 'no-email@example.com';
    const customerPhone = customerData?.phone || null;
    const companyName = customerData?.companyName || null;

    // Insert request with comprehensive data (both old and new structure)
    const result = await query(
      `INSERT INTO requests (
        userId, customerName, customerEmail, customerPhone, companyName, 
        requestNumber, items, totalAmount, notes, customerData, pdfMetadata, 
        status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        finalUserId,
        customerName,
        customerEmail,
        customerPhone,
        companyName,
        requestNumber, 
        JSON.stringify(items), 
        totalAmount, 
        notes || null,
        finalCustomerData ? JSON.stringify(finalCustomerData) : null,
        JSON.stringify(pdfMetadata),
        'pending'
      ]
    );

    // Log request submission activity
    await logActivity(finalUserId, 'request_submitted', 'request', result.lastID, 'User submitted request', req, {
      requestNumber,
      totalAmount,
      itemCount: items.length,
      customerData: finalCustomerData ? {
        firstName: finalCustomerData.firstName,
        lastName: finalCustomerData.lastName,
        email: finalCustomerData.email,
        companyName: finalCustomerData.companyName,
        isGuest: finalCustomerData.isGuest || false
      } : null
    });

    // Send confirmation email if we have customer data (both logged-in and guest users)
    if (customerData && customerData.email) {
      console.log('📧 Attempting to send confirmation email to:', customerData.email);
      
      try {
        // Generate PDF for email attachment
        const pdfData = {
          invoiceNumber: requestNumber,
          customer: customerData,
          items: items,
          totalAmount: totalAmount,
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };

        console.log('📄 PDF data prepared:', { requestNumber, customerEmail: customerData.email });

        // Generate PDF for email attachment
        try {
          console.log('🔄 Starting PDF generation...');
          const pdfBuffer = await generateInvoicePDF(pdfData);
          console.log('✅ PDF generated successfully, size:', pdfBuffer.length);
          
          // Send email with PDF attachment
          await sendEmail({
            to: customerData.email,
            template: 'requestConfirmation',
            data: {
              customerName: `${customerData.firstName} ${customerData.lastName}`,
              requestNumber,
              totalAmount,
              date: new Date().toLocaleDateString(),
              status: 'pending',
              items: items.map(item => ({
                name: item.name || `Product ${item.productId}`,
                quantity: item.quantity,
                price: item.price
              }))
            },
            attachments: [{
              filename: `Proforma_Invoice_${requestNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }]
          });
          
          console.log('✅ Email sent successfully with PDF attachment to:', customerData.email);
        } catch (pdfError) {
          console.error('❌ PDF generation failed, sending email without attachment:', pdfError);
          
          // Fallback: send email without PDF attachment
          await sendEmail({
            to: customerData.email,
            template: 'requestConfirmation',
            data: {
              customerName: `${customerData.firstName} ${customerData.lastName}`,
              requestNumber,
              totalAmount,
              date: new Date().toLocaleDateString(),
              status: 'pending',
              items: items.map(item => ({
                name: item.name || `Product ${item.productId}`,
                quantity: item.quantity,
                price: item.price
              }))
            }
          });
          
          console.log('✅ Fallback email sent successfully (without PDF) to:', customerData.email);
        }
      } catch (emailError) {
        console.error('❌ Request confirmation email failed completely:', emailError);
        console.error('Email error details:', {
          to: customerData.email,
          requestNumber,
          error: emailError.message,
          stack: emailError.stack
        });
      }
    } else {
      console.log('⚠️ No email sent - missing customer data or email:', {
        hasCustomerData: !!customerData,
        hasEmail: customerData?.email,
        customerEmail: customerData?.email
      });
    }

    res.status(201).json({
      success: true,
      message: userId ? 'Request submitted successfully' : 'Request submitted successfully. Check your email for the invoice.',
      data: {
        requestId: result.insertId,
        requestNumber,
        userId: finalUserId,
        customerName: customerName,
        customerEmail: customerEmail,
        isGuest: !userId, // true if no user was logged in
        emailSent: customerData && customerData.email ? true : false
      }
    });

  } catch (error) {
    console.error('Submit request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit request'
    });
  }
});

// Generate user PDF (works regardless of status)
router.post('/:requestNumber/user-pdf', optionalAuth, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    
    // Get request details
    const requests = await query(
      `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.requestNumber = ?`,
      [requestNumber]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];
    
    // Parse data
    const items = request.items ? JSON.parse(request.items) : [];
    const customerData = request.customerData ? JSON.parse(request.customerData) : null;

    // Create user invoice data
    const userInvoiceData = {
      invoiceNumber: requestNumber,
      customer: customerData || {
        firstName: request.firstName || 'Unknown',
        lastName: request.lastName || 'Customer',
        email: request.userEmail || 'Unknown',
        companyName: request.companyName || 'Unknown Company',
        phone: 'Not provided',
        companyType: 'Not specified',
        companyRole: 'Not specified'
      },
      items,
      totalAmount: request.totalAmount,
      submittedAt: request.createdAt,
      status: request.status
    };

    // Update PDF metadata
    const pdfMetadata = {
      generated: true,
      generatedAt: new Date().toISOString(),
      adminDownloaded: false,
      adminDownloadedAt: null,
      adminDownloadedBy: null
    };

    await query(
      'UPDATE requests SET pdfMetadata = ?, updatedAt = datetime("now") WHERE requestNumber = ?',
      [JSON.stringify(pdfMetadata), requestNumber]
    );

    res.json({
      success: true,
      message: 'User PDF data generated',
      data: userInvoiceData
    });

  } catch (error) {
    console.error('User PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user PDF data'
    });
  }
});

// Mark PDF as generated (called from frontend after PDF generation)
router.post('/:requestNumber/pdf-generated', optionalAuth, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    
    // Update PDF metadata
    const pdfMetadata = {
      generated: true,
      generatedAt: new Date().toISOString(),
      adminDownloaded: false,
      adminDownloadedAt: null,
      adminDownloadedBy: null
    };

    await query(
      'UPDATE requests SET pdfMetadata = ?, updatedAt = datetime("now") WHERE requestNumber = ?',
      [JSON.stringify(pdfMetadata), requestNumber]
    );

    res.json({
      success: true,
      message: 'PDF generation recorded'
    });

  } catch (error) {
    console.error('PDF generation update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update PDF generation status'
    });
  }
});

// Generate admin PDF with stamp (admin only)
router.post('/:requestNumber/admin-pdf', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { requestNumber } = req.params;
    
    // Get request details
    const requests = await query(
      `SELECT r.*, u.firstName, u.lastName, u.email as userEmail, u.companyName 
       FROM requests r 
       LEFT JOIN users u ON r.userId = u.id 
       WHERE r.requestNumber = ?`,
      [requestNumber]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];
    
    // Parse data
    const items = request.items ? JSON.parse(request.items) : [];
    const customerData = request.customerData ? JSON.parse(request.customerData) : null;
    const pdfMetadata = request.pdfMetadata ? JSON.parse(request.pdfMetadata) : {};

    // Create admin-stamped invoice data
    const adminInvoiceData = {
      invoiceNumber: requestNumber,
      customer: customerData || {
        firstName: request.firstName || 'Unknown',
        lastName: request.lastName || 'Customer',
        email: request.userEmail || 'Unknown',
        companyName: request.companyName || 'Unknown Company',
        phone: 'Not provided',
        companyType: 'Not specified',
        companyRole: 'Not specified'
      },
      items,
      totalAmount: request.totalAmount,
      submittedAt: request.createdAt,
      status: request.status,
      adminStamp: true
    };

    // Update admin download metadata
    pdfMetadata.adminDownloaded = true;
    pdfMetadata.adminDownloadedAt = new Date().toISOString();
    pdfMetadata.adminDownloadedBy = req.user.email;

    await query(
      'UPDATE requests SET pdfMetadata = ?, updatedAt = datetime("now") WHERE requestNumber = ?',
      [JSON.stringify(pdfMetadata), requestNumber]
    );

    // Generate admin PDF
    try {
      console.log('🔄 Starting admin PDF generation...');
      const pdfBuffer = await generateInvoicePDF(adminInvoiceData);
      console.log('✅ Admin PDF generated successfully, size:', pdfBuffer.length);
      
      // Log admin PDF download activity
      await logActivity(req.user.id, 'admin_pdf_downloaded', 'request', request.id, 'Admin downloaded PDF invoice', req, {
        requestNumber,
        customerData: customerData ? {
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          email: customerData.email,
          companyName: customerData.companyName
        } : null,
        totalAmount: request.totalAmount,
        itemCount: items.length
      });

      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Admin_Invoice_${requestNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send PDF buffer
      res.send(pdfBuffer);
      
    } catch (pdfError) {
      console.error('❌ Admin PDF generation failed:', pdfError);
      res.status(500).json({
        success: false,
        message: 'Failed to generate admin PDF'
      });
    }

  } catch (error) {
    console.error('Admin PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate admin PDF'
    });
  }
});

// Get user's requests (authenticated users only)
router.get('/my-requests', authenticateToken, async (req, res) => {
  try {
    console.log('My-requests debug:', {
      userId: req.user.id,
      userEmail: req.user.email
    });

    const requests = await query(
      'SELECT * FROM requests WHERE userId = ? ORDER BY createdAt DESC',
      [req.user.id]
    );

    console.log('Found requests:', requests.length);

    // Parse JSON fields
    const formattedRequests = requests.map(request => ({
      ...request,
      items: request.items ? JSON.parse(request.items) : [],
      customerData: request.customerData ? JSON.parse(request.customerData) : null,
      pdfMetadata: request.pdfMetadata ? JSON.parse(request.pdfMetadata) : null
    }));

    res.json({
      success: true,
      data: formattedRequests
    });

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests'
    });
  }
});

// Get requests for a specific user (admin only)
router.get('/user/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await query(
      'SELECT * FROM requests WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );

    // Parse JSON fields
    const formattedRequests = requests.map(request => {
      let parsedItems = [];
      let parsedCustomerData = null;
      let parsedPdfMetadata = null;

      try {
        parsedItems = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        parsedItems = [];
      }

      try {
        parsedCustomerData = request.customerData ? JSON.parse(request.customerData) : null;
      } catch (e) {
        parsedCustomerData = null;
      }

      try {
        parsedPdfMetadata = request.pdfMetadata ? JSON.parse(request.pdfMetadata) : null;
      } catch (e) {
        parsedPdfMetadata = null;
      }

      return {
        ...request,
        items: parsedItems,
        customerData: parsedCustomerData,
        pdfMetadata: parsedPdfMetadata
      };
    });

    res.json({
      success: true,
      data: {
        requests: formattedRequests
      }
    });

  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user requests'
    });
  }
});

// Get single request by ID (authenticated users only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const requests = await query(
      'SELECT * FROM requests WHERE id = ? AND userId = ?',
      [id, req.user.id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Parse JSON fields
    const formattedRequest = {
      ...request,
      items: request.items ? JSON.parse(request.items) : [],
      customerData: request.customerData ? JSON.parse(request.customerData) : null,
      pdfMetadata: request.pdfMetadata ? JSON.parse(request.pdfMetadata) : null
    };

    res.json({
      success: true,
      data: formattedRequest
    });

  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get request'
    });
  }
});

// Update request status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if request exists
    const requests = await query(
      'SELECT * FROM requests WHERE id = ?',
      [id]
    );

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const request = requests[0];

    // Update request status
    await query(
      'UPDATE requests SET status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [status, notes || null, id]
    );

    // Log admin status update activity
    await logActivity(req.user.id, `admin_request_${status}`, 'request', id, `Admin ${status} request`, req, {
      requestId: id,
      requestNumber: request.requestNumber,
      previousStatus: request.status,
      newStatus: status,
      notes: notes || null,
      customerId: request.userId
    });

    // Send email notification
    try {
      console.log('📧 Attempting to send status update email for request:', request.requestNumber);
      
      let customerEmail = null;
      let customerName = null;
      
      // Check if this is a guest user (userId starts with 'guest_')
      if (request.userId && typeof request.userId === 'string' && request.userId.startsWith('guest_')) {
        console.log('👤 Guest user detected, extracting customer data from request');
        
        // Parse customer data from the request
        try {
          const customerData = request.customerData ? JSON.parse(request.customerData) : null;
          if (customerData && customerData.email) {
            customerEmail = customerData.email;
            customerName = `${customerData.firstName} ${customerData.lastName}`;
            console.log('✅ Guest customer data extracted:', { customerEmail, customerName });
          }
        } catch (parseError) {
          console.error('❌ Failed to parse guest customer data:', parseError);
        }
      } else if (request.userId) {
        // Regular logged-in user
        console.log('👤 Logged-in user detected, looking up user data');
        const users = await query(
          'SELECT firstName, lastName, email FROM users WHERE id = ?',
          [request.userId]
        );

        if (users.length > 0) {
          const user = users[0];
          customerEmail = user.email;
          customerName = `${user.firstName} ${user.lastName}`;
          console.log('✅ Logged-in user data found:', { customerEmail, customerName });
        }
      }
      
      // Send email if we have customer information
      if (customerEmail && customerName) {
        const emailTemplate = status === 'approved' ? 'requestApproved' : 'requestRejected';
        
        console.log('📧 Sending status update email:', {
          to: customerEmail,
          template: emailTemplate,
          status: status
        });
        
        await sendEmail({
          to: customerEmail,
          template: emailTemplate,
          data: {
            customerName: customerName,
            requestNumber: request.requestNumber,
            status: status.charAt(0).toUpperCase() + status.slice(1),
            notes: notes || 'No additional notes provided.',
            date: new Date().toLocaleDateString()
          }
        });
        
        console.log('✅ Status update email sent successfully to:', customerEmail);
      } else {
        console.log('⚠️ No customer email found for status update');
      }
    } catch (emailError) {
      console.error('❌ Request status update email failed:', emailError);
      console.error('Email error details:', {
        requestId: id,
        requestNumber: request.requestNumber,
        error: emailError.message
      });
    }

    res.json({
      success: true,
      message: `Request ${status} successfully`,
      emailSent: true
    });

  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status'
    });
  }
});

// Get all requests (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
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

    // Parse JSON fields and format customer data
    const formattedRequests = requests.map(request => {
      let parsedItems = [];
      let parsedCustomerData = null;
      let parsedPdfMetadata = null;

      try {
        parsedItems = request.items ? JSON.parse(request.items) : [];
      } catch (e) {
        parsedItems = [];
      }

      try {
        parsedCustomerData = request.customerData ? JSON.parse(request.customerData) : null;
      } catch (e) {
        parsedCustomerData = null;
      }

      try {
        parsedPdfMetadata = request.pdfMetadata ? JSON.parse(request.pdfMetadata) : null;
      } catch (e) {
        parsedPdfMetadata = null;
      }

      // Determine customer name and email
      let customerName = 'Anonymous Customer';
      let customerEmail = 'Unknown';
      let isGuest = false;

      if (parsedCustomerData) {
        customerName = `${parsedCustomerData.firstName || ''} ${parsedCustomerData.lastName || ''}`.trim() || 'Anonymous Customer';
        customerEmail = parsedCustomerData.email || 'Unknown';
        isGuest = parsedCustomerData.isGuest || false;
      } else if (request.userFirstName && request.userLastName) {
        customerName = `${request.userFirstName} ${request.userLastName}`;
        customerEmail = request.userEmail || 'Unknown';
        isGuest = false;
      } else if (request.userId && typeof request.userId === 'string' && request.userId.startsWith('guest_')) {
        isGuest = true;
      }

      return {
        ...request,
        items: parsedItems,
        customerData: parsedCustomerData,
        pdfMetadata: parsedPdfMetadata,
        customerName,
        customerEmail,
        isGuest
      };
    });

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        total: formattedRequests.length,
        pending: formattedRequests.filter(r => r.status === 'pending').length,
        approved: formattedRequests.filter(r => r.status === 'approved').length,
        rejected: formattedRequests.filter(r => r.status === 'rejected').length
      }
    });

  } catch (error) {
    console.error('Get admin requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get requests'
    });
  }
});

module.exports = router;
