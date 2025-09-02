const { query } = require('./config/database');

async function debugSimpleQuery() {
  try {
    console.log('🔍 Testing simple queries...\n');
    
    // Test 1: Get all active stories without ordering
    console.log('Test 1: All active stories (no ordering)');
    const allActive = await query('SELECT id, title, isFeatured, isActive, createdAt FROM stories WHERE isActive = 1');
    console.log(`   - Count: ${allActive.length}`);
    allActive.forEach(s => console.log(`   - ${s.id}: ${s.title} (Featured: ${s.isFeatured})`));
    
    console.log('\n');
    
    // Test 2: Get all active stories with ORDER BY isFeatured DESC
    console.log('Test 2: All active stories (ORDER BY isFeatured DESC)');
    const orderedByFeatured = await query('SELECT id, title, isFeatured, isActive, createdAt FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC');
    console.log(`   - Count: ${orderedByFeatured.length}`);
    orderedByFeatured.forEach(s => console.log(`   - ${s.id}: ${s.title} (Featured: ${s.isFeatured})`));
    
    console.log('\n');
    
    // Test 3: Get all active stories with full ORDER BY clause
    console.log('Test 3: All active stories (ORDER BY isFeatured DESC, createdAt DESC)');
    const fullOrder = await query('SELECT id, title, isFeatured, isActive, createdAt FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC, createdAt DESC');
    console.log(`   - Count: ${fullOrder.length}`);
    fullOrder.forEach(s => console.log(`   - ${s.id}: ${s.title} (Featured: ${s.isFeatured})`));
    
    console.log('\n');
    
    // Test 4: Same query with LIMIT
    console.log('Test 4: With LIMIT 10');
    const withLimit = await query('SELECT id, title, isFeatured, isActive, createdAt FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC, createdAt DESC LIMIT 10');
    console.log(`   - Count: ${withLimit.length}`);
    withLimit.forEach(s => console.log(`   - ${s.id}: ${s.title} (Featured: ${s.isFeatured})`));
    
    console.log('\n');
    
    // Test 5: Check the featured story specifically
    console.log('Test 5: Check featured story specifically');
    const featuredStory = await query('SELECT id, title, isFeatured, isActive FROM stories WHERE id = 12');
    if (featuredStory.length > 0) {
      const story = featuredStory[0];
      console.log(`   - Found: ${story.title}`);
      console.log(`   - Featured: ${story.isFeatured} | Active: ${story.isActive}`);
    } else {
      console.log('   - Featured story not found!');
    }
    
  } catch (error) {
    console.error('❌ Error in debug:', error);
  }
  
  process.exit(0);
}

debugSimpleQuery();
