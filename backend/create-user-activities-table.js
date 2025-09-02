const { query } = require('./config/database');

async function createUserActivitiesTable() {
  try {
    console.log('🔧 Creating user activities tracking system...\n');
    
    // Create user_activities table
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
    
    console.log('✅ Created user_activities table');
    
    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities (userId)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_type ON user_activities (activityType)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_activities_created ON user_activities (createdAt)');
    
    console.log('✅ Created indexes for performance');
    
    // Create activity_types table for categorization
    await query(`
      CREATE TABLE IF NOT EXISTS activity_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type VARCHAR(50) UNIQUE NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        isActive BOOLEAN DEFAULT 1
      )
    `);
    
    console.log('✅ Created activity_types table');
    
    // Insert default activity types
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
      
      // Profile activities
      { type: 'profile_viewed', category: 'profile', description: 'User viewed their profile' },
      { type: 'profile_updated', category: 'profile', description: 'User updated profile information' },
      { type: 'profile_picture_changed', category: 'profile', description: 'User changed profile picture' },
      
      // Admin activities
      { type: 'admin_login', category: 'admin', description: 'Admin logged in' },
      { type: 'admin_request_approved', category: 'admin', description: 'Admin approved request' },
      { type: 'admin_request_rejected', category: 'admin', description: 'Admin rejected request' },
      { type: 'admin_pdf_downloaded', category: 'admin', description: 'Admin downloaded PDF invoice' },
      { type: 'admin_user_created', category: 'admin', description: 'Admin created new user' },
      { type: 'admin_user_updated', category: 'admin', description: 'Admin updated user' },
      { type: 'admin_user_deleted', category: 'admin', description: 'Admin deleted user' },
      
      // System activities
      { type: 'session_started', category: 'system', description: 'User session started' },
      { type: 'session_expired', category: 'system', description: 'User session expired' },
      { type: 'error_occurred', category: 'system', description: 'System error occurred' }
    ];
    
    for (const activityType of defaultActivityTypes) {
      try {
        await query(
          'INSERT OR IGNORE INTO activity_types (type, category, description) VALUES (?, ?, ?)',
          [activityType.type, activityType.category, activityType.description]
        );
      } catch (error) {
        console.log(`  - Skipped ${activityType.type} (already exists)`);
      }
    }
    
    console.log('✅ Inserted default activity types');
    
    // Show table structure
    console.log('\n📋 User Activities table structure:');
    const tableInfo = await query('PRAGMA table_info(user_activities)');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    console.log('\n📋 Activity Types table structure:');
    const typesTableInfo = await query('PRAGMA table_info(activity_types)');
    typesTableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    console.log('\n🎉 User activity tracking system created successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. The system will now automatically track user activities');
    console.log('   3. Use the activity logging functions in your routes');
    
  } catch (error) {
    console.error('❌ Error creating user activities table:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  createUserActivitiesTable();
}

module.exports = { createUserActivitiesTable };


