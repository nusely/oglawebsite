/**
 * Auto-purge utility for cleaning up old logs
 * Removes user_activities logs older than 30 days
 */

const { query } = require('../config/azure-database');

/**
 * Purge logs older than specified days
 * @param {number} daysOld - Number of days (default: 30)
 * @returns {Promise<Object>} - Result of purge operation
 */
const purgeOldLogs = async (daysOld = 30) => {
  try {
    console.log(`🧹 Starting log purge for records older than ${daysOld} days...`);
    
    // First, count how many records will be deleted
    const countResult = await query(
      `SELECT COUNT(*) as count 
       FROM user_activities 
       WHERE createdAt < DATEADD(DAY, -?, GETUTCDATE())`,
      [daysOld]
    );
    
    const recordsToDelete = countResult[0]?.count || 0;
    
    if (recordsToDelete === 0) {
      console.log('✅ No old logs found to purge');
      return {
        success: true,
        message: 'No old logs found to purge',
        deletedCount: 0
      };
    }
    
    console.log(`📊 Found ${recordsToDelete} records to delete`);
    
    // Delete old records
    const deleteResult = await query(
      `DELETE FROM user_activities 
       WHERE createdAt < DATEADD(DAY, -?, GETUTCDATE())`,
      [daysOld]
    );
    
    console.log(`✅ Successfully purged ${recordsToDelete} old log records`);
    
    return {
      success: true,
      message: `Successfully purged ${recordsToDelete} old log records`,
      deletedCount: recordsToDelete
    };
    
  } catch (error) {
    console.error('❌ Error during log purge:', error);
    return {
      success: false,
      message: 'Failed to purge old logs',
      error: error.message,
      deletedCount: 0
    };
  }
};

/**
 * Schedule daily log purge (runs at 2 AM daily)
 */
const scheduleLogPurge = () => {
  const schedulePurge = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(2, 0, 0, 0); // 2 AM
    
    const timeUntilPurge = tomorrow.getTime() - now.getTime();
    
    console.log(`⏰ Next log purge scheduled for: ${tomorrow.toLocaleString()}`);
    
    setTimeout(async () => {
      await purgeOldLogs();
      // Schedule next purge (24 hours later)
      schedulePurge();
    }, timeUntilPurge);
  };
  
  // Start the scheduling
  schedulePurge();
};

/**
 * Manual purge endpoint for admin use
 */
const manualPurge = async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;
    
    if (daysOld < 1 || daysOld > 365) {
      return res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365'
      });
    }
    
    const result = await purgeOldLogs(daysOld);
    
    res.json({
      success: result.success,
      message: result.message,
      deletedCount: result.deletedCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Manual purge error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purge logs',
      error: error.message
    });
  }
};

module.exports = {
  purgeOldLogs,
  scheduleLogPurge,
  manualPurge
};
