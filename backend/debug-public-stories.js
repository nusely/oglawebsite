const { query } = require('./config/database');

async function debugPublicStories() {
  try {
    console.log('🔍 Debugging public stories API...\n');
    
    // Simulate the exact query used by the public stories endpoint
    const whereConditions = ['isActive = 1'];
    const params = [];
    const whereClause = whereConditions.join(' AND ');
    const limit = 10;
    const offset = 0;
    
    console.log('📝 Query being used:');
    console.log(`   SELECT * FROM stories WHERE ${whereClause} ORDER BY isFeatured DESC, createdAt DESC LIMIT ${limit} OFFSET ${offset}`);
    console.log('');
    
    // Get stories using the exact same query as the API
    const stories = await query(
      `SELECT * FROM stories WHERE ${whereClause} ORDER BY isFeatured DESC, createdAt DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );
    
    console.log('📊 Stories returned by public API:');
    console.log('=' .repeat(80));
    stories.forEach((story, index) => {
      const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   - ID: ${story.id} | Slug: ${story.slug}`);
      console.log(`   - Type: ${featured} | Active: ${story.isActive}`);
      console.log(`   - Created: ${story.createdAt}`);
      console.log('');
    });
    
    console.log('📈 Summary:');
    const featuredStories = stories.filter(s => s.isFeatured);
    const regularStories = stories.filter(s => !s.isFeatured);
    
    console.log(`   - Total returned: ${stories.length}`);
    console.log(`   - Featured stories: ${featuredStories.length}`);
    console.log(`   - Regular stories: ${regularStories.length}`);
    
    console.log('\n🎯 What customer should see:');
    console.log(`   - Featured section: ${featuredStories.length} story`);
    console.log(`   - Regular grid: ${regularStories.length} stories`);
    console.log(`   - Total visible: ${stories.length} stories`);
    
    if (featuredStories.length > 0) {
      console.log(`\n⭐ Featured story: "${featuredStories[0].title}"`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging stories:', error);
  }
  
  process.exit(0);
}

debugPublicStories();
