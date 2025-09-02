const { query } = require('./config/database');

async function fixFeaturedStories() {
  try {
    console.log('🔧 Fixing featured stories...\n');
    
    // First, unfeature all stories
    await query('UPDATE stories SET isFeatured = 0');
    console.log('✅ Removed featured status from all stories');
    
    // Set only "Ogla Shea Butter Expands to International Markets" as featured
    const result = await query(
      'UPDATE stories SET isFeatured = 1 WHERE title = ?',
      ['Ogla Shea Butter Expands to International Markets']
    );
    
    if (result.changes > 0) {
      console.log('✅ Set "Ogla Shea Butter Expands to International Markets" as featured');
    } else {
      console.log('❌ Could not find the story to feature');
    }
    
    // Also make sure "Quality Assurance: Behind the Scenes" is active
    const activateResult = await query(
      'UPDATE stories SET isActive = 1 WHERE title = ?',
      ['Quality Assurance: Behind the Scenes']
    );
    
    if (activateResult.changes > 0) {
      console.log('✅ Activated "Quality Assurance: Behind the Scenes"');
    }
    
    console.log('\n📊 Updated Status:');
    const stories = await query('SELECT title, isFeatured, isActive FROM stories ORDER BY createdAt DESC');
    stories.forEach((story, index) => {
      const status = story.isActive ? '✅ ACTIVE' : '❌ INACTIVE';
      const featured = story.isFeatured ? '⭐ FEATURED' : '📄 REGULAR';
      console.log(`${index + 1}. ${story.title} - ${status} | ${featured}`);
    });
    
    const activeCount = stories.filter(s => s.isActive).length;
    const featuredCount = stories.filter(s => s.isFeatured).length;
    
    console.log(`\n📈 Final Summary:`);
    console.log(`   - Total Stories: ${stories.length}`);
    console.log(`   - Active Stories: ${activeCount} (will show on customer pages)`);
    console.log(`   - Featured Stories: ${featuredCount} (should be 1)`);
    
  } catch (error) {
    console.error('❌ Error fixing featured stories:', error);
  }
  
  process.exit(0);
}

fixFeaturedStories();
