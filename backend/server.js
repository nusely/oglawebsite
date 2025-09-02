const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (fixes X-Forwarded-For warning)
app.set('trust proxy', 1);

// Set default environment variables if not provided
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ogla_super_secret_jwt_key_2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12';

// Email configuration
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '587';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'oglatrade@gmail.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'tdaa xllq ceyc gwdv';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'Ogla Shea Butter <oglatrade@gmail.com>';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Cloudinary configuration  
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dpznya3mz';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '189694751625559';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'oVTmebdHRP7JAebk6pB-MOuKbBo';

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const storyRoutes = require('./routes/stories');
const requestRoutes = require('./routes/requests');
const userRoutes = require('./routes/users');
const brandRoutes = require('./routes/brands');
const categoryRoutes = require('./routes/categories');
const userActivityRoutes = require('./routes/userActivities');
const reviewRoutes = require('./routes/reviews');
const { router: activitiesRouter } = require('./routes/activities');
const brandFeaturedProductsRoutes = require('./routes/brandFeaturedProducts');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for admin operations in development
    return process.env.NODE_ENV === 'development' && req.path.startsWith('/api/');
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Ogla Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/user-activities', userActivityRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/activities', activitiesRouter);
app.use('/api/brand-featured-products', brandFeaturedProductsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Ogla Backend API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
