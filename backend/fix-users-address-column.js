const { query } = require('./config/database');

async function addAddressColumn() {
  try {
    console.log('🔧 Adding address column to users table...');
    
    // Check if address column exists
    const tableInfo = await query("PRAGMA table_info(users)");
    const hasAddressColumn = tableInfo.some(col => col.name === 'address');
    
    if (hasAddressColumn) {
      console.log('✅ Address column already exists');
      return;
    }
    
    // Add address column
    await query('ALTER TABLE users ADD COLUMN address TEXT');
    console.log('✅ Address column added successfully');
    
    // Verify the column was added
    const updatedTableInfo = await query("PRAGMA table_info(users)");
    const addressColumn = updatedTableInfo.find(col => col.name === 'address');
    
    if (addressColumn) {
      console.log('✅ Verification: Address column exists with type:', addressColumn.type);
    } else {
      console.log('❌ Error: Address column was not added');
    }
    
  } catch (error) {
    console.error('❌ Error adding address column:', error);
  }
}

addAddressColumn();
