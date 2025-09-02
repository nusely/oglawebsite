const { query } = require('./config/database');

async function setupDefaultCategory() {
  try {
    console.log('🔧 Setting up default category system...\n');
    
    // Check if default category already exists
    const existingDefault = await query(
      'SELECT * FROM categories WHERE slug = "ogla-category" OR name = "Ogla Category"'
    );
    
    if (existingDefault.length > 0) {
      console.log('✅ Default category already exists:');
      console.log(`   - ID: ${existingDefault[0].id}`);
      console.log(`   - Name: ${existingDefault[0].name}`);
      console.log(`   - Slug: ${existingDefault[0].slug}`);
      console.log(`   - Active: ${existingDefault[0].isActive ? 'Yes' : 'No'}`);
      
      // Ensure it's active
      if (!existingDefault[0].isActive) {
        await query('UPDATE categories SET isActive = 1 WHERE id = ?', [existingDefault[0].id]);
        console.log('   - ✅ Activated default category');
      }
      
      return existingDefault[0].id;
    }
    
    // Create default category
    console.log('📝 Creating default category...');
    const result = await query(
      `INSERT INTO categories (
        name, slug, description, isActive, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        'Ogla Category',
        'ogla-category',
        'Default category for products without a specific category or when original category is deleted',
        1
      ]
    );
    
    const defaultCategoryId = result.insertId || result.lastID;
    console.log('✅ Default category created successfully:');
    console.log(`   - ID: ${defaultCategoryId}`);
    console.log(`   - Name: Ogla Category`);
    console.log(`   - Slug: ogla-category`);
    console.log(`   - Active: Yes`);
    
    return defaultCategoryId;
    
  } catch (error) {
    console.error('❌ Error setting up default category:', error);
    throw error;
  }
}

async function migrateOrphanedProducts(defaultCategoryId) {
  try {
    console.log('\n🔍 Checking for orphaned products...');
    
    // Find products with invalid categoryId (pointing to deleted categories)
    const orphanedProducts = await query(`
      SELECT p.id, p.name, p.categoryId 
      FROM products p 
      LEFT JOIN categories c ON p.categoryId = c.id 
      WHERE p.isActive = 1 AND c.id IS NULL
    `);
    
    if (orphanedProducts.length === 0) {
      console.log('✅ No orphaned products found');
      return;
    }
    
    console.log(`⚠️  Found ${orphanedProducts.length} orphaned products:`);
    orphanedProducts.forEach(product => {
      console.log(`   - ${product.name} (ID: ${product.id}, old categoryId: ${product.categoryId})`);
    });
    
    // Migrate orphaned products to default category
    console.log('\n🔄 Migrating orphaned products to default category...');
    const updateResult = await query(
      'UPDATE products SET categoryId = ? WHERE id IN (' + orphanedProducts.map(() => '?').join(',') + ')',
      [defaultCategoryId, ...orphanedProducts.map(p => p.id)]
    );
    
    console.log(`✅ Successfully migrated ${updateResult.changes} products to default category`);
    
  } catch (error) {
    console.error('❌ Error migrating orphaned products:', error);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Starting default category setup...\n');
    
    // Setup default category
    const defaultCategoryId = await setupDefaultCategory();
    
    // Migrate any orphaned products
    await migrateOrphanedProducts(defaultCategoryId);
    
    console.log('\n🎉 Default category system setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Default category ID: ${defaultCategoryId}`);
    console.log(`   - Default category slug: ogla-category`);
    console.log(`   - All orphaned products now use this category`);
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. The system will now automatically handle category deletion safely');
    console.log('   3. Products without categories will use the default category');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupDefaultCategory, migrateOrphanedProducts };


