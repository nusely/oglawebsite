const { db, query, run } = require('./config/database');

async function addReviewsTable() {
  try {
    console.log('🔍 Adding reviews table...');
    
    // Create reviews table
    await run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title TEXT,
        comment TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);
    
    // Add some sample reviews
    await run(`
      INSERT OR IGNORE INTO reviews (productId, userId, rating, title, comment, isActive) 
      VALUES 
        (1, 1, 5, 'Excellent Quality', 'This shea butter is amazing! Very pure and natural.', 1),
        (1, 1, 4, 'Great Product', 'Good quality shea butter, would recommend.', 1),
        (2, 1, 5, 'Premium Cocoa', 'The cocoa beans are of excellent quality.', 1)
    `);
    
    console.log('✅ Reviews table added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding reviews table:', error);
  } finally {
    db.close();
  }
}

// Run the script
addReviewsTable();
