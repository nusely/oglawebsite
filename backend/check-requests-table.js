const { query } = require('./config/database');

async function checkRequestsTable() {
  try {
    console.log('🔍 Checking requests table structure...\n');
    
    const tableInfo = await query('PRAGMA table_info(requests)');
    console.log('Current table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    console.log('\n✅ Table structure check completed!');
    
  } catch (error) {
    console.error('❌ Error checking table:', error);
  }
  
  process.exit(0);
}

checkRequestsTable();


