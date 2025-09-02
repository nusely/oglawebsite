const { pool, query } = require('./config/database');

async function debugProducts() {
  try {
    console.log('🔍 Testing products query...');
    
    // Test basic products query
    const products = await query('SELECT * FROM products WHERE isActive = 1');
    console.log('✅ Products query result:', products.length, 'products found');
    
    // Test products with joins
    const productsWithJoins = await query(`
      SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
      FROM products p 
      LEFT JOIN brands b ON p.brandId = b.id 
      LEFT JOIN categories c ON p.categoryId = c.id 
      WHERE p.isActive = 1
    `);
    console.log('✅ Products with joins query result:', productsWithJoins.length, 'products found');
    
    // Test brands query
    const brands = await query('SELECT * FROM brands WHERE isActive = 1');
    console.log('✅ Brands query result:', brands.length, 'brands found');
    
    // Test categories query
    const categories = await query('SELECT * FROM categories WHERE isActive = 1');
    console.log('✅ Categories query result:', categories.length, 'categories found');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
}

debugProducts();
