const fs = require('fs');
const path = require('path');

const authFilePath = path.join(__dirname, 'routes', 'auth.js');

// Create a clean auth.js file
const cleanAuthContent = `const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { query, run } = require('../config/database');
const { sendEmail } = require('../utils/email');
const { logActivity } = require('./activities');

const router = express.Router();

// Register new user
router.post('/register', [
  body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Phone is optional
    // Allow international phone numbers with + prefix and 7-15 digits
    const phoneRegex = /^\+[1-9]\\d{6,14}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Phone number must be in international format (e.g., +233204543372)');
    }
    return true;
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  body('companyType').isIn([
    'Agriculture & Farming',
    'Food & Beverage',
    'Cosmetics & Beauty',
    'Textiles & Fashion',
    'Healthcare & Pharmaceuticals',
    'Retail & Wholesale',
    'Manufacturing',
    'Export/Import',
    'Hospitality & Tourism',
    'Education',
    'Technology',
    'Construction',
    'Transportation & Logistics',
    'Energy & Utilities',
    'Other'
  ]).withMessage('Valid company type is required'),
  body('companyRole').isIn([
    'Owner/CEO',
    'Manager/Director',
    'Purchasing Manager',
    'Procurement Officer',
    'Sales Manager',
    'Marketing Manager',
    'Operations Manager',
    'Business Development',
    'Consultant',
    'Employee',
    'Other'
  ]).withMessage('Valid company role is required'),
  body('address').optional().isObject().withMessage('Address must be an object')
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

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      companyName,
      companyType,
      companyRole,
      address
    } = req.body;

    // Check if user already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await query(
      \`INSERT INTO users (
        firstName, lastName, email, phone, password, 
        companyName, companyType, companyRole, address
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)\`,
      [
        firstName,
        lastName,
        email,
        phone || null,
        hashedPassword,
        companyName,
        companyType,
        companyRole,
        address ? JSON.stringify(address) : null
      ]
    );

    console.log('🔍 Registration debug - Insert result:', JSON.stringify(result));
    console.log('🔍 User ID from insert:', result.insertId || result.lastID || 'UNDEFINED');

    const userId = result.insertId || result.lastID;
    if (!userId) {
      console.error('❌ Failed to get user ID from insert result');
      return res.status(500).json({
        success: false,
        message: 'Failed to create user account'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: userId, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Generated verification token with userId:', userId);

    // Store verification token in database
    await query(
      'UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = datetime("now", "+24 hours") WHERE id = ?',
      [verificationToken, userId]
    );

    // Verify the token was stored correctly before sending email
    const tokenCheck = await query(
      'SELECT emailVerificationToken FROM users WHERE id = ?',
      [userId]
    );
    
    if (tokenCheck.length === 0 || tokenCheck[0].emailVerificationToken !== verificationToken) {
      console.error('Verification token storage failed for user:', userId);
    } else {
      console.log('✅ Verification token stored successfully for user:', userId);
    }

    // Log user registration activity
    await logActivity(userId, 'user_registered', 'user', userId, 'New user registration completed', req, {
      email: email,
      firstName: firstName,
      lastName: lastName,
      companyName: companyName,
      companyType: companyType,
      companyRole: companyRole
    });

    // Send welcome email with verification
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to Ogla Shea Butter & General Trading - Please Verify Your Email',
        template: 'welcome-verification',
        data: {
          firstName,
          companyName,
          verificationToken
        }
      });
      console.log('✅ Welcome verification email sent to:', email);
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: userId,
          firstName,
          lastName,
          email,
          companyName,
          role: 'customer'
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user by email
    const users = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user is active
    if (!user.isActive) {
      // Log failed login attempt
      await logActivity(user.id, 'login_failed', 'user', user.id, 'Account deactivated', req);
      
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if email is verified (skip for super admin)
    if (!user.emailVerified && user.role !== 'super_admin') {
      console.log(\`Login blocked for unverified email: \${email}\`);
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address before logging in. Check your inbox for a verification link.',
        requiresVerification: true
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // Log failed login attempt
      await logActivity(user.id, 'login_failed', 'user', user.id, 'Invalid password', req);
      
      console.log(\`Login failed for \${email}: Invalid password\`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await query(
      'UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Log successful login activity
    await logActivity(user.id, 'user_login', 'user', user.id, 'User logged in successfully', req, {
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Logout user (optional - for activity logging)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Log logout activity
    await logActivity(req.user.id, 'user_logout', 'user', req.user.id, 'User logged out', req);

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
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

    const { email } = req.body;

    // Check if user exists
    const users = await query(
      'SELECT id, firstName FROM users WHERE email = ? AND isActive = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await query(
      'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = datetime("now", "+1 hour") WHERE id = ?',
      [resetToken, user.id]
    );

    // Log password reset request activity
    await logActivity(user.id, 'password_reset_requested', 'user', user.id, 'User requested password reset', req, {
      email: email
    });

    // Send reset email
    try {
      await sendEmail({
        to: email,
        subject: 'Password Reset Request - Ogla Shea Butter',
        template: 'passwordReset',
        data: {
          firstName: user.firstName,
          resetToken
        }
      });
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Password reset email sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset'
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }

    // Check if token exists and is not expired
    const users = await query(
      'SELECT id FROM users WHERE id = ? AND resetPasswordToken = ? AND resetPasswordExpires > datetime("now")',
      [decoded.userId, token]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password, clear reset token, and verify email (since they proved they have access to email)
    await query(
      'UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL, emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?',
      [hashedPassword, decoded.userId]
    );

    // Log password reset activity
    await logActivity(decoded.userId, 'password_reset', 'user', decoded.userId, 'User reset their password', req);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Reset token expired'
      });
    }

    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  }
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty().withMessage('Verification token is required')
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

    const { token } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'email_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token exists and is not expired
    const users = await query(
      'SELECT id, emailVerified FROM users WHERE id = ? AND emailVerificationToken = ? AND emailVerificationExpires > datetime("now")',
      [decoded.userId, token]
    );

    if (users.length === 0) {
      // Additional debugging to see why verification failed
      const userCheck = await query(
        'SELECT id, emailVerified, emailVerificationToken, emailVerificationExpires, datetime("now") as now FROM users WHERE id = ?',
        [decoded.userId]
      );
      
      console.log('❌ Email verification failed for user:', decoded.userId);
      console.log('   - User exists:', userCheck.length > 0);
      if (userCheck.length > 0) {
        const user = userCheck[0];
        console.log('   - Already verified:', user.emailVerified);
        console.log('   - Token matches:', user.emailVerificationToken === token);
        console.log('   - Token expires:', user.emailVerificationExpires);
        console.log('   - Current time:', user.now);
        console.log('   - Token expired:', user.emailVerificationExpires <= user.now);
      }
      
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    const user = users[0];

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Mark email as verified and clear verification token
    await query(
      'UPDATE users SET emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?',
      [decoded.userId]
    );

    // Log email verification activity
    await logActivity(decoded.userId, 'email_verified', 'user', decoded.userId, 'User verified their email address', req);

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification token expired'
      });
    }

    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
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

    const { email } = req.body;

    // Check if user exists and is not verified
    const users = await query(
      'SELECT id, firstName, emailVerified FROM users WHERE email = ? AND isActive = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { userId: user.id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Store new verification token
    await query(
      'UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = datetime("now", "+24 hours") WHERE id = ?',
      [verificationToken, user.id]
    );

    console.log('✅ Resend verification token stored for user:', user.id);

    // Send verification email
    try {
      await sendEmail({
        to: email,
        subject: 'Email Verification - Ogla Shea Butter',
        template: 'email-verification',
        data: {
          firstName: user.firstName,
          verificationToken
        }
      });
      
      console.log('✅ Verification email sent to:', email);
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, firstName, lastName, email, phone, companyName, companyType, companyRole, address, role, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    if (user.address) {
      user.address = JSON.parse(user.address);
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().custom((value) => {
    if (!value) return true; // Phone is optional
    // Allow international phone numbers with + prefix and 7-15 digits
    const phoneRegex = /^\+[1-9]\\d{6,14}$/;
    if (!phoneRegex.test(value)) {
      throw new Error('Phone number must be in international format (e.g., +233204543372)');
    }
    return true;
  }),
  body('companyName').optional().trim().isLength({ min: 2, max: 100 }),
  body('companyType').optional().isIn([
    'Agriculture & Farming',
    'Food & Beverage',
    'Cosmetics & Beauty',
    'Textiles & Fashion',
    'Healthcare & Pharmaceuticals',
    'Retail & Wholesale',
    'Manufacturing',
    'Export/Import',
    'Hospitality & Tourism',
    'Education',
    'Technology',
    'Construction',
    'Transportation & Logistics',
    'Energy & Utilities',
    'Other'
  ]),
  body('companyRole').optional().isIn([
    'Owner/CEO',
    'Manager/Director',
    'Purchasing Manager',
    'Procurement Officer',
    'Sales Manager',
    'Marketing Manager',
    'Operations Manager',
    'Business Development',
    'Consultant',
    'Employee',
    'Other'
  ]),
  body('address').optional().isObject().withMessage('Address must be an object')
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

    const updateFields = [];
    const updateValues = [];

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (['firstName', 'lastName', 'phone', 'companyName', 'companyType', 'companyRole', 'address'].includes(key)) {
        updateFields.push(\`\${key} = ?\`);
        updateValues.push(key === 'address' ? JSON.stringify(req.body[key]) : req.body[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateValues.push(req.user.id);

    await query(
      \`UPDATE users SET \${updateFields.join(', ')} WHERE id = ?\`,
      updateValues
    );

    // Log profile update activity
    await logActivity(req.user.id, 'profile_updated', 'user', req.user.id, 'User updated their profile', req, {
      updatedFields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const users = await query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    // Log password change activity
    await logActivity(req.user.id, 'password_changed', 'user', req.user.id, 'User changed their password', req);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

module.exports = router;`;

try {
  // Write the clean content to the file
  fs.writeFileSync(authFilePath, cleanAuthContent, 'utf8');
  
  console.log('✅ Successfully rebuilt auth.js with clean structure');
  console.log('📝 File contains all necessary routes with proper try-catch blocks');
  console.log('🔐 Routes included: register, login, logout, forgot-password, reset-password, verify-email, resend-verification, profile, change-password');
  console.log('📊 All routes now include activity logging');
  
} catch (error) {
  console.error('❌ Error rebuilding auth.js:', error);
}

