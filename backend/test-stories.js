const { query } = require('./config/database');

async function testStories() {
  try {
    console.log('🔍 Testing stories query...');
    
    // Test basic stories query
    const stories = await query('SELECT * FROM stories WHERE isActive = 1');
    console.log('✅ Stories query result:', stories.length, 'stories found');
    
    if (stories.length > 0) {
      console.log('✅ First story:', stories[0]);
    }
    
  } catch (error) {
    console.error('❌ Stories test error:', error);
  } finally {
    process.exit(0);
  }
}

testStories();
