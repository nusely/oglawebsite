const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, query, run } = require('../config/database');
const router = express.Router();

// Create activities table if it doesn't exist
const initializeActivitiesTable = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        action TEXT NOT NULL,
        entityType TEXT NOT NULL,
        entityId INTEGER,
        details TEXT,
        ipAddress TEXT,
        userAgent TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Activities table initialized');
  } catch (error) {
    console.error('❌ Error initializing activities table:', error);
  }
};

// Initialize table on module load
initializeActivitiesTable();

// Log an activity
const logActivity = async (userId, action, entityType, entityId, details, req, metadata = null) => {
  try {
    // Enhanced IP detection
    const ipAddress = req?.ip || 
                     req?.connection?.remoteAddress || 
                     req?.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                     req?.headers['x-real-ip'] ||
                     'unknown';
    
    const userAgent = req?.get('User-Agent') || 'unknown';
    
    // Convert metadata to JSON string if it's an object
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;
    const metadataString = metadata ? JSON.stringify(metadata) : null;
    
    await run(`
      INSERT INTO activities (userId, action, entityType, entityId, details, ipAddress, userAgent, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [userId, action, entityType, entityId, detailsString, ipAddress, userAgent]);
    
    console.log(`📝 Activity logged: ${action} - ${entityType} (User: ${userId || 'Anonymous'}, IP: ${ipAddress})`);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// Get all activities (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { page = 1, limit = 50, entityType, action, userId } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE 1=1';
    let params = [];

    if (entityType) {
      whereClause += ' AND entityType = ?';
      params.push(entityType);
    }

    if (action) {
      whereClause += ' AND action = ?';
      params.push(action);
    }

    if (userId) {
      whereClause += ' AND a.userId = ?';
      params.push(userId);
    }

    // Get total count
    const countResult = await query(`
      SELECT COUNT(*) as total
      FROM activities a
      ${whereClause}
    `, params);

    const total = countResult[0].total;

    // Get activities with user info
    const activities = await query(`
      SELECT 
        a.*,
        u.firstName,
        u.lastName,
        u.email
      FROM activities a
      LEFT JOIN users u ON a.userId = u.id
      ${whereClause}
      ORDER BY a.createdAt DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      action: activity.action,
      entityType: activity.entityType,
      entityId: activity.entityId,
      details: activity.details,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      createdAt: activity.createdAt,
      user: activity.firstName && activity.lastName 
        ? `${activity.firstName} ${activity.lastName}`
        : activity.email || 'System'
    }));

    res.json({
      activities: formattedActivities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Error fetching activities' });
  }
});

// Get activity statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { days = 30 } = req.query;

    // Get activity counts by type for the last N days
    const activityStats = await query(`
      SELECT 
        entityType,
        action,
        COUNT(*) as count
      FROM activities
      WHERE createdAt >= datetime('now', '-${days} days')
      GROUP BY entityType, action
      ORDER BY count DESC
    `);

    // Get daily activity counts
    const dailyStats = await query(`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM activities
      WHERE createdAt >= datetime('now', '-${days} days')
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
    `);

    // Get top users by activity
    const topUsers = await query(`
      SELECT 
        u.firstName,
        u.lastName,
        u.email,
        COUNT(a.id) as activityCount
      FROM activities a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.createdAt >= datetime('now', '-${days} days')
        AND a.userId IS NOT NULL
      GROUP BY a.userId
      ORDER BY activityCount DESC
      LIMIT 10
    `);

    res.json({
      activityStats,
      dailyStats,
      topUsers,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Error fetching activity stats:', error);
    res.status(500).json({ message: 'Error fetching activity statistics' });
  }
});

// Export activities to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
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
      FROM activities a
      LEFT JOIN users u ON a.userId = u.id
      WHERE a.createdAt >= datetime('now', '-${days} days')
      ORDER BY a.createdAt DESC
    `);

    // Convert to CSV format
    const csvHeader = 'ID,Action,Entity Type,Entity ID,Details,IP Address,User,Created\n';
    const csvRows = activities.map(activity => {
      const user = activity.firstName && activity.lastName 
        ? `${activity.firstName} ${activity.lastName}`
        : activity.email || 'System';
      
      return `${activity.id},"${activity.action}","${activity.entityType}","${activity.entityId || ''}","${activity.details || ''}","${activity.ipAddress || ''}","${user}","${activity.createdAt}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Log CSV export activity
    await logActivity(req.user.id, 'activities_exported_csv', 'activity', null, 'Admin exported activities to CSV', req, {
      exportDays: days,
      exportCount: activities.length,
      filename: `activities-export-${days}days.csv`
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="activities-export-${days}days.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting activities:', error);
    res.status(500).json({ message: 'Error exporting activities' });
  }
});

module.exports = { router, logActivity };
