const { query } = require('./config/database');

async function testProductsRoute() {
  try {
    console.log('🔍 Testing products route logic...');
    
    // Test the exact query from the route
    const whereConditions = ['p.isActive = 1'];
    const params = [];
    const whereClause = whereConditions.join(' AND ');
    
    console.log('Where clause:', whereClause);
    console.log('Params:', params);
    
    // Test count query
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE ${whereClause}`,
      params
    );
    
    console.log('✅ Count query result:', countResult);
    
    const total = countResult[0].total;
    console.log('Total products:', total);
    
    // Test products query
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE ${whereClause}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, 12, 0]
    );
    
    console.log('✅ Products query result:', products.length, 'products');
    
    // Test JSON parsing
    const formattedProducts = products.map(product => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      pricing: product.pricing ? JSON.parse(product.pricing) : {},
      variants: product.variants ? JSON.parse(product.variants) : []
    }));
    
    console.log('✅ JSON parsing successful');
    console.log('✅ Final result:', formattedProducts.length, 'formatted products');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    process.exit(0);
  }
}

testProductsRoute();
