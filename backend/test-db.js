const { db, query, run } = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic query
    const result = await query('SELECT 1 as test');
    console.log('✅ Basic query test:', result);
    
    // Test tables
    const tables = await query("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('📋 Available tables:', tables.map(t => t.name));
    
    // Test each table
    for (const table of tables) {
      try {
        const count = await query(`SELECT COUNT(*) as count FROM ${table.name}`);
        console.log(`📊 ${table.name}: ${count[0].count} records`);
      } catch (error) {
        console.log(`❌ Error querying ${table.name}:`, error.message);
      }
    }
    
    // Add some sample data if tables are empty
    await addSampleData();
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    db.close();
  }
}

async function addSampleData() {
  try {
    console.log('\n🌱 Adding sample data...');
    
    // Add sample brands
    await run(`
      INSERT OR IGNORE INTO brands (name, slug, description, isActive) 
      VALUES 
        ('Ogla Shea Butter', 'ogla-shea-butter', 'Premium shea butter products', 1),
        ('Ghana Cocoa', 'ghana-cocoa', 'High-quality cocoa products', 1),
        ('African Gold', 'african-gold', 'Premium African products', 1)
    `);
    
    // Add sample categories
    await run(`
      INSERT OR IGNORE INTO categories (name, slug, description, isActive) 
      VALUES 
        ('Shea Butter', 'shea-butter', 'Natural shea butter products', 1),
        ('Cocoa Products', 'cocoa-products', 'Premium cocoa and chocolate', 1),
        ('Natural Oils', 'natural-oils', 'Pure natural oils', 1)
    `);
    
    // Add sample products
    await run(`
      INSERT OR IGNORE INTO products (name, slug, description, shortDescription, brandId, categoryId, images, specifications, pricing, isActive) 
      VALUES 
        ('Pure Shea Butter', 'pure-shea-butter', '100% natural shea butter', 'Premium grade shea butter', 1, 1, '["shea-butter-1.jpg"]', '{"weight": "500g", "origin": "Ghana"}', '{"unitPrice": 25.99, "currency": "USD"}', 1),
        ('Raw Cocoa Beans', 'raw-cocoa-beans', 'Premium raw cocoa beans', 'High-quality cocoa beans', 2, 2, '["cocoa-beans-1.jpg"]', '{"weight": "1kg", "origin": "Ghana"}', '{"unitPrice": 15.99, "currency": "USD"}', 1)
    `);
    
    // Add sample stories
    await run(`
      INSERT OR IGNORE INTO stories (title, slug, excerpt, content, isActive) 
      VALUES 
        ('The Benefits of Shea Butter', 'benefits-of-shea-butter', 'Discover the amazing benefits of natural shea butter', 'Shea butter has been used for centuries in Africa for its amazing skin benefits...', 1),
        ('Ghana''s Cocoa Industry', 'ghana-cocoa-industry', 'Learn about Ghana''s rich cocoa heritage', 'Ghana is one of the world''s leading producers of premium cocoa...', 1)
    `);
    
    console.log('✅ Sample data added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

// Run the test
testDatabase();
