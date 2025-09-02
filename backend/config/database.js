const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, '..', 'data', 'ogla.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('✅ Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    companyName TEXT NOT NULL,
    companyType TEXT NOT NULL,
    companyRole TEXT NOT NULL,
    address TEXT,
    role TEXT DEFAULT 'customer',
    isActive INTEGER DEFAULT 1,
    emailVerified INTEGER DEFAULT 0,
    emailVerificationToken TEXT,
    emailVerificationExpires TEXT,
    resetPasswordToken TEXT,
    resetPasswordExpires TEXT,
    lastLoginAt TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Brands table
  db.run(`CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo TEXT,
    website TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    shortDescription TEXT,
    brandId INTEGER,
    categoryId INTEGER,
    images TEXT,
    specifications TEXT,
    pricing TEXT,
    variants TEXT,
    isFeatured INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brandId) REFERENCES brands (id),
    FOREIGN KEY (categoryId) REFERENCES categories (id)
  )`);

  // Stories table
  db.run(`CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image TEXT,
    author TEXT,
    readTime INTEGER,
    isFeatured INTEGER DEFAULT 0,
    isActive INTEGER DEFAULT 1,
    publishedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Requests table
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    customerName TEXT NOT NULL,
    customerEmail TEXT NOT NULL,
    customerPhone TEXT,
    companyName TEXT,
    items TEXT NOT NULL,
    totalAmount REAL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    pdfPath TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`);

  // Partners table
  db.run(`CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    logo TEXT,
    website TEXT,
    description TEXT,
    isActive INTEGER DEFAULT 1,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  console.log('✅ Database tables initialized');
}

// Helper function to run queries with promises
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    // Check if this is an INSERT, UPDATE, or DELETE query
    const sqlLower = sql.toLowerCase().trim();
    if (sqlLower.startsWith('insert') || sqlLower.startsWith('update') || sqlLower.startsWith('delete')) {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          // For INSERT operations, return an object with lastID
          resolve({
            lastID: this.lastID,
            insertId: this.lastID, // For compatibility
            changes: this.changes
          });
        }
      });
    } else {
      // For SELECT queries, use db.all
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    }
  });
}

// Helper function to run single row queries
function queryOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to run insert/update/delete queries
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        // Use arrow function to preserve 'this' context
        console.log('SQLite run result - this.lastID:', this.lastID, 'this.changes:', this.changes);
        resolve({ 
          id: this.lastID, 
          lastID: this.lastID, 
          changes: this.changes,
          lastInsertRowid: this.lastID 
        });
      }
    });
  });
}

// Export a pool-like interface for compatibility with existing code
const pool = {
  execute: async (sql, params = []) => {
    try {
      const result = await query(sql, params);
      return [result];
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  db,
  pool,
  query,
  queryOne,
  run,
  initializeDatabase
};
