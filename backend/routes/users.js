const express = require("express");
const {
  query: validatorQuery,
  validationResult,
} = require("express-validator");
const { pool, query, queryWithTimeout } = require("../config/azure-database");
const {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
} = require("../middleware/auth");
const { logActivity } = require("./activities");

const router = express.Router();

// All routes require admin authentication - temporarily disabled for testing
router.use(authenticateToken, requireAdmin);

// Create new user (super admin only)
router.post("/", requireSuperAdmin, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "user",
      companyName,
      companyType,
      companyRole,
      phone,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required",
      });
    }

    // Validate role
    if (!["user", "staff", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be user, staff, or admin",
      });
    }

    // Check if email already exists
    const existingUser = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and get ID - Azure SQL compatible
    const result = await query(
      `
      INSERT INTO users (
        firstName, lastName, email, password, role, companyName, companyType, companyRole, phone,
        isVerified, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, GETUTCDATE(), GETUTCDATE());
      SELECT SCOPE_IDENTITY() as insertId;
    `,
      [
        firstName,
        lastName,
        email,
        hashedPassword,
        role,
        companyName,
        companyType,
        companyRole,
        phone,
      ]
    );

    // Get the insert ID from the result
    const insertId = result && result.length > 0 ? result[result.length - 1].insertId : null;
    
    if (!insertId) {
      throw new Error('Failed to get user ID after creation');
    }

    // Get created user (without password)
    const newUser = await query(
      `
      SELECT id, firstName, lastName, email, role, companyName, companyType, companyRole, phone,
             isVerified, isActive, createdAt, updatedAt
      FROM users WHERE id = ?
    `,
      [insertId]
    );

    // Log user creation activity
    await logActivity(
      req.user.id,
      "admin_user_created",
      "user",
      insertId,
      "Admin created new user",
      req,
      {
        newUserId: insertId,
        newUserEmail: email,
        newUserRole: role,
        newUserName: `${firstName} ${lastName}`,
      }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: newUser[0],
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
    });
  }
});

// Set query timeout (15 seconds)
const QUERY_TIMEOUT = 15000;

// Get all users with pagination
router.get(
  "/",
  [
    validatorQuery("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    validatorQuery("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    validatorQuery("search")
      .optional()
      .isString()
      .withMessage("Search must be a string"),
    validatorQuery("role")
      .optional()
      .isIn(["customer", "admin", "super_admin"])
      .withMessage("Valid role is required"),
    validatorQuery("isActive")
      .optional()
      .isBoolean()
      .withMessage("Active status must be a boolean"),
  ],
  async (req, res) => {
    const start = Date.now();
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { page = 1, limit = 20, search, role, isActive } = req.query;

      const offset = (page - 1) * limit;
      const whereConditions = ["1=1"];
      const params = [];

      // Add search condition
      if (search) {
        whereConditions.push(
          "(firstName LIKE ? OR lastName LIKE ? OR email LIKE ? OR companyName LIKE ?)"
        );
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Add role filter
      if (role) {
        whereConditions.push("role = ?");
        params.push(role);
      }

      // Add active status filter
      if (isActive !== undefined) {
        whereConditions.push("isActive = ?");
        params.push(isActive === "true");
      }

      const whereClause = whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1";

      // Get total count and users in parallel
      const [countResult, users] = await Promise.all([
        queryWithTimeout(
          `SELECT COUNT(*) as total FROM users WHERE ${whereClause}`,
          params
        ),
        queryWithTimeout(
          `SELECT TOP ${parseInt(limit)} id, firstName, lastName, email, phone, companyName, companyType, companyRole, 
                  role, isActive, emailVerified, createdAt, updatedAt, lastLoginAt
           FROM users WHERE ${whereClause} 
           ORDER BY createdAt DESC`,
          params
        ),
      ]);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users: users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get users",
      });
    }
  }
);

// Get single user by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const users = await query(
      `SELECT id, firstName, lastName, email, phone, companyName, companyType, companyRole, 
              address, role, isActive, emailVerified, createdAt, updatedAt, lastLoginAt 
       FROM users WHERE id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];

    // Parse JSON fields
    const formattedUser = {
      ...user,
      address: user.address ? JSON.parse(user.address) : null,
    };

    res.json({
      success: true,
      data: formattedUser,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user",
    });
  }
});

// Update user status (activate/deactivate)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    await query("UPDATE users SET isActive = ? WHERE id = ?", [isActive, id]);

    res.json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
    });
  }
});

// Update user role
router.patch("/:id/role", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["customer", "admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    await query("UPDATE users SET role = ? WHERE id = ?", [role, id]);

    res.json({
      success: true,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
});

// Update user information
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      companyType,
      companyRole,
      role,
      isActive,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !companyName) {
      return res.status(400).json({
        success: false,
        message: "Required fields: firstName, lastName, email, companyName",
      });
    }

    // Validate role
    if (role && !["customer", "admin", "super_admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    // Check if user exists
    const existingUsers = await query("SELECT id FROM users WHERE id = ?", [
      id,
    ]);

    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if email is already taken by another user
    const emailCheck = await query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );

    if (emailCheck.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email address is already taken",
      });
    }

    // Update user
    await query(
      `UPDATE users SET 
        firstName = ?, 
        lastName = ?, 
        email = ?, 
        phone = ?, 
        companyName = ?, 
        companyType = ?, 
        companyRole = ?, 
        role = ?, 
        isActive = ?,
        updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?`,
      [
        firstName.trim(),
        lastName.trim(),
        email.trim(),
        phone?.trim() || null,
        companyName.trim(),
        companyType || null,
        companyRole || null,
        role || "customer",
        isActive !== undefined ? isActive : true,
        id,
      ]
    );

    res.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
});

// Delete user (soft delete)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🗑️ Delete user request received for ID:", id);

    // Check if user exists
    const users = await query(
      "SELECT id, firstName, lastName FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      console.log("❌ User not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("👤 Found user to delete:", users[0]);

    // Soft delete - set isActive to 0
    await query(
      "UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    console.log("✅ User soft deleted successfully");

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
});

// Restore user (reactivate)
router.patch("/:id/restore", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔄 Restore user request received for ID:", id);

    // Check if user exists
    const users = await query(
      "SELECT id, firstName, lastName, isActive FROM users WHERE id = ?",
      [id]
    );

    if (users.length === 0) {
      console.log("❌ User not found for ID:", id);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];
    console.log("👤 Found user to restore:", user);

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: "User is already active",
      });
    }

    // Restore user - set isActive to 1
    await query(
      "UPDATE users SET isActive = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
      [id]
    );

    console.log("✅ User restored successfully");

    res.json({
      success: true,
      message: "User restored successfully",
    });
  } catch (error) {
    console.error("❌ Restore user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to restore user",
    });
  }
});

// Bulk operations for users
router.post("/bulk/delete", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required" });
    }

    // Soft delete multiple users
    const placeholders = userIds.map(() => "?").join(",");
    await query(
      `UPDATE users 
      SET isActive = 0, updatedAt = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})`,
      userIds
    );

    // Log bulk delete activity
    await logActivity(
      req.user.id,
      "bulk_users_deleted",
      "user",
      null,
      `Admin deleted ${userIds.length} users`,
      req,
      {
        userIds: userIds,
        deletedCount: userIds.length,
      }
    );

    res.json({
      message: `Successfully deleted ${userIds.length} user(s)`,
      deletedCount: userIds.length,
    });
  } catch (error) {
    console.error("Error in bulk delete:", error);
    res.status(500).json({ message: "Error performing bulk delete" });
  }
});

// Bulk update user status
router.post("/bulk/update-status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { userIds, status } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "User IDs array is required" });
    }

    if (status === undefined || ![0, 1].includes(status)) {
      return res
        .status(400)
        .json({ message: "Valid status (0 or 1) is required" });
    }

    // Update status for multiple users
    const placeholders = userIds.map(() => "?").join(",");
    await query(
      `UPDATE users 
      SET isActive = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})`,
      [status, ...userIds]
    );

    // Log bulk status update activity
    await logActivity(
      req.user.id,
      "bulk_users_status_updated",
      "user",
      null,
      `Admin updated status for ${userIds.length} users`,
      req,
      {
        userIds: userIds,
        updatedCount: userIds.length,
        newStatus: status,
      }
    );

    res.json({
      message: `Successfully updated status for ${userIds.length} user(s)`,
      updatedCount: userIds.length,
      newStatus: status,
    });
  } catch (error) {
    console.error("Error in bulk status update:", error);
    res.status(500).json({ message: "Error performing bulk status update" });
  }
});

// Get user request history (super admin only)
router.get("/:id/requests", requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await query(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
      [id]
    );
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get total count
    const countResult = await query(
      "SELECT COUNT(*) as total FROM requests WHERE userId = ?",
      [id]
    );
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get user requests
    const requests = await query(
      `
      SELECT 
        r.id,
        r.invoiceNumber,
        r.status,
        r.totalAmount,
        r.createdAt,
        r.updatedAt,
        COUNT(ri.id) as itemCount
      FROM requests r
      LEFT JOIN request_items ri ON r.id = ri.requestId
      WHERE r.userId = ?
      GROUP BY r.id
      ORDER BY r.createdAt DESC
      LIMIT ? OFFSET ?
    `,
      [id, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: {
        user: user[0],
        requests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user requests",
    });
  }
});

// Export users to CSV
router.get("/export/csv", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { includeInactive = "false" } = req.query;
    const showOnlyActive = includeInactive !== "true";

    const users = await query(`
      SELECT 
        u.id,
        u.firstName,
        u.lastName,
        u.email,
        u.role,
        u.isActive,
        u.createdAt,
        u.updatedAt,
        COUNT(r.id) as totalRequests
      FROM users u
      LEFT JOIN requests r ON u.id = r.userId
      ${showOnlyActive ? "WHERE u.isActive = 1" : ""}
      GROUP BY u.id
      ORDER BY u.createdAt DESC
    `);

    // Convert to CSV format
    const csvHeader =
      "ID,First Name,Last Name,Email,Role,Status,Total Requests,Created,Updated\n";
    const csvRows = users
      .map(
        (user) =>
          `${user.id},"${user.firstName || ""}","${user.lastName || ""}","${
            user.email || ""
          }","${user.role || ""}",${user.isActive ? "Active" : "Inactive"},${
            user.totalRequests || 0
          },"${user.createdAt || ""}","${user.updatedAt || ""}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;

    // Log CSV export activity
    await logActivity(
      req.user.id,
      "users_exported_csv",
      "user",
      null,
      "Admin exported users to CSV",
      req,
      {
        exportCount: users.length,
        filename: "users-export.csv",
        includeInactive: !showOnlyActive,
        activeOnly: showOnlyActive,
      }
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users-export.csv"'
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting users:", error);
    res.status(500).json({ message: "Error exporting users" });
  }
});

module.exports = router;
