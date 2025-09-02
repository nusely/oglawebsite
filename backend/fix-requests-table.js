const { query } = require('./config/database');

async function fixRequestsTable() {
  try {
    console.log('🔧 Fixing requests table structure...\n');
    
    // Check current table structure
    const tableInfo = await query('PRAGMA table_info(requests)');
    console.log('Current table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    // Define required columns
    const requiredColumns = [
      { name: 'customerName', type: 'TEXT NOT NULL DEFAULT "Anonymous Customer"' },
      { name: 'customerEmail', type: 'TEXT NOT NULL DEFAULT "no-email@example.com"' },
      { name: 'companyName', type: 'TEXT' },
      { name: 'items', type: 'TEXT NOT NULL DEFAULT "[]"' },
      { name: 'totalAmount', type: 'DECIMAL(10,2) NOT NULL DEFAULT 0.00' },
      { name: 'notes', type: 'TEXT' },
      { name: 'status', type: 'TEXT DEFAULT "pending"' },
      { name: 'customerData', type: 'TEXT' },
      { name: 'pdfMetadata', type: 'TEXT' },
      { name: 'createdAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
    ];
    
    // Check which columns are missing
    const existingColumns = tableInfo.map(col => col.name);
    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col.name));
    
    if (missingColumns.length > 0) {
      console.log('\n📝 Adding missing columns:');
      for (const column of missingColumns) {
        try {
          console.log(`  + ${column.name}: ${column.type}`);
          await query(`ALTER TABLE requests ADD COLUMN ${column.name} ${column.type}`);
        } catch (error) {
          if (error.code === 'SQLITE_ERROR' && error.message.includes('duplicate column name')) {
            console.log(`    ⚠️  Column ${column.name} already exists`);
          } else {
            throw error;
          }
        }
      }
      console.log('✅ Successfully added missing columns');
    } else {
      console.log('\n✅ All required columns already exist');
    }
    
    // Show final table structure
    console.log('\n📋 Final table structure:');
    const finalTableInfo = await query('PRAGMA table_info(requests)');
    finalTableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    console.log('\n🎉 Requests table fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing table:', error);
  }
  
  process.exit(0);
}

fixRequestsTable();


