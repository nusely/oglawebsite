const { query } = require('../config/azure-database');

/**
 * Activity Logger Utility
 * Provides functions to log user activities for tracking and analytics
 */

class ActivityLogger {
  /**
   * Log a user activity
   * @param {Object} options - Activity logging options
   * @param {number} options.userId - User ID (null for anonymous users)
   * @param {string} options.activityType - Type of activity (e.g., 'user_login', 'request_submitted')
   * @param {string} options.activitySubtype - Subtype for more specific categorization
   * @param {string} options.description - Human-readable description of the activity
   * @param {Object} options.metadata - Additional data about the activity
   * @param {string} options.ipAddress - User's IP address
   * @param {string} options.userAgent - User's browser/device info
   */
  static async logActivity({
    userId = null,
    activityType,
    activitySubtype = null,
    description,
    metadata = null,
    ipAddress = null,
    userAgent = null
  }) {
    try {
      // Validate required fields
      if (!activityType || !description) {
        console.warn('ActivityLogger: Missing required fields', { activityType, description });
        return;
      }

      // Insert activity record
      const result = await query(
        `INSERT INTO user_activities (
          userId, activityType, activitySubtype, description, metadata, 
          ipAddress, userAgent, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, GETUTCDATE())`,
        [
          userId,
          activityType,
          activitySubtype,
          description,
          metadata ? JSON.stringify(metadata) : null,
          ipAddress,
          userAgent
        ]
      );

      console.log(`📝 Activity logged: ${activityType} - ${description} (User: ${userId || 'Anonymous'})`);
      return result;

    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  /**
   * Log authentication activities
   */
  static async logAuthActivity(userId, activityType, metadata = null, req = null) {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');

    await this.logActivity({
      userId,
      activityType,
      description: this.getAuthDescription(activityType),
      metadata,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log request-related activities
   */
  static async logRequestActivity(userId, activityType, requestData = null, req = null) {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');

    await this.logActivity({
      userId,
      activityType,
      description: this.getRequestDescription(activityType),
      metadata: requestData,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log product-related activities
   */
  static async logProductActivity(userId, activityType, productData = null, req = null) {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');

    await this.logActivity({
      userId,
      activityType,
      description: this.getProductDescription(activityType),
      metadata: productData,
      ipAddress,
      userAgent
    });
  }

  /**
   * Log admin activities
   */
  static async logAdminActivity(adminId, activityType, adminData = null, req = null) {
    const ipAddress = req?.ip || req?.connection?.remoteAddress;
    const userAgent = req?.get('User-Agent');

    await this.logActivity({
      userId: adminId,
      activityType,
      description: this.getAdminDescription(activityType),
      metadata: adminData,
      ipAddress,
      userAgent
    });
  }

  /**
   * Get user activity history
   */
  static async getUserActivities(userId, options = {}) {
    try {
      const { limit = 50, offset = 0, activityType = null, startDate = null, endDate = null } = options;
      
      let whereClause = 'WHERE userId = ?';
      const params = [userId];
      
      if (activityType) {
        whereClause += ' AND activityType = ?';
        params.push(activityType);
      }
      
      if (startDate) {
        whereClause += ' AND createdAt >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        whereClause += ' AND createdAt <= ?';
        params.push(endDate);
      }
      
      const activities = await query(
        `SELECT * FROM user_activities 
         ${whereClause}
         ORDER BY createdAt DESC 
         LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );
      
      // Parse metadata JSON
      return activities.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      }));
      
    } catch (error) {
      console.error('Error getting user activities:', error);
      throw error;
    }
  }

  /**
   * Get activity summary for a user
   */
  static async getUserActivitySummary(userId) {
    try {
      const summary = await query(
        `SELECT 
           activityType,
           COUNT(*) as count,
           MIN(createdAt) as firstOccurrence,
           MAX(createdAt) as lastOccurrence
         FROM user_activities 
         WHERE userId = ? 
         GROUP BY activityType 
         ORDER BY count DESC`,
        [userId]
      );
      
      return summary;
      
    } catch (error) {
      console.error('Error getting user activity summary:', error);
      throw error;
    }
  }

  /**
   * Get recent activities across all users (admin only)
   */
  static async getRecentActivities(limit = 100) {
    try {
      const activities = await query(
        `SELECT 
           ua.*,
           u.firstName,
           u.lastName,
           u.email
         FROM user_activities ua
         LEFT JOIN users u ON ua.userId = u.id
         ORDER BY ua.createdAt DESC 
         LIMIT ?`,
        [limit]
      );
      
      // Parse metadata JSON
      return activities.map(activity => ({
        ...activity,
        metadata: activity.metadata ? JSON.parse(activity.metadata) : null
      }));
      
    } catch (error) {
      console.error('Error getting recent activities:', error);
      throw error;
    }
  }

  // Helper methods for descriptions
  static getAuthDescription(activityType) {
    const descriptions = {
      'user_login': 'User logged in successfully',
      'user_logout': 'User logged out',
      'user_register': 'New user registration completed',
      'password_change': 'User changed their password',
      'password_reset': 'User reset their password',
      'email_verification': 'User verified their email address',
      'login_failed': 'Failed login attempt'
    };
    return descriptions[activityType] || 'Authentication activity';
  }

  static getRequestDescription(activityType) {
    const descriptions = {
      'request_started': 'User started request process',
      'request_submitted': 'User submitted request',
      'request_abandoned': 'User abandoned request process',
      'request_viewed': 'User viewed request details',
      'request_updated': 'User updated request',
      'request_cancelled': 'User cancelled request'
    };
    return descriptions[activityType] || 'Request activity';
  }

  static getProductDescription(activityType) {
    const descriptions = {
      'product_viewed': 'User viewed product',
      'product_added_to_request': 'Product added to request basket',
      'product_removed_from_request': 'Product removed from request basket',
      'product_searched': 'User searched for products'
    };
    return descriptions[activityType] || 'Product activity';
  }

  static getAdminDescription(activityType) {
    const descriptions = {
      'admin_login': 'Admin logged in',
      'admin_request_approved': 'Admin approved request',
      'admin_request_rejected': 'Admin rejected request',
      'admin_pdf_downloaded': 'Admin downloaded PDF invoice',
      'admin_user_created': 'Admin created new user',
      'admin_user_updated': 'Admin updated user',
      'admin_user_deleted': 'Admin deleted user'
    };
    return descriptions[activityType] || 'Admin activity';
  }
}

module.exports = ActivityLogger;


