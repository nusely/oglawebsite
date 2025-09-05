const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { query } = require('../config/database');
const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get current month and last month dates
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Total users count
    const totalUsersResult = await query('SELECT COUNT(*) as count FROM users WHERE isActive = 1');
    const totalUsers = totalUsersResult[0].count;

    // Users this month
    const usersThisMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE isActive = 1 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(currentMonth).padStart(2, '0'), String(currentYear)]);
    const usersThisMonth = usersThisMonthResult[0].count;

    // Users last month
    const usersLastMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE isActive = 1 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(lastMonth).padStart(2, '0'), String(lastMonthYear)]);
    const usersLastMonth = usersLastMonthResult[0].count;

    // Calculate user growth percentage
    const userGrowthPercent = usersLastMonth > 0 ? 
      Math.round(((usersThisMonth - usersLastMonth) / usersLastMonth) * 100) : 0;

    // Total products count
    const totalProductsResult = await query('SELECT COUNT(*) as count FROM products WHERE isActive = 1');
    const totalProducts = totalProductsResult[0].count;

    // Products this month
    const productsThisMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE isActive = 1 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(currentMonth).padStart(2, '0'), String(currentYear)]);
    const productsThisMonth = productsThisMonthResult[0].count;

    // Products last month
    const productsLastMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE isActive = 1 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(lastMonth).padStart(2, '0'), String(lastMonthYear)]);
    const productsLastMonth = productsLastMonthResult[0].count;

    // Calculate product growth percentage
    const productGrowthPercent = productsLastMonth > 0 ? 
      Math.round(((productsThisMonth - productsLastMonth) / productsLastMonth) * 100) : 0;

    // Total requests count
    const totalRequestsResult = await query('SELECT COUNT(*) as count FROM requests');
    const totalRequests = totalRequestsResult[0].count;

    // Requests this month
    const requestsThisMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM requests 
      WHERE strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(currentMonth).padStart(2, '0'), String(currentYear)]);
    const requestsThisMonth = requestsThisMonthResult[0].count;

    // Requests last month
    const requestsLastMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM requests 
      WHERE strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(lastMonth).padStart(2, '0'), String(lastMonthYear)]);
    const requestsLastMonth = requestsLastMonthResult[0].count;

    // Calculate request growth percentage
    const requestGrowthPercent = requestsLastMonth > 0 ? 
      Math.round(((requestsThisMonth - requestsLastMonth) / requestsLastMonth) * 100) : 0;

    // Total revenue (sum of request amounts)
    const totalRevenueResult = await query('SELECT SUM(totalAmount) as total FROM requests WHERE status = "approved"');
    const totalRevenue = totalRevenueResult[0].total || 0;

    // Revenue this month
    const revenueThisMonthResult = await query(`
      SELECT SUM(totalAmount) as total 
      FROM requests 
      WHERE status = "approved" 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(currentMonth).padStart(2, '0'), String(currentYear)]);
    const revenueThisMonth = revenueThisMonthResult[0].total || 0;

    // Revenue last month
    const revenueLastMonthResult = await query(`
      SELECT SUM(totalAmount) as total 
      FROM requests 
      WHERE status = "approved" 
      AND strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(lastMonth).padStart(2, '0'), String(lastMonthYear)]);
    const revenueLastMonth = revenueLastMonthResult[0].total || 0;

    // Calculate revenue growth percentage
    const revenueGrowthPercent = revenueLastMonth > 0 ? 
      Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) : 0;

    // Total reviews count
    const totalReviewsResult = await query('SELECT COUNT(*) as count FROM reviews');
    const totalReviews = totalReviewsResult[0].count;

    // Reviews this month
    const reviewsThisMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM reviews 
      WHERE strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(currentMonth).padStart(2, '0'), String(currentYear)]);
    const reviewsThisMonth = reviewsThisMonthResult[0].count;

    // Reviews last month
    const reviewsLastMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM reviews 
      WHERE strftime('%m', createdAt) = ? 
      AND strftime('%Y', createdAt) = ?
    `, [String(lastMonth).padStart(2, '0'), String(lastMonthYear)]);
    const reviewsLastMonth = reviewsLastMonthResult[0].count;

    // Calculate review growth percentage
    const reviewGrowthPercent = reviewsLastMonth > 0 ? 
      Math.round(((reviewsThisMonth - reviewsLastMonth) / reviewsLastMonth) * 100) : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          thisMonth: usersThisMonth,
          lastMonth: usersLastMonth,
          growthPercent: userGrowthPercent
        },
        products: {
          total: totalProducts,
          thisMonth: productsThisMonth,
          lastMonth: productsLastMonth,
          growthPercent: productGrowthPercent
        },
        requests: {
          total: totalRequests,
          thisMonth: requestsThisMonth,
          lastMonth: requestsLastMonth,
          growthPercent: requestGrowthPercent
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
          lastMonth: revenueLastMonth,
          growthPercent: revenueGrowthPercent
        },
        reviews: {
          total: totalReviews,
          thisMonth: reviewsThisMonth,
          lastMonth: reviewsLastMonth,
          growthPercent: reviewGrowthPercent
        }
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard statistics' 
    });
  }
});

// Get recent activities for dashboard
router.get('/recent-activities', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const activities = await query(`
      SELECT 
        a.*,
        u.firstName,
        u.lastName,
        u.email
      FROM activities a
      LEFT JOIN users u ON a.userId = u.id
      ORDER BY a.createdAt DESC
      LIMIT ?
    `, [parseInt(limit)]);

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
      success: true,
      data: formattedActivities
    });

  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch recent activities' 
    });
  }
});

// Get featured products count for dashboard
router.get('/featured-products-count', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const countResult = await query('SELECT COUNT(*) as count FROM brand_featured_products WHERE isActive = 1');
    const featuredProductsCount = countResult[0].count;

    res.json({
      success: true,
      data: {
        count: featuredProductsCount
      }
    });

  } catch (error) {
    console.error('Featured products count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch featured products count' 
    });
  }
});

// Get pending requests count for dashboard
router.get('/pending-requests-count', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const countResult = await query('SELECT COUNT(*) as count FROM requests WHERE status = "pending"');
    const pendingRequestsCount = countResult[0].count;

    res.json({
      success: true,
      data: {
        count: pendingRequestsCount
      }
    });

  } catch (error) {
    console.error('Pending requests count error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending requests count' 
    });
  }
});

module.exports = router;

