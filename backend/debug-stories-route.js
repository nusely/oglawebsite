const { query } = require('./config/database');

async function debugStoriesRoute() {
  try {
    console.log('🔍 Testing stories route logic...');
    
    // Test the exact query from the route
    const whereConditions = ['isActive = 1'];
    const params = [];
    const whereClause = whereConditions.join(' AND ');
    
    console.log('Where clause:', whereClause);
    console.log('Params:', params);
    
    // Test count query
    const countResult = await query(
      `SELECT COUNT(*) as total FROM stories WHERE ${whereClause}`,
      params
    );
    
    console.log('✅ Count query result:', countResult);
    
    const total = countResult[0].total;
    console.log('Total stories:', total);
    
    // Test stories query
    const stories = await query(
      `SELECT * FROM stories WHERE ${whereClause} ORDER BY featured DESC, date DESC, createdAt DESC LIMIT ? OFFSET ?`,
      [...params, 10, 0]
    );
    
    console.log('✅ Stories query result:', stories.length, 'stories');
    
  } catch (error) {
    console.error('❌ Stories route test error:', error);
  } finally {
    process.exit(0);
  }
}

debugStoriesRoute();
