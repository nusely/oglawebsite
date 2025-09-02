const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // Check if email credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email credentials not configured. Creating mock transporter for testing.');
    
    // Create a mock transporter that logs instead of sending
    return {
      sendMail: async (mailOptions) => {
        console.log('📧 MOCK EMAIL SENT (no real email sent):', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          hasAttachments: mailOptions.attachments ? mailOptions.attachments.length : 0
        });
        
        // Return a mock success response
        return {
          messageId: `mock-${Date.now()}`,
          response: 'Mock email sent successfully'
        };
      }
    };
  }

  // Use real Gmail transporter
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS.replace(/\s/g, '') // Remove spaces from app password
    }
  });
};

// Email templates
const emailTemplates = {
  'welcome-verification': (data) => ({
    subject: 'Welcome to Ogla Shea Butter & General Trading - Please Verify Your Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Ogla Shea Butter & General Trading</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.firstName},</h2>
          <p>Welcome to Ogla Shea Butter & General Trading! We're excited to have you as part of our community.</p>
          <p>Your account has been successfully created for <strong>${data.companyName}</strong>.</p>
          <p>To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${data.verificationToken}" 
               style="background-color: #8B6914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This verification link will expire in 24 hours.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">
            ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${data.verificationToken}
          </p>
          <p>Once verified, you can:</p>
          <ul>
            <li>Browse our premium products</li>
            <li>Submit request quotes</li>
            <li>Track your orders</li>
            <li>Access exclusive B2B pricing</li>
          </ul>
          <p>If you have any questions, feel free to contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call us at +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  'email-verification': (data) => ({
    subject: 'Email Verification - Ogla Shea Butter',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Email Verification</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.firstName},</h2>
          <p>Please verify your email address to complete your account setup.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${data.verificationToken}" 
               style="background-color: #8B6914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>This verification link will expire in 24 hours.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">
            ${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${data.verificationToken}
          </p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  welcome: (data) => ({
    subject: 'Welcome to Ogla Shea Butter & General Trading',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Welcome to Ogla Shea Butter & General Trading</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.firstName},</h2>
          <p>Welcome to Ogla Shea Butter & General Trading! We're excited to have you as part of our community.</p>
          <p>Your account has been successfully created for <strong>${data.companyName}</strong>.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our premium products</li>
            <li>Submit request quotes</li>
            <li>Track your orders</li>
            <li>Access exclusive B2B pricing</li>
          </ul>
          <p>If you have any questions, feel free to contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call us at +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request - Ogla Shea Butter',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Password Reset Request</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.firstName},</h2>
          <p>We received a request to reset your password for your Ogla Shea Butter account.</p>
          <p>If you didn't make this request, you can safely ignore this email.</p>
          <p>To reset your password, click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}" 
               style="background-color: #8B6914; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">
            ${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}
          </p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  requestConfirmation: (data) => ({
    subject: `Request Confirmation - ${data.requestNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Request Confirmation</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.customerName},</h2>
          <p>Thank you for your request! We have received your order and are processing it.</p>
          <p>Your request is <strong style="color: #8B6914;">PENDING</strong> for approval.</p>
          <p><strong>Request Number:</strong> ${data.requestNumber}</p>
          <p><strong>Status:</strong> <span style="color: #8B6914; font-weight: bold; padding: 4px 8px; background-color: #f0f0f0; border-radius: 3px;">${data.status || 'PENDING'}</span></p>
          <p><strong>Total Amount:</strong> GH₵${data.totalAmount}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <h3>Order Items:</h3>
          <ul>
            ${data.items.map(item => `
              <li>${item.name} - ${item.quantity} x GH₵${item.price}</li>
            `).join('')}
          </ul>
          <p>We will contact you within 24 hours to confirm your order and discuss delivery details.</p>
          <p>You can track your request status by logging into your account.</p>
          <p>If you have any questions, please contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  requestUpdate: (data) => ({
    subject: `Request Update - ${data.requestNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Request Status Update</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.customerName},</h2>
          <p>Your request status has been updated.</p>
          <p><strong>Request Number:</strong> ${data.requestNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #8B6914; font-weight: bold;">${data.status}</span></p>
          ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
          <p>You can track your request by logging into your account.</p>
          <p>If you have any questions, please contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  requestApproved: (data) => ({
    subject: `Request Approved - ${data.requestNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>🎉 Request Approved!</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.customerName},</h2>
          <p>Great news! Your request has been <strong style="color: #28a745;">APPROVED</strong>.</p>
          <p><strong>Request Number:</strong> ${data.requestNumber}</p>
          <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">APPROVED</span></p>
          ${data.notes ? `<p><strong>Admin Notes:</strong> ${data.notes}</p>` : ''}
          <p>Your request is now being processed. You can track your request by logging into your account.</p>
          <p>If you have any questions, please contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  requestRejected: (data) => ({
    subject: `Request Update - ${data.requestNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B6914; color: white; padding: 20px; text-align: center;">
          <h1>Request Status Update</h1>
        </div>
        <div style="padding: 20px;">
          <h2>Hello ${data.customerName},</h2>
          <p>Your request status has been updated.</p>
          <p><strong>Request Number:</strong> ${data.requestNumber}</p>
          <p><strong>New Status:</strong> <span style="color: #dc3545; font-weight: bold;">REJECTED</span></p>
          ${data.notes ? `<p><strong>Admin Notes:</strong> ${data.notes}</p>` : ''}
          <p>We understand this may be disappointing. If you have any questions about this decision, please contact us at <a href="mailto:oglatrade@gmail.com">oglatrade@gmail.com</a> or call +233 54 152 8841.</p>
          <p>Best regards,<br>The Ogla Team</p>
        </div>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>© 2024 Ogla Shea Butter & General Trading. All rights reserved.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text, attachments }) => {
  try {
    const transporter = createTransporter();
    
    let emailContent = {};
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = {
        subject: subject,
        html: html,
        text: text
      };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Ogla Shea Butter <noreply@ogla.com>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Send bulk email function
const sendBulkEmail = async (recipients, subject, template, data, attachments) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data);
    
    const promises = recipients.map(to => {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'Ogla Shea Butter <noreply@ogla.com>',
        to: to,
        subject: emailContent.subject,
        html: emailContent.html
      };

      // Add attachments if provided
      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

      return transporter.sendMail(mailOptions);
    });

    const results = await Promise.allSettled(promises);
    console.log('Bulk email sent:', results.length, 'recipients');
    return results;
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  emailTemplates
};
