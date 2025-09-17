const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// --- Load environment variables dynamically ---
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
const envPath = path.resolve(__dirname, envFile);

if (fs.existsSync(envPath)) {
  console.log(`⚙️  Loading environment from ${envFile}`);
  require('dotenv').config({ path: envPath });
} else {
  console.warn(`⚠️  ${envFile} not found, relying on system environment variables`);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Trust proxy for rate limiting (important on Azure App Service)
app.set('trust proxy', 1);

// --- Defaults for safety ---
process.env.JWT_SECRET = process.env.JWT_SECRET || 'ogla_super_secret_jwt_key_2024';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.BCRYPT_ROUNDS = process.env.BCRYPT_ROUNDS || '12';

// --- Email configuration defaults (for local testing) ---
process.env.EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || '587';
process.env.EMAIL_USER = process.env.EMAIL_USER || 'oglatrade@gmail.com';
process.env.EMAIL_PASS = process.env.EMAIL_PASS || 'example-password';
process.env.EMAIL_FROM = process.env.EMAIL_FROM || 'Ogla Shea Butter <oglatrade@gmail.com>';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// --- Cloudinary defaults (local testing only) ---
process.env.CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
process.env.CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
process.env.CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// --- Import routes ---
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
const dashboardRoutes = require('./routes/dashboard');
const logPurgeRoutes = require('./routes/logPurge');

// --- Serve React frontend in production ---
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

// --- Security middleware ---
app.use(helmet());

// --- Rate limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.path.startsWith('/api/');
  }
});
app.use(limiter);

// --- CORS ---
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

// --- Body parsing ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Logging ---
app.use(morgan('combined'));

// --- Static uploads ---
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}, express.static('uploads'));

// --- Health check ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Ogla Backend API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// --- API routes ---
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
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/log-purge', logPurgeRoutes);

// --- 404 handler ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// --- Global error handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// --- Start server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);

  // Initialize DB after server starts
  setTimeout(async () => {
    try {
      const { initializeDatabase } = require('./config/azure-database');
      await initializeDatabase();
      console.log('✅ Azure SQL Database initialized');

      const { scheduleLogPurge } = require('./utils/logPurge');
      scheduleLogPurge();
      console.log('🧹 Scheduled log purge initialized (daily at 2 AM)');
    } catch (error) {
      console.error('❌ Failed to initialize database:', error.message);
    }
  }, 1000);
});

module.exports = app;
