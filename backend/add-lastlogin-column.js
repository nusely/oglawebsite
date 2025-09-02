const { query } = require('./config/database');

async function addLastLoginColumn() {
  try {
    console.log('🔧 Adding lastLogin column to users table...\n');
    
    // Check if lastLogin column exists
    const tableInfo = await query('PRAGMA table_info(users)');
    const columnNames = tableInfo.map(col => col.name);
    
    if (columnNames.includes('lastLogin')) {
      console.log('✅ lastLogin column already exists');
      return;
    }
    
    // Add lastLogin column
    await query('ALTER TABLE users ADD COLUMN lastLogin DATETIME');
    console.log('✅ Added lastLogin column to users table');
    
    // Update existing users with current timestamp
    await query('UPDATE users SET lastLogin = datetime("now") WHERE lastLogin IS NULL');
    console.log('✅ Updated existing users with current lastLogin timestamp');
    
    console.log('\n🎉 lastLogin column added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding lastLogin column:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  addLastLoginColumn();
}

module.exports = { addLastLoginColumn };


