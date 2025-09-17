const express = require('express');
const { query: validatorQuery, validationResult } = require('express-validator');
const { query } = require('../config/azure-database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const ActivityLogger = require('../utils/activityLogger');

const router = express.Router();

// Get user activities (admin only)
router.get('/', authenticateToken, requireAdmin, [
  validatorQuery('userId').optional().isInt({ min: 1 }).withMessage('User ID must be a positive integer'),
  validatorQuery('activityType').optional().isString().withMessage('Activity type must be a string'),
  validatorQuery('category').optional().isString().withMessage('Category must be a string'),
  validatorQuery('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  validatorQuery('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  validatorQuery('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  validatorQuery('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
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
      userId,
      activityType,
      category,
      startDate,
      endDate,
      limit = 100,
      offset = 0
    } = req.query;

    let whereConditions = [];
    const params = [];

    if (userId) {
      whereConditions.push('ua.userId = ?');
      params.push(userId);
    }

    if (activityType) {
      whereConditions.push('ua.activityType = ?');
      params.push(activityType);
    }

    if (category) {
      whereConditions.push('at.category = ?');
      params.push(category);
    }

    if (startDate) {
      whereConditions.push('ua.createdAt >= ?');
      params.push(startDate);
    }

    if (endDate) {
      whereConditions.push('ua.createdAt <= ?');
      params.push(endDate);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get activities with user information and activity type details
    const activities = await query(
      `SELECT 
         ua.*,
         u.firstName,
         u.lastName,
         u.email,
         at.category as activityCategory,
         at.description as activityTypeDescription
       FROM user_activities ua
       LEFT JOIN users u ON ua.userId = u.id
       LEFT JOIN activity_types at ON ua.activityType = at.type
       ${whereClause}
       ORDER BY ua.createdAt DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) as total FROM user_activities ua
       LEFT JOIN activity_types at ON ua.activityType = at.type
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Parse metadata JSON
    const formattedActivities = activities.map(activity => ({
      ...activity,
      metadata: activity.metadata ? JSON.parse(activity.metadata) : null
    }));

    res.json({
      success: true,
      data: {
        activities: formattedActivities,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activities'
    });
  }
});

// Get activities for a specific user (admin only)
router.get('/user/:userId', authenticateToken, requireAdmin, [
  validatorQuery('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500'),
  validatorQuery('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  validatorQuery('activityType').optional().isString().withMessage('Activity type must be a string')
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

    const { userId } = req.params;
    const { limit = 100, offset = 0, activityType } = req.query;

    // Verify user exists
    const user = await query('SELECT id, firstName, lastName, email FROM users WHERE id = ?', [userId]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user activities
    const activities = await ActivityLogger.getUserActivities(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      activityType
    });

    // Get activity summary
    const summary = await ActivityLogger.getUserActivitySummary(userId);

    // Get total count
    const countResult = await query(
      'SELECT COUNT(*) as total FROM user_activities WHERE userId = ?',
      [userId]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        user: user[0],
        activities,
        summary,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: offset + parseInt(limit) < total
        }
      }
    });

  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user activities'
    });
  }
});

// Get activity types and categories (admin only)
router.get('/types', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const activityTypes = await query(
      'SELECT * FROM activity_types WHERE isActive = 1 ORDER BY category, type'
    );

    // Group by category
    const groupedTypes = activityTypes.reduce((acc, type) => {
      if (!acc[type.category]) {
        acc[type.category] = [];
      }
      acc[type.category].push(type);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        activityTypes: groupedTypes,
        allTypes: activityTypes
      }
    });

  } catch (error) {
    console.error('Get activity types error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity types'
    });
  }
});

// Get activity analytics (admin only)
router.get('/analytics', authenticateToken, requireAdmin, [
  validatorQuery('period').optional().isIn(['day', 'week', 'month', 'year']).withMessage('Period must be day, week, month, or year'),
  validatorQuery('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  validatorQuery('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date')
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

    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = '';
    const params = [];

    if (startDate && endDate) {
      dateFilter = 'WHERE ua.createdAt BETWEEN ? AND ?';
      params.push(startDate, endDate);
    } else {
      // Default to last month if no dates provided
      const defaultEndDate = new Date().toISOString();
      const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      dateFilter = 'WHERE ua.createdAt BETWEEN ? AND ?';
      params.push(defaultStartDate, defaultEndDate);
    }

    // Get activity counts by type
    const activityCounts = await query(
      `SELECT 
         ua.activityType,
         at.category,
         at.description,
         COUNT(*) as count
       FROM user_activities ua
       LEFT JOIN activity_types at ON ua.activityType = at.type
       ${dateFilter}
       GROUP BY ua.activityType, at.category, at.description
       ORDER BY count DESC`,
      params
    );

    // Get user activity counts
    const userActivityCounts = await query(
      `SELECT 
         ua.userId,
         u.firstName,
         u.lastName,
         u.email,
         COUNT(*) as activityCount
       FROM user_activities ua
       LEFT JOIN users u ON ua.userId = u.id
       ${dateFilter}
       GROUP BY ua.userId, u.firstName, u.lastName, u.email
       ORDER BY activityCount DESC
       LIMIT 20`,
      params
    );

    // Get daily activity trend
    const dailyTrend = await query(
      `SELECT 
         DATE(ua.createdAt) as date,
         COUNT(*) as count
       FROM user_activities ua
       ${dateFilter}
       GROUP BY DATE(ua.createdAt)
       ORDER BY date DESC
       LIMIT 30`,
      params
    );

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: params[0],
          end: params[1]
        },
        activityCounts,
        userActivityCounts,
        dailyTrend
      }
    });

  } catch (error) {
    console.error('Get activity analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity analytics'
    });
  }
});

module.exports = router;
