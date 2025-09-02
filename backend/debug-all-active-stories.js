const { query } = require('./config/database');

async function debugAllActiveStories() {
  try {
    console.log('🔍 Debugging all active stories...\n');
    
    // Get ALL active stories
    const allActiveStories = await query(
      'SELECT id, title, slug, isFeatured, isActive, createdAt FROM stories WHERE isActive = 1 ORDER BY createdAt DESC'
    );
    
    console.log('📊 ALL Active Stories in Database:');
    console.log('=' .repeat(80));
    allActiveStories.forEach((story, index) => {
      const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   - ID: ${story.id} | Featured: ${story.isFeatured} | Active: ${story.isActive}`);
      console.log(`   - Type: ${featured}`);
      console.log(`   - Created: ${story.createdAt}`);
      console.log('');
    });
    
    console.log('📈 Summary:');
    const featuredCount = allActiveStories.filter(s => s.isFeatured).length;
    const regularCount = allActiveStories.filter(s => !s.isFeatured).length;
    
    console.log(`   - Total active stories: ${allActiveStories.length}`);
    console.log(`   - Featured stories: ${featuredCount}`);
    console.log(`   - Regular stories: ${regularCount}`);
    
    // Now test the exact public API query with different sorting
    console.log('\n🔍 Testing public API query:');
    const publicApiStories = await query(
      'SELECT id, title, isFeatured, isActive FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC, createdAt DESC LIMIT 10 OFFSET 0'
    );
    
    console.log(`   - Public API returns: ${publicApiStories.length} stories`);
    console.log(`   - Featured in results: ${publicApiStories.filter(s => s.isFeatured).length}`);
    
    if (publicApiStories.length !== allActiveStories.length) {
      console.log('\n❌ MISMATCH DETECTED!');
      console.log(`   - Expected: ${allActiveStories.length} stories`);
      console.log(`   - Got: ${publicApiStories.length} stories`);
      
      console.log('\n🔍 Stories missing from public API:');
      const missingStories = allActiveStories.filter(active => 
        !publicApiStories.find(api => api.id === active.id)
      );
      
      missingStories.forEach(story => {
        const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
        console.log(`   - ${story.title} (${featured})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error debugging active stories:', error);
  }
  
  process.exit(0);
}

debugAllActiveStories();
