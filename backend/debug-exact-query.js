const { query } = require('./config/database');

async function debugExactQuery() {
  try {
    console.log('🔍 Testing exact public API query...\n');
    
    // Simulate exact parameters from the public API
    const page = 1;
    const limit = 10;
    const featured = undefined;
    const category = undefined;
    
    const offset = (page - 1) * limit;
    const whereConditions = ['isActive = 1'];
    const params = [];

    // Add featured filter (same logic as API)
    if (featured !== undefined) {
      whereConditions.push('isFeatured = ?');
      params.push(featured === 'true');
    }

    // Add category filter (same logic as API)  
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    const whereClause = whereConditions.join(' AND ');
    
    console.log('📝 Exact query parameters:');
    console.log(`   - page: ${page}`);
    console.log(`   - limit: ${limit}`);
    console.log(`   - offset: ${offset}`);
    console.log(`   - whereClause: ${whereClause}`);
    console.log(`   - params: [${params.join(', ')}]`);
    console.log('');
    
    // Test the EXACT same query as the public API
    console.log('🔍 Running exact query...');
    const sqlQuery = `SELECT * FROM stories WHERE ${whereClause} ORDER BY isFeatured DESC, createdAt DESC LIMIT ? OFFSET ?`;
    const finalParams = [...params, parseInt(limit), offset];
    
    console.log(`📝 SQL: ${sqlQuery}`);
    console.log(`📝 Final params: [${finalParams.join(', ')}]`);
    console.log('');
    
    const stories = await query(sqlQuery, finalParams);
    
    console.log('📊 Results:');
    console.log('=' .repeat(80));
    stories.forEach((story, index) => {
      const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   - ID: ${story.id} | Featured: ${story.isFeatured} | Active: ${story.isActive}`);
      console.log(`   - Type: ${featured}`);
      console.log(`   - Created: ${story.createdAt}`);
      console.log('');
    });
    
    console.log('📈 Summary:');
    const featuredStories = stories.filter(s => s.isFeatured);
    const regularStories = stories.filter(s => !s.isFeatured);
    
    console.log(`   - Total returned: ${stories.length}`);
    console.log(`   - Featured stories: ${featuredStories.length}`);
    console.log(`   - Regular stories: ${regularStories.length}`);
    
    if (featuredStories.length > 0) {
      console.log(`\n⭐ Featured story found: "${featuredStories[0].title}"`);
    } else {
      console.log('\n❌ No featured story in results!');
    }
    
    if (stories.length < 7) {
      console.log(`\n⚠️  Only ${stories.length} out of 7 expected active stories returned`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging exact query:', error);
  }
  
  process.exit(0);
}

debugExactQuery();
