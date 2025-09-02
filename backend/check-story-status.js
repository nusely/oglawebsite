const { query } = require('./config/database');

async function checkStoryStatus() {
  try {
    console.log('📊 Checking story status in database...\n');
    
    // Get all stories with their status
    const allStories = await query('SELECT id, title, slug, isActive, isFeatured, createdAt FROM stories ORDER BY createdAt DESC');
    
    console.log('🔍 All Stories in Database:');
    console.log('=' .repeat(80));
    allStories.forEach((story, index) => {
      const status = story.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
      const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
      console.log(`${index + 1}. ${story.title}`);
      console.log(`   - ID: ${story.id} | Slug: ${story.slug}`);
      console.log(`   - Status: ${status} | Type: ${featured}`);
      console.log(`   - Created: ${story.createdAt}`);
      console.log('');
    });
    
    console.log('📈 Summary:');
    const activeCount = allStories.filter(s => s.isActive).length;
    const inactiveCount = allStories.filter(s => !s.isActive).length;
    const featuredCount = allStories.filter(s => s.isFeatured).length;
    
    console.log(`   - Total Stories: ${allStories.length}`);
    console.log(`   - Active Stories: ${activeCount}`);
    console.log(`   - Inactive Stories: ${inactiveCount}`);
    console.log(`   - Featured Stories: ${featuredCount}`);
    
    if (inactiveCount > 0) {
      console.log('\n⚠️  Note: Inactive stories will not show on customer-facing pages');
      console.log('   but will be visible in admin dashboard.');
    }
    
  } catch (error) {
    console.error('❌ Error checking story status:', error);
  }
  
  process.exit(0);
}

checkStoryStatus();
