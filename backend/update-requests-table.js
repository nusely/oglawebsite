const { query } = require('./config/database');

async function updateRequestsTable() {
  try {
    console.log('🔧 Updating requests table schema...\n');
    
    // Check current table structure
    const tableInfo = await query('PRAGMA table_info(requests)');
    console.log('Current table structure:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    // Check if new columns exist
    const columnNames = tableInfo.map(col => col.name);
    const columnsToAdd = [];
    
    if (!columnNames.includes('customerData')) {
      columnsToAdd.push('customerData TEXT');
    }
    
    if (!columnNames.includes('pdfMetadata')) {
      columnsToAdd.push('pdfMetadata TEXT');
    }
    
    if (!columnNames.includes('status')) {
      columnsToAdd.push('status VARCHAR(20) DEFAULT "pending"');
    }
    
    if (!columnNames.includes('createdAt')) {
      columnsToAdd.push('createdAt DATETIME DEFAULT CURRENT_TIMESTAMP');
    }
    
    if (!columnNames.includes('updatedAt')) {
      columnsToAdd.push('updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP');
    }
    
    // Add missing columns
    if (columnsToAdd.length > 0) {
      console.log('\n📝 Adding missing columns:');
      for (const column of columnsToAdd) {
        console.log(`  + ${column}`);
        await query(`ALTER TABLE requests ADD COLUMN ${column}`);
      }
      console.log('✅ Successfully added columns');
    } else {
      console.log('\n✅ All required columns already exist');
    }
    
    // Check if we need to populate default values for existing rows
    const existingRows = await query('SELECT COUNT(*) as count FROM requests');
    if (existingRows[0].count > 0) {
      console.log('\n🔄 Updating existing rows with default values...');
      
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
      
      console.log('✅ Updated existing rows with default values');
    }
    
    // Show final table structure
    console.log('\n📋 Final table structure:');
    const finalTableInfo = await query('PRAGMA table_info(requests)');
    finalTableInfo.forEach(column => {
      console.log(`  - ${column.name}: ${column.type} (nullable: ${column.notnull === 0})`);
    });
    
    console.log('\n🎉 Requests table update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating requests table:', error);
    throw error;
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  updateRequestsTable();
}

module.exports = { updateRequestsTable };


