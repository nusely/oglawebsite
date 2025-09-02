const { query } = require('./config/database');

async function debugIsActiveValues() {
  try {
    console.log('🔍 Debugging isActive field values...\n');
    
    // Get ALL stories with their exact isActive values
    console.log('📊 ALL Stories with exact isActive values:');
    const allStories = await query('SELECT id, title, isActive, isFeatured, typeof(isActive) as type FROM stories ORDER BY id');
    
    console.log('=' .repeat(100));
    allStories.forEach(story => {
      console.log(`ID ${story.id}: "${story.title}"`);
      console.log(`   - isActive: ${story.isActive} (type: ${story.type})`);
      console.log(`   - isFeatured: ${story.isFeatured}`);
      console.log('');
    });
    
    console.log('📈 Summary by isActive value:');
    const grouped = {};
    allStories.forEach(story => {
      const key = `${story.isActive} (${story.type})`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(story);
    });
    
    Object.keys(grouped).forEach(key => {
      console.log(`   - isActive = ${key}: ${grouped[key].length} stories`);
      grouped[key].forEach(story => {
        console.log(`     * ${story.title}`);
      });
    });
    
    console.log('\n🔍 Testing different isActive queries:');
    
    // Test different ways to query isActive
    const tests = [
      { name: 'isActive = 1', query: 'SELECT COUNT(*) as count FROM stories WHERE isActive = 1' },
      { name: 'isActive = "1"', query: 'SELECT COUNT(*) as count FROM stories WHERE isActive = "1"' },
      { name: 'isActive = true', query: 'SELECT COUNT(*) as count FROM stories WHERE isActive = true' },
      { name: 'isActive = "true"', query: 'SELECT COUNT(*) as count FROM stories WHERE isActive = "true"' },
      { name: 'CAST(isActive AS INTEGER) = 1', query: 'SELECT COUNT(*) as count FROM stories WHERE CAST(isActive AS INTEGER) = 1' }
    ];
    
    for (const test of tests) {
      try {
        const result = await query(test.query);
        console.log(`   - ${test.name}: ${result[0].count} stories`);
      } catch (error) {
        console.log(`   - ${test.name}: ERROR - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging isActive values:', error);
  }
  
  process.exit(0);
}

debugIsActiveValues();
