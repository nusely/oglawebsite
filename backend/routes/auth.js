const express = require("express");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { query } = require("../config/azure-database");
const { sendEmail } = require("../utils/email");
const { logActivity } = require("./activities");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Reusable E.164 phone regex: + followed by 7–15 digits, first digit 1–9
const PHONE_REGEX = /^\+[1-9]\d{6,14}$/;

// Helpers
const buildValidationErrorResponse = (errors) => ({
  success: false,
  message: "Validation failed",
  errors: errors.array(),
});

const pickUserPublic = (u) => {
  if (!u) return u;
  const {
    password,
    resetPasswordToken,
    resetPasswordExpires,
    emailVerificationToken,
    emailVerificationExpires,
    ...rest
  } = u;
  return rest;
};

// =========================
// POST /auth/register
// =========================
router.post(
  "/register",
  [
    body("firstName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be 2-50 characters"),
    body("lastName")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be 2-50 characters"),
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("phone")
      .optional()
      .custom((value) => {
        if (!value) return true;
        if (!PHONE_REGEX.test(value)) {
          throw new Error(
            "Phone number must be in international format (e.g., +233204543372)"
          );
        }
        return true;
      }),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("companyName")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Company name must be 2-100 characters"),
    body("companyType")
      .isIn([
        "Agriculture & Farming",
        "Food & Beverage",
        "Cosmetics & Beauty",
        "Textiles & Fashion",
        "Healthcare & Pharmaceuticals",
        "Retail & Wholesale",
        "Manufacturing",
        "Export/Import",
        "Hospitality & Tourism",
        "Education",
        "Technology",
        "Construction",
        "Transportation & Logistics",
        "Energy & Utilities",
        "Other",
      ])
      .withMessage("Valid company type is required"),
    body("companyRole")
      .isIn([
        "Owner/CEO",
        "Manager/Director",
        "Purchasing Manager",
        "Procurement Officer",
        "Sales Manager",
        "Marketing Manager",
        "Operations Manager",
        "Business Development",
        "Consultant",
        "Employee",
        "Other",
      ])
      .withMessage("Valid company role is required"),
    body("address")
      .optional()
      .isObject()
      .withMessage("Address must be an object"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const {
        firstName,
        lastName,
        email,
        phone,
        password,
        companyName,
        companyType,
        companyRole,
        address,
      } = req.body;

      // Check for existing user
      const existing = await query("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert user
      const insertResult = await query(
        `INSERT INTO users (
          firstName, lastName, email, phone, password,
          companyName, companyType, companyRole, address, role, isActive, emailVerified,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0,
          GETUTCDATE(), GETUTCDATE());
         SELECT SCOPE_IDENTITY() as id;`,
        [
          firstName,
          lastName,
          email,
          phone || null,
          hashedPassword,
          companyName,
          companyType,
          companyRole,
          address ? JSON.stringify(address) : null,
          "customer",
        ]
      );

      const userId = insertResult[0]?.id;
      if (!userId) {
        console.error("Failed to get inserted user ID:", insertResult);
        return res
          .status(500)
          .json({ success: false, message: "Failed to create user account" });
      }

      // JWTs
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });
      const verificationToken = jwt.sign(
        { userId, type: "email_verification" },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Store verification token
      await query(
        "UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = DATEADD(hour, 24, GETUTCDATE()) WHERE id = ?",
        [verificationToken, userId]
      );

      await logActivity(
        userId,
        "user_registered",
        "user",
        userId,
        "New user registration completed",
        req,
        {
          email,
          firstName,
          lastName,
          companyName,
          companyType,
          companyRole,
        }
      );

      // Send welcome + verification email (best-effort)
      try {
        await sendEmail({
          to: email,
          subject:
            "Welcome to Ogla Shea Butter & General Trading - Please Verify Your Email",
          template: "welcome-verification",
          data: { firstName, companyName, verificationToken },
        });
      } catch (emailError) {
        console.error("Welcome email failed:", emailError);
      }

      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: {
            id: userId,
            firstName,
            lastName,
            email,
            companyName,
            role: "customer",
          },
          token,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Registration failed" });
    }
  }
);

// =========================
// POST /auth/login
// =========================
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { email, password } = req.body;

      const users = await query("SELECT * FROM users WHERE email = ?", [email]);
      if (users.length === 0) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      const user = users[0];

      if (user.isActive === 0) {
        await logActivity(
          user.id,
          "login_failed",
          "user",
          user.id,
          "Account deactivated",
          req
        );
        return res.status(401).json({
          success: false,
          message: "Your account has been deactivated. Please contact support.",
        });
      }

      if (!user.emailVerified && user.role !== "super_admin") {
        await logActivity(
          user.id,
          "login_failed",
          "user",
          user.id,
          "Email not verified",
          req
        );
        return res.status(401).json({
          success: false,
          message:
            "Please verify your email address before logging in. Check your inbox for a verification link.",
          requiresVerification: true,
        });
      }

      const passwordOk = await bcrypt.compare(password, user.password);
      if (!passwordOk) {
        await logActivity(
          user.id,
          "login_failed",
          "user",
          user.id,
          "Invalid password",
          req
        );
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password" });
      }

      await query(
        "UPDATE users SET lastLoginAt = CURRENT_TIMESTAMP WHERE id = ?",
        [user.id]
      );

      await logActivity(
        user.id,
        "user_login",
        "user",
        user.id,
        "User logged in successfully",
        req,
        {
          email: user.email,
          role: user.role,
          loginTime: new Date().toISOString(),
        }
      );

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });

      return res.json({
        success: true,
        message: "Login successful",
        data: { user: pickUserPublic(user), token },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ success: false, message: "Login failed" });
    }
  }
);

// =========================
// POST /auth/logout (optional)
// =========================
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    await logActivity(
      req.user.id,
      "user_logout",
      "user",
      req.user.id,
      "User logged out",
      req
    );
    return res.json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
});

// =========================
// POST /auth/forgot-password
// =========================
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { email } = req.body;

      const users = await query(
        "SELECT id, firstName FROM users WHERE email = ? AND isActive = 1",
        [email]
      );
      if (users.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const user = users[0];

      const resetToken = jwt.sign(
        { userId: user.id, type: "password_reset" },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      await query(
        'UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = DATEADD(HOUR, 1, GETUTCDATE()) WHERE id = ?',
        [resetToken, user.id]
      );

      await logActivity(
        user.id,
        "password_reset_requested",
        "user",
        user.id,
        "User requested password reset",
        req,
        { email }
      );

      try {
        await sendEmail({
          to: email,
          subject: "Password Reset Request - Ogla Shea Butter",
          template: "passwordReset",
          data: { firstName: user.firstName, resetToken },
        });
      } catch (emailError) {
        console.error("Password reset email failed:", emailError);
      }

      return res.json({ success: true, message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to process password reset" });
    }
  }
);

// =========================
// POST /auth/reset-password
// =========================
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { token, newPassword } = req.body;

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res
            .status(400)
            .json({ success: false, message: "Reset token expired" });
        }
        return res
          .status(400)
          .json({ success: false, message: "Invalid reset token" });
      }

      if (decoded.type !== "password_reset") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid reset token" });
      }

      const users = await query(
        'SELECT id FROM users WHERE id = ? AND resetPasswordToken = ? AND resetPasswordExpires > GETUTCDATE()',
        [decoded.userId, token]
      );
      if (users.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid or expired reset token" });
      }

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await query(
        "UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL, emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?",
        [hashedPassword, decoded.userId]
      );

      await logActivity(
        decoded.userId,
        "password_reset",
        "user",
        decoded.userId,
        "User reset their password",
        req
      );

      return res.json({
        success: true,
        message: "Password reset successfully",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to reset password" });
    }
  }
);

// =========================
// POST /auth/verify-email
// =========================
router.post(
  "/verify-email",
  [body("token").notEmpty().withMessage("Verification token is required")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { token } = req.body;

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          return res
            .status(400)
            .json({ success: false, message: "Verification token expired" });
        }
        return res
          .status(400)
          .json({ success: false, message: "Invalid verification token" });
      }

      if (decoded.type !== "email_verification") {
        return res
          .status(400)
          .json({ success: false, message: "Invalid verification token" });
      }

      const users = await query(
        "SELECT id, emailVerified FROM users WHERE id = ? AND emailVerificationToken = ? AND emailVerificationExpires > GETUTCDATE()",
        [decoded.userId, decoded.tokenId]
      );

      if (users.length === 0) {
        // Debugging info (does not leak to client)
        try {
          const userCheck = await query(
            "SELECT id, emailVerified, emailVerificationToken, emailVerificationExpires, GETUTCDATE() as now FROM users WHERE id = ?",
            [decoded.userId]
          );
          console.log("❌ Email verification failed for user:", decoded.userId);
          console.log("   - User exists:", userCheck.length > 0);
          if (userCheck.length > 0) {
            const u = userCheck[0];
            console.log("   - Already verified:", u.emailVerified);
            console.log(
              "   - Token matches:",
              u.emailVerificationToken === decoded.tokenId
            );
            console.log("   - Token expires:", u.emailVerificationExpires);
            console.log("   - Current time:", u.now);
            console.log(
              "   - Token expired:",
              u.emailVerificationExpires <= u.now
            );
          }
        } catch (_) {}

        return res.status(400).json({
          success: false,
          message: "Invalid or expired verification token",
        });
      }

      const user = users[0];
      if (user.emailVerified) {
        return res
          .status(400)
          .json({ success: false, message: "Email is already verified" });
      }

      await query(
        "UPDATE users SET emailVerified = 1, emailVerificationToken = NULL, emailVerificationExpires = NULL WHERE id = ?",
        [decoded.userId]
      );

      await logActivity(
        decoded.userId,
        "email_verified",
        "user",
        decoded.userId,
        "User verified their email address",
        req
      );

      return res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error("Email verification error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to verify email" });
    }
  }
);

// =========================
// POST /auth/resend-verification
// =========================
router.post(
  "/resend-verification",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { email } = req.body;

      const users = await query(
        "SELECT id, firstName, emailVerified FROM users WHERE email = ? AND isActive = 1",
        [email]
      );
      if (users.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const user = users[0];
      if (user.emailVerified)
        return res
          .status(400)
          .json({ success: false, message: "Email is already verified" });

      // Create a unique token ID for database storage
      const tokenId = Math.random().toString(36).substring(2, 15);

      // Generate verification token with token ID
      const verificationToken = jwt.sign(
        { userId: user.id, type: "email_verification", tokenId },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Store just the token ID in database
      await query(
        "UPDATE users SET emailVerificationToken = ?, emailVerificationExpires = DATEADD(hour, 24, GETUTCDATE()) WHERE id = ?",
        [tokenId, user.id]
      );

      try {
        await sendEmail({
          to: email,
          subject: "Email Verification - Ogla Shea Butter",
          template: "email-verification",
          data: { firstName: user.firstName, verificationToken },
        });
      } catch (emailError) {
        console.error("Verification email failed:", emailError);
      }

      return res.json({ success: true, message: "Verification email sent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to send verification email" });
    }
  }
);

// =========================
// GET /auth/profile
// =========================
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const users = await query(
      "SELECT id, firstName, lastName, email, phone, companyName, companyType, companyRole, address, role, createdAt, isActive, emailVerified, lastLoginAt FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const user = users[0];
    if (user.address) {
      try {
        user.address = JSON.parse(user.address);
      } catch (_) {}
    }

    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Get profile error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get profile" });
  }
});

// =========================
// PUT /auth/profile
// =========================
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
    body("phone")
      .optional()
      .custom((value) => {
        if (!value) return true;
        if (!PHONE_REGEX.test(value)) {
          throw new Error(
            "Phone number must be in international format (e.g., +233204543372)"
          );
        }
        return true;
      }),
    body("companyName").optional().trim().isLength({ min: 2, max: 100 }),
    body("companyType")
      .optional()
      .isIn([
        "Agriculture & Farming",
        "Food & Beverage",
        "Cosmetics & Beauty",
        "Textiles & Fashion",
        "Healthcare & Pharmaceuticals",
        "Retail & Wholesale",
        "Manufacturing",
        "Export/Import",
        "Hospitality & Tourism",
        "Education",
        "Technology",
        "Construction",
        "Transportation & Logistics",
        "Energy & Utilities",
        "Other",
      ]),
    body("companyRole")
      .optional()
      .isIn([
        "Owner/CEO",
        "Manager/Director",
        "Purchasing Manager",
        "Procurement Officer",
        "Sales Manager",
        "Marketing Manager",
        "Operations Manager",
        "Business Development",
        "Consultant",
        "Employee",
        "Other",
      ]),
    body("address")
      .optional()
      .isObject()
      .withMessage("Address must be an object"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const updateFields = [];
      const updateValues = [];

      const allowed = [
        "firstName",
        "lastName",
        "phone",
        "companyName",
        "companyType",
        "companyRole",
        "address",
      ];
      for (const key of Object.keys(req.body)) {
        if (!allowed.includes(key)) continue;
        updateFields.push(`${key} = ?`);
        updateValues.push(
          key === "address" ? JSON.stringify(req.body[key]) : req.body[key]
        );
      }

      if (updateFields.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No valid fields to update" });
      }

      updateValues.push(req.user.id);

      await query(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      await logActivity(
        req.user.id,
        "profile_updated",
        "user",
        req.user.id,
        "User updated their profile",
        req,
        {
          updatedFields: Object.keys(req.body),
        }
      );

      return res.json({
        success: true,
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Update profile error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to update profile" });
    }
  }
);

// =========================
// PUT /auth/change-password
// =========================
router.put(
  "/change-password",
  authenticateToken,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json(buildValidationErrorResponse(errors));

      const { currentPassword, newPassword } = req.body;

      const users = await query("SELECT password FROM users WHERE id = ?", [
        req.user.id,
      ]);
      if (users.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });

      const ok = await bcrypt.compare(currentPassword, users[0].password);
      if (!ok)
        return res
          .status(400)
          .json({ success: false, message: "Current password is incorrect" });

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      await query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        req.user.id,
      ]);

      await logActivity(
        req.user.id,
        "password_changed",
        "user",
        req.user.id,
        "User changed their password",
        req
      );

      return res.json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Failed to change password" });
    }
  }
);

module.exports = router;
