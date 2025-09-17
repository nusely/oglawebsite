const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  db,
  query,
  run,
  queryWithTimeout,
} = require("../config/azure-database");
const router = express.Router();

// Set query timeout (15 seconds)
const QUERY_TIMEOUT = 15000;

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

// Note: Activities table is now managed by Azure SQL schema
// No need to initialize here as it's already created by the migration script

// Log an activity
const logActivity = async (
  userId,
  action,
  entityType,
  entityId,
  details,
  req,
  metadata = null
) => {
  try {
    // Enhanced IP detection
    const ipAddress =
      req?.ip ||
      req?.connection?.remoteAddress ||
      req?.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req?.headers["x-real-ip"] ||
      "unknown";

    const userAgent = req?.get("User-Agent") || "unknown";

    // Convert metadata to JSON string if it's an object
    const detailsString =
      typeof details === "object" ? JSON.stringify(details) : details;
    const metadataString = metadata ? JSON.stringify(metadata) : null;

    await run(
      `
      INSERT INTO user_activities (userId, action, entityType, entityId, details, ipAddress, userAgent, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, GETUTCDATE())
    `,
      [
        userId,
        action,
        entityType,
        entityId,
        detailsString,
        ipAddress,
        userAgent,
      ]
    );

    console.error(
      `[ACTIVITY LOGGED] action=${action}, entityType=${entityType}, userId=${userId}, entityId=${entityId}, ip=${ipAddress}, userAgent=${userAgent}`
    );
  } catch (error) {
    console.error("[ACTIVITY ERROR]", {
      error,
      userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress: req?.ip,
      userAgent: req?.get("User-Agent"),
    });
  }
};

// Get all activities (admin only)
router.get("/", authenticateToken, async (req, res) => {
  try {
    // Check admin permissions
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Cap at 100
    const { entityType, action, userId } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = "WHERE 1=1";
    let params = [];

    if (entityType) {
      whereClause += " AND entityType = ?";
      params.push(entityType);
    }

    if (action) {
      whereClause += " AND action = ?";
      params.push(action);
    }

    if (userId) {
      whereClause += " AND a.userId = ?";
      params.push(userId);
    }

    try {
      // Get total count first
      const countResult = await queryWithTimeout(
        `SELECT COUNT(*) as total FROM user_activities a ${whereClause}`,
        params
      );

      // Then get paginated activities - using OFFSET/FETCH for proper ordering
      const activities = await queryWithTimeout(
        `SELECT 
            a.*,
            u.firstName,
            u.lastName,
            DATEDIFF(MINUTE, a.createdAt, GETUTCDATE()) as minutesAgo
          FROM user_activities a
          LEFT JOIN users u ON a.userId = u.id
          ${whereClause}
          ORDER BY a.createdAt DESC
          OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`,
        params
      );

      // Extract total count
      const total = countResult[0]?.total || 0;

      // Format activities for frontend
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
              : "System",
        };
      });

      // Return success response
      res.json({
        success: true,
        data: {
          activities: formattedActivities,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching activities",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
      return;
    }
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Error fetching activities" });
  }
});

// Get activity statistics
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { days = 30 } = req.query;

    // Get activity counts by type for the last N days
    const activityStats = await query(`
      SELECT 
        entityType,
        action,
        COUNT(*) as count
      FROM user_activities
      WHERE createdAt >= DATEADD(day, -${days}, GETUTCDATE())
      GROUP BY entityType, action
      ORDER BY count DESC
    `);

    // Get daily activity counts - Azure SQL compatible
    const dailyStats = await query(`
      SELECT 
        CAST(createdAt AS DATE) as date,
        COUNT(*) as count
      FROM user_activities
      WHERE createdAt >= DATEADD(day, -${days}, GETUTCDATE())
      GROUP BY CAST(createdAt AS DATE)
      ORDER BY date DESC
    `);

    // Get top users by activity - Azure SQL compatible
    const topUsers = await query(`
      SELECT TOP 10
        u.firstName,
        u.lastName,
        u.email,
        COUNT(a.id) as activityCount
      FROM user_activities a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.createdAt >= DATEADD(day, -${days}, GETUTCDATE())
        AND a.userId IS NOT NULL
      GROUP BY a.userId, u.firstName, u.lastName, u.email
      ORDER BY activityCount DESC
    `);

    res.json({
      activityStats,
      dailyStats,
      topUsers,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error fetching activity stats:", error);
    res.status(500).json({ message: "Error fetching activity statistics" });
  }
});

// Export activities to CSV
router.get("/export/csv", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { days = 30 } = req.query;

    const activities = await query(`
      SELECT 
        a.id,
        a.action,
        a.entityType,
        a.entityId,
        a.details,
        a.ipAddress,
        a.createdAt,
        u.firstName,
        u.lastName,
        u.email
      FROM user_activities a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.createdAt >= DATEADD(day, -${days}, GETUTCDATE())
      ORDER BY a.createdAt DESC
    `);

    // Convert to CSV format
    const csvHeader =
      "ID,Action,Entity Type,Entity ID,Details,IP Address,User,Created\n";
    const csvRows = activities
      .map((activity) => {
        const user =
          activity.firstName && activity.lastName
            ? `${activity.firstName} ${activity.lastName}`
            : activity.email || "System";

        return `${activity.id},"${activity.action}","${activity.entityType}","${
          activity.entityId || ""
        }","${activity.details || ""}","${
          activity.ipAddress || ""
        }","${user}","${activity.createdAt}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    // Log CSV export activity
    await logActivity(
      req.user.id,
      "activities_exported_csv",
      "activity",
      null,
      "Admin exported activities to CSV",
      req,
      {
        exportDays: days,
        exportCount: activities.length,
        filename: `activities-export-${days}days.csv`,
      }
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="activities-export-${days}days.csv"`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("Error exporting activities:", error);
    res.status(500).json({ message: "Error exporting activities" });
  }
});

module.exports = { router, logActivity };
