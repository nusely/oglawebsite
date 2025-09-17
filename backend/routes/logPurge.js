/**
 * Log Purge Routes
 * Admin-only endpoints for managing log retention
 */

const express = require('express');
const { authenticateToken, requireSuperAdmin } = require('../middleware/auth');
const { manualPurge } = require('../utils/logPurge');

const router = express.Router();

// All routes require super admin authentication
router.use(authenticateToken, requireSuperAdmin);

/**
 * POST /log-purge/manual
 * Manually trigger log purge for records older than specified days
 * Body: { daysOld: number } (default: 30)
 */
router.post('/manual', manualPurge);

/**
 * GET /log-purge/status
 * Get current log statistics
 */
router.get('/status', async (req, res) => {
  try {
    const { query } = require('../config/azure-database');
    
    // Get total count
    const totalResult = await query('SELECT COUNT(*) as total FROM user_activities');
    
    // Get count by age ranges
    const ageRanges = [
      { label: 'Last 7 days', days: 7 },
      { label: 'Last 30 days', days: 30 },
      { label: 'Last 90 days', days: 90 },
      { label: 'Older than 90 days', days: 90 }
    ];
    
    const stats = await Promise.all(
      ageRanges.map(async (range) => {
        if (range.label === 'Older than 90 days') {
          const result = await query(
            `SELECT COUNT(*) as count 
             FROM user_activities 
             WHERE createdAt < DATEADD(DAY, -90, GETUTCDATE())`
          );
          return {
            ...range,
            count: result[0]?.count || 0
          };
        } else {
          const result = await query(
            `SELECT COUNT(*) as count 
             FROM user_activities 
             WHERE createdAt >= DATEADD(DAY, -?, GETUTCDATE())`,
            [range.days]
          );
          return {
            ...range,
            count: result[0]?.count || 0
          };
        }
      })
    );
    
    // Get oldest and newest records
    const oldestResult = await query(
      'SELECT TOP 1 createdAt FROM user_activities ORDER BY createdAt ASC'
    );
    
    const newestResult = await query(
      'SELECT TOP 1 createdAt FROM user_activities ORDER BY createdAt DESC'
    );
    
    res.json({
      success: true,
      data: {
        total: totalResult[0]?.total || 0,
        ageRanges: stats,
        oldestRecord: oldestResult[0]?.createdAt || null,
        newestRecord: newestResult[0]?.createdAt || null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Log purge status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get log purge status',
      error: error.message
    });
  }
});

module.exports = router;
