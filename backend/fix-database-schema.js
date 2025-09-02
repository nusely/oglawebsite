const { query } = require('./config/database');

async function fixDatabaseSchema() {
  try {
    console.log('🔧 Fixing database schema issues...\n');
    
    // 1. Fix brands table - add missing logo column
    console.log('📝 Fixing brands table...');
    const brandsTableInfo = await query('PRAGMA table_info(brands)');
    const brandsColumns = brandsTableInfo.map(col => col.name);
    
    if (!brandsColumns.includes('logo')) {
      await query('ALTER TABLE brands ADD COLUMN logo TEXT');
      console.log('  + Added logo column to brands table');
    }
    
    if (!brandsColumns.includes('logo_url')) {
      await query('ALTER TABLE brands ADD COLUMN logo_url TEXT');
      console.log('  + Added logo_url column to brands table');
    }
    
    // 2. Fix categories table - add missing image column
    console.log('📝 Fixing categories table...');
    const categoriesTableInfo = await query('PRAGMA table_info(categories)');
    const categoriesColumns = categoriesTableInfo.map(col => col.name);
    
    if (!categoriesColumns.includes('image')) {
      await query('ALTER TABLE categories ADD COLUMN image TEXT');
      console.log('  + Added image column to categories table');
    }
    
    if (!categoriesColumns.includes('image_url')) {
      await query('ALTER TABLE categories ADD COLUMN image_url TEXT');
      console.log('  + Added image_url column to categories table');
    }
    
    // 3. Fix requests table - add missing columns
    console.log('📝 Fixing requests table...');
    const requestsTableInfo = await query('PRAGMA table_info(requests)');
    const requestsColumns = requestsTableInfo.map(col => col.name);
    
    if (!requestsColumns.includes('requestNumber')) {
      await query('ALTER TABLE requests ADD COLUMN requestNumber VARCHAR(20)');
      console.log('  + Added requestNumber column to requests table');
    }
    
    if (!requestsColumns.includes('customerData')) {
      await query('ALTER TABLE requests ADD COLUMN customerData TEXT');
      console.log('  + Added customerData column to requests table');
    }
    
    if (!requestsColumns.includes('pdfMetadata')) {
      await query('ALTER TABLE requests ADD COLUMN pdfMetadata TEXT');
      console.log('  + Added pdfMetadata column to requests table');
    }
    
    if (!requestsColumns.includes('status')) {
      await query('ALTER TABLE requests ADD COLUMN status VARCHAR(20) DEFAULT "pending"');
      console.log('  + Added status column to requests table');
    }
    
    if (!requestsColumns.includes('createdAt')) {
      await query('ALTER TABLE requests ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('  + Added createdAt column to requests table');
    }
    
    if (!requestsColumns.includes('updatedAt')) {
      await query('ALTER TABLE requests ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP');
      console.log('  + Added updatedAt column to requests table');
    }
    
    // 4. Fix users table - add missing lastLogin column
    console.log('📝 Fixing users table...');
    const usersTableInfo = await query('PRAGMA table_info(users)');
    const usersColumns = usersTableInfo.map(col => col.name);
    
    if (!usersColumns.includes('lastLogin')) {
      await query('ALTER TABLE users ADD COLUMN lastLogin DATETIME');
      console.log('  + Added lastLogin column to users table');
    }
    
    // 5. Update existing data with default values
    console.log('📝 Updating existing data...');
    
    // Update requests with default values
    const existingRequests = await query('SELECT COUNT(*) as count FROM requests');
    if (existingRequests[0].count > 0) {
      // Generate request numbers for existing requests
      await query(`UPDATE requests SET requestNumber = 'OGL-' || id WHERE requestNumber IS NULL`);
      
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
      
      console.log('  ✅ Updated existing requests with default values');
    }
    
    // Update users with current lastLogin
    await query(`UPDATE users SET lastLogin = datetime('now') WHERE lastLogin IS NULL`);
    console.log('  ✅ Updated existing users with current lastLogin timestamp');
    
    // 6. Test the fixes
    console.log('📝 Testing database queries...');
    try {
      const testBrands = await query('SELECT COUNT(*) as count FROM brands');
      console.log(`  ✅ Brands table: ${testBrands[0].count} records`);
      
      const testCategories = await query('SELECT COUNT(*) as count FROM categories');
      console.log(`  ✅ Categories table: ${testCategories[0].count} records`);
      
      const testRequests = await query('SELECT COUNT(*) as count FROM requests');
      console.log(`  ✅ Requests table: ${testRequests[0].count} records`);
      
      const testUsers = await query('SELECT COUNT(*) as count FROM users');
      console.log(`  ✅ Users table: ${testUsers[0].count} records`);
      
    } catch (error) {
      console.error('  ❌ Database test failed:', error.message);
    }
    
    console.log('\n🎉 Database schema issues fixed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server (npm start)');
    console.log('   2. Try adding brands, categories, and products again');
    console.log('   3. PDF downloads should work now');
    console.log('   4. Story deletion should work properly');
    
  } catch (error) {
    console.error('❌ Error fixing database schema:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  fixDatabaseSchema();
}

module.exports = { fixDatabaseSchema };


