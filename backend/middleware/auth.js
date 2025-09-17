const jwt = require('jsonwebtoken');
const { query } = require('../config/azure-database');

// Verify JWT token middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const users = await query(
      'SELECT id, firstName, lastName, email, role, isActive FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Check if user is super admin
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Super admin access required'
    });
  }

  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('OptionalAuth debug:', {
      hasAuthHeader: !!authHeader,
      token: token ? `${token.substring(0, 10)}...` : null,
      path: req.path
    });

    if (!token) {
      console.log('No token provided, proceeding without auth');
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', { userId: decoded.userId });
    
    const users = await query(
      'SELECT id, firstName, lastName, email, role, isActive FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length > 0 && users[0].isActive) {
      req.user = users[0];
      console.log('User authenticated:', { id: req.user.id, email: req.user.email });
    } else {
      console.log('User not found or inactive');
    }

    next();
  } catch (error) {
    console.log('OptionalAuth error (non-fatal):', error.message);
    // Don't fail for invalid tokens in optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  optionalAuth
};
