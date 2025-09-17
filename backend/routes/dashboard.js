const express = require("express");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { query, queryWithTimeout } = require("../config/azure-database");
const router = express.Router();

// Helper function to format relative time
function formatTimeAgo(minutes) {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Get dashboard statistics
router.get("/stats", authenticateToken, requireAdmin, async (req, res) => {
  const start = Date.now();
  try {
    console.log("📊 Dashboard stats request started");

    // Get current month and last month dates
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    console.log("Date ranges:", {
      currentMonth,
      currentYear,
      lastMonth,
      lastMonthYear,
      now: now.toISOString(),
    });

    // Helper function for getting entity stats - using separate queries but parallel execution
    const getEntityStats = async (table, options = {}) => {
      const { whereClause = "", countField = "id", isRevenue = false } = options;
      const baseWhere = whereClause ? `WHERE ${whereClause}` : "";

      try {
        console.log(`📊 Getting stats for ${table}`);

        // Handle revenue differently
        const selectClause = isRevenue
          ? `ISNULL(SUM(${countField}), 0) as count`
          : `COUNT(*) as count`;

        // Run all three queries in parallel for this table
        const [totalResult, thisMonthResult, lastMonthResult] = await Promise.all([
          queryWithTimeout(`SELECT ${selectClause} FROM ${table} ${baseWhere}`, [], 3000),
          queryWithTimeout(
            `SELECT ${selectClause}
             FROM ${table}
             ${baseWhere ? baseWhere + " AND" : "WHERE"}
             MONTH(createdAt) = ? AND YEAR(createdAt) = ?`,
            [currentMonth, currentYear],
            3000
          ),
          queryWithTimeout(
            `SELECT ${selectClause}
             FROM ${table}
             ${baseWhere ? baseWhere + " AND" : "WHERE"}
             MONTH(createdAt) = ? AND YEAR(createdAt) = ?`,
            [lastMonth, lastMonthYear],
            3000
          )
        ]);

        const totalCount = totalResult[0]?.count || 0;
        const thisMonthCount = thisMonthResult[0]?.count || 0;
        const lastMonthCount = lastMonthResult[0]?.count || 0;

        console.log(`${table} stats:`, { totalCount, thisMonthCount, lastMonthCount });
        return [totalCount, thisMonthCount, lastMonthCount];
      } catch (error) {
        console.error(`Error fetching ${table} stats:`, error);
        return [0, 0, 0];
      }
    };

    console.log("🔄 Fetching all stats - optimized queries");

    // Execute all stats queries in parallel for better performance
    const [userResults, productResults, requestResults, pendingRequestResults, revenueResults, reviewResults] = await Promise.all([
      getEntityStats("users", { whereClause: "isActive = 1" }),
      getEntityStats("products", { whereClause: "isActive = 1" }),
      getEntityStats("requests"),
      getEntityStats("requests", { whereClause: "status = 'pending'" }),
      getEntityStats("requests", { 
        whereClause: "status = 'approved'", 
        countField: "totalAmount", 
        isRevenue: true 
      }),
      getEntityStats("reviews")
    ]);

    console.log("📊 All stats fetched:", {
      users: userResults,
      products: productResults,
      requests: requestResults,
      pendingRequests: pendingRequestResults,
      revenue: revenueResults,
      reviews: reviewResults
    });

    // Calculate growth percentages
    const calculateGrowth = (thisMonth, lastMonth) => {
      return lastMonth > 0
        ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100)
        : 0;
    };

    // Destructure the results
    const [totalUsers, usersThisMonth, usersLastMonth] = userResults;
    const [totalProducts, productsThisMonth, productsLastMonth] =
      productResults;
    const [totalRequests, requestsThisMonth, requestsLastMonth] =
      requestResults;
    const [totalPendingRequests, pendingRequestsThisMonth, pendingRequestsLastMonth] =
      pendingRequestResults;
    const [totalRevenue, revenueThisMonth, revenueLastMonth] = revenueResults;
    const [totalReviews, reviewsThisMonth, reviewsLastMonth] = reviewResults;

    const duration = Date.now() - start;
    console.log(`📊 Dashboard stats completed in ${duration}ms`);

    const response = {
      success: true,
      data: {
        users: {
          total: totalUsers,
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
          growthPercent: calculateGrowth(usersThisMonth, usersLastMonth),
        },
        products: {
          total: totalProducts,
          thisMonth: productsThisMonth,
          lastMonth: productsLastMonth,
          growthPercent: calculateGrowth(productsThisMonth, productsLastMonth),
        },
        requests: {
          total: totalRequests,
          thisMonth: requestsThisMonth,
          lastMonth: requestsLastMonth,
          growthPercent: calculateGrowth(requestsThisMonth, requestsLastMonth),
        },
        pendingRequests: {
          total: totalPendingRequests,
          thisMonth: pendingRequestsThisMonth,
          lastMonth: pendingRequestsLastMonth,
          growthPercent: calculateGrowth(pendingRequestsThisMonth, pendingRequestsLastMonth),
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth,
          growthPercent: calculateGrowth(revenueThisMonth, revenueLastMonth),
        },
        reviews: {
          total: totalReviews,
          thisMonth: reviewsThisMonth,
          lastMonth: reviewsLastMonth,
          growthPercent: calculateGrowth(reviewsThisMonth, reviewsLastMonth),
        },
      },
      timing: { duration },
    };

    console.log("📊 Sending response:", response);
    res.json(response);
  } catch (error) {
    const duration = Date.now() - start;
    console.error("Dashboard stats error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      duration,
    });

    res.status(500).json({ 
      success: false, 
      message:
        process.env.NODE_ENV === "development"
          ? `Failed to fetch dashboard statistics: ${error.message}`
          : "Failed to fetch dashboard statistics",
      timing: { duration },
    });
  }
});

// Get recent activities for dashboard
router.get(
  "/recent-activities",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const start = Date.now();
  try {
    const { limit = 5 } = req.query;

      const activities = await queryWithTimeout(
        `SELECT 
        a.*,
        u.firstName,
        u.lastName,
        u.email,
        DATEDIFF(MINUTE, a.createdAt, GETUTCDATE()) as minutesAgo
        FROM user_activities a
        LEFT JOIN users u ON a.userId = u.id
        ORDER BY a.createdAt DESC
        OFFSET 0 ROWS FETCH NEXT ? ROWS ONLY`,
        [parseInt(limit)]
      );

      const formattedActivities = activities.map((activity) => {
        // Parse Azure SQL date format "Sep 17 2025 12:51AM"
        let isoDate = new Date().toISOString(); // fallback
        
        try {
          // Convert Azure SQL date format to ISO
          const dateStr = activity.createdAt.toString();
          
          // Try parsing the date string directly
          let parsedDate = new Date(dateStr);
          
          // If that fails, try to parse the specific Azure format
          if (isNaN(parsedDate.getTime())) {
            // Parse format like "Sep 17 2025 12:51AM"
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
            isoDate = parsedDate.toISOString();
          }
        } catch (error) {
          console.error('Date parsing error:', error, 'for date:', activity.createdAt);
        }

        return {
          id: activity.id,
          action: activity.action,
          entityType: activity.entityType,
          entityId: activity.entityId,
          details: activity.details,
          ipAddress: activity.ipAddress,
          userAgent: activity.userAgent,
          createdAt: isoDate,
          timeAgo: formatTimeAgo(activity.minutesAgo),
          user:
            activity.firstName && activity.lastName
          ? `${activity.firstName} ${activity.lastName}`
              : activity.email || "System",
        };
      });

      const duration = Date.now() - start;
    res.json({
      success: true,
        data: formattedActivities,
        timing: { duration },
      });
    } catch (error) {
      const duration = Date.now() - start;
      console.error("Recent activities error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch recent activities",
        timing: { duration },
      });
    }
  }
);

// Update request status
router.post(
  "/update-request-status/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    const start = Date.now();
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      // First get the current request details
      const [request] = await queryWithTimeout(
        `SELECT r.*, 
              u.email, 
              u.firstName, 
              u.lastName,
              FORMAT(r.createdAt, 'dd/MM/yyyy') as formattedDate
       FROM requests r 
       JOIN users u ON r.userId = u.id 
       WHERE r.id = ?`,
        [id]
      );
      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      // Update the request status
      await queryWithTimeout(
        "UPDATE requests SET status = ?, adminMessage = ?, updatedAt = GETDATE() WHERE id = ?",
        [status, message || null, id]
      );

      // Log the activity
      await queryWithTimeout(
        `INSERT INTO activities (userId, action, entityType, entityId, details, ipAddress, userAgent) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          req.user.id,
          "update",
          "request",
          id,
          `Updated request status to ${status}`,
          req.ip,
          req.get("user-agent"),
        ]
      );

      // Send email notification
      const emailUtils = require("../utils/email");
      await emailUtils.sendRequestStatusEmail({
        to: request.email,
        name: `${request.firstName} ${request.lastName}`,
        requestId: request.id,
        status,
        message: message || "",
        amount: request.totalAmount,
      });

      const duration = Date.now() - start;
      res.json({
        success: true,
        message: "Request status updated successfully",
        timing: { duration },
      });
  } catch (error) {
      const duration = Date.now() - start;
      console.error("Update request status error:", error);
    res.status(500).json({ 
      success: false, 
        message: "Failed to update request status",
        timing: { duration },
      });
    }
  }
);

// Helper function to handle count endpoints
const createCountEndpoint = (route, query, params = [], errorMessage) => {
  router.get(route, authenticateToken, requireAdmin, async (req, res) => {
    const start = Date.now();
    try {
      const [result] = await queryWithTimeout(query, params);

      const duration = Date.now() - start;
    res.json({
      success: true,
        data: { count: result.count },
        timing: { duration },
    });
  } catch (error) {
      const duration = Date.now() - start;
      console.error(errorMessage + ":", error);
    res.status(500).json({ 
      success: false, 
        message: errorMessage,
        timing: { duration },
    });
  }
});
};

// Get featured products count for dashboard
createCountEndpoint(
  "/featured-products-count",
  "SELECT COUNT(*) as count FROM brand_featured_products WHERE isActive = 1",
  [],
  "Failed to fetch featured products count"
);

// Get pending requests count for dashboard
createCountEndpoint(
  "/pending-requests-count",
  'SELECT COUNT(*) as count FROM requests WHERE status = "pending"',
  [],
  "Failed to fetch pending requests count"
);

// Download request PDF
router.get(
  "/download-request/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Get request details
      const [request] = await queryWithTimeout(
        `SELECT r.*,
          u.email,
          u.firstName,
          u.lastName,
          u.phoneNumber,
          u.address,
          FORMAT(r.createdAt, 'dd/MM/yyyy') as formattedDate
       FROM requests r 
       JOIN users u ON r.userId = u.id 
       WHERE r.id = ?`,
        [id]
      );

      if (!request) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      const pdfGenerator = require("../utils/pdfGenerator");

      // Parse products if it's a string
      const products =
        typeof request.products === "string"
          ? JSON.parse(request.products)
          : request.products;

      // First generate HTML content
      const htmlContent = await pdfGenerator.generateRequestHTML({
        requestId: request.id,
        customerName: `${request.firstName} ${request.lastName}`,
        customerEmail: request.email,
        customerPhone: request.phoneNumber,
        customerAddress: request.address,
        totalAmount: request.totalAmount,
        status: request.status,
        date: request.formattedDate,
        products: products,
        message: request.adminMessage || "",
      });

      // Then generate PDF from HTML
      const pdfBuffer = await pdfGenerator.generatePDF(htmlContent);

      // Set response headers for PDF download
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=request-${request.id}.pdf`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send the PDF
      return res.send(pdfBuffer);
  } catch (error) {
      console.error("Error generating PDF:", error);
      return res.status(500).json({
      success: false, 
        message: "Error generating PDF",
        error: error.message,
    });
  }
  }
);

module.exports = router;
