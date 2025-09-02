const { query } = require('./config/database');

async function fixAdminDashboard() {
  try {
    console.log('🔧 Fixing admin dashboard database issues...\n');
    
    // 1. Create user_activities table if it doesn't exist
    console.log('📝 Creating user_activities table...');
    await query(`
      CREATE TABLE IF NOT EXISTS user_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        activityType VARCHAR(50) NOT NULL,
        activitySubtype VARCHAR(50),
        description TEXT NOT NULL,
        metadata TEXT,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE SET NULL
      )
    `);
    console.log('✅ user_activities table created');
    
    // 2. Create activity_types table if it doesn't exist
    console.log('📝 Creating activity_types table...');
    await query(`
      CREATE TABLE IF NOT EXISTS activity_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        isActive BOOLEAN DEFAULT 1
      )
    `);
    console.log('✅ activity_types table created');
    
    // 3. Add missing columns to requests table
    console.log('📝 Updating requests table...');
    
    // Check if customerData column exists
    const requestsTableInfo = await query('PRAGMA table_info(requests)');
    const columnNames = requestsTableInfo.map(col => col.name);
    
    if (!columnNames.includes('customerData')) {
      await query('ALTER TABLE requests ADD COLUMN customerData TEXT');
      console.log('  + Added customerData column');
    }
    
    if (!columnNames.includes('pdfMetadata')) {
      await query('ALTER TABLE requests ADD COLUMN pdfMetadata TEXT');
      console.log('  + Added pdfMetadata column');
    }
    
    if (!columnNames.includes('status')) {
      await query('ALTER TABLE requests ADD COLUMN status VARCHAR(20) DEFAULT "pending"');
      console.log('  + Added status column');
    }
    
    if (!columnNames.includes('createdAt')) {
      await query('ALTER TABLE requests ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('  + Added createdAt column');
    }
    
    if (!columnNames.includes('updatedAt')) {
      await query('ALTER TABLE requests ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('  + Added updatedAt column');
    }
    
    console.log('✅ Requests table updated');
    
    // 4. Update existing requests with default values
    console.log('📝 Updating existing requests...');
    const existingRequests = await query('SELECT COUNT(*) as count FROM requests');
    if (existingRequests[0].count > 0) {
      // Update status for rows without status
      await query(`UPDATE requests SET status = 'pending' WHERE status IS NULL`);
      
      // Update pdfMetadata for rows without it
      const defaultPdfMetadata = JSON.stringify({
        generated: false,
        generatedAt: null,
        adminDownloaded: false,
        adminDownloadedAt: null,
        adminDownloadedBy: null
      });
      await query(`UPDATE requests SET pdfMetadata = ? WHERE pdfMetadata IS NULL`, [defaultPdfMetadata]);
      
      // Update timestamps for rows without them
      await query(`UPDATE requests SET createdAt = datetime('now') WHERE createdAt IS NULL`);
      await query(`UPDATE requests SET updatedAt = datetime('now') WHERE updatedAt IS NULL`);
      
      console.log('✅ Updated existing requests with default values');
    }
    
    // 5. Insert default activity types
    console.log('📝 Adding default activity types...');
    const defaultActivityTypes = [
      // Authentication activities
      { type: 'user_login', category: 'authentication', description: 'User logged in successfully' },
      { type: 'user_logout', category: 'authentication', description: 'User logged out' },
      { type: 'user_register', category: 'authentication', description: 'New user registration' },
      { type: 'password_change', category: 'authentication', description: 'User changed password' },
      { type: 'password_reset', category: 'authentication', description: 'User reset password' },
      { type: 'email_verification', category: 'authentication', description: 'User verified email' },
      { type: 'login_failed', category: 'authentication', description: 'Failed login attempt' },
      
      // Request activities
      { type: 'request_started', category: 'requests', description: 'User started request process' },
      { type: 'request_submitted', category: 'requests', description: 'User submitted request' },
      { type: 'request_abandoned', category: 'requests', description: 'User abandoned request process' },
      { type: 'request_viewed', category: 'requests', description: 'User viewed request details' },
      { type: 'request_updated', category: 'requests', description: 'User updated request' },
      { type: 'request_cancelled', category: 'requests', description: 'User cancelled request' },
      
      // Product activities
      { type: 'product_viewed', category: 'products', description: 'User viewed product' },
      { type: 'product_added_to_request', category: 'products', description: 'Product added to request basket' },
      { type: 'product_removed_from_request', category: 'products', description: 'Product removed from request basket' },
      { type: 'product_searched', category: 'products', description: 'User searched for products' },
      
      // Admin activities
      { type: 'admin_login', category: 'admin', description: 'Admin logged in' },
      { type: 'admin_request_approved', category: 'admin', description: 'Admin approved request' },
      { type: 'admin_request_rejected', category: 'admin', description: 'Admin rejected request' },
      { type: 'admin_pdf_downloaded', category: 'admin', description: 'Admin downloaded PDF invoice' },
      { type: 'admin_user_created', category: 'admin', description: 'Admin created new user' },
      { type: 'admin_user_updated', category: 'admin', description: 'Admin updated user' },
      { type: 'admin_user_deleted', category: 'admin', description: 'Admin deleted user' }
    ];
    
    for (const activityType of defaultActivityTypes) {
      try {
        await query(
          'INSERT OR IGNORE INTO activity_types (type, category, description) VALUES (?, ?, ?)',
          [activityType.type, activityType.category, activityType.description]
        );
      } catch (error) {
        // Ignore duplicates
      }
    }
    console.log('✅ Default activity types added');
    
    // 6. Create indexes for performance
    console.log('📝 Creating performance indexes...');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities (userId)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities (activityType)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities (createdAt)');
    console.log('✅ Performance indexes created');
    
    // 7. Test the API endpoints
    console.log('📝 Testing database queries...');
    try {
      const testRequests = await query('SELECT COUNT(*) as count FROM requests');
      console.log(`  ✅ Requests table: ${testRequests[0].count} records`);
      
      const testActivities = await query('SELECT COUNT(*) as count FROM user_activities');
      console.log(`  ✅ User activities table: ${testActivities[0].count} records`);
      
      const testActivityTypes = await query('SELECT COUNT(*) as count FROM activity_types');
      console.log(`  ✅ Activity types table: ${testActivityTypes[0].count} records`);
    } catch (error) {
      console.error('  ❌ Database test failed:', error.message);
    }
    
    console.log('\n🎉 Admin dashboard database issues fixed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server (npm start)');
    console.log('   2. Refresh your admin dashboard');
    console.log('   3. The mock data should be replaced with real database data');
    console.log('   4. User activity tracking is now enabled');
    
  } catch (error) {
    console.error('❌ Error fixing admin dashboard:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  fixAdminDashboard();
}

module.exports = { fixAdminDashboard };


