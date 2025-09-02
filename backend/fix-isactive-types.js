const { query } = require('./config/database');

async function fixIsActiveTypes() {
  try {
    console.log('🔧 Fixing isActive field data types...\n');
    
    // Show current state
    const before = await query('SELECT id, title, isActive, typeof(isActive) as type FROM stories ORDER BY id');
    console.log('📊 Before fixing:');
    before.forEach(story => {
      console.log(`   ID ${story.id}: isActive = ${story.isActive} (${story.type})`);
    });
    
    console.log('\n🔧 Converting all isActive values to integers...');
    
    // Convert "true" text values to 1
    const result1 = await query('UPDATE stories SET isActive = 1 WHERE isActive = "true"');
    console.log(`✅ Converted ${result1.changes} text "true" values to integer 1`);
    
    // Convert "false" text values to 0 (just in case)
    const result2 = await query('UPDATE stories SET isActive = 0 WHERE isActive = "false"');
    console.log(`✅ Converted ${result2.changes} text "false" values to integer 0`);
    
    // Show state after fixing
    const after = await query('SELECT id, title, isActive, typeof(isActive) as type FROM stories ORDER BY id');
    console.log('\n📊 After fixing:');
    after.forEach(story => {
      console.log(`   ID ${story.id}: isActive = ${story.isActive} (${story.type})`);
    });
    
    // Test the public API query again
    console.log('\n🧪 Testing public API query after fix:');
    const publicStories = await query('SELECT id, title, isFeatured, isActive FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC, createdAt DESC');
    console.log(`✅ Public API now returns: ${publicStories.length} stories`);
    
    const featuredCount = publicStories.filter(s => s.isFeatured).length;
    const regularCount = publicStories.filter(s => !s.isFeatured).length;
    
    console.log('\n📈 Final Summary:');
    console.log(`   - Total active stories: ${publicStories.length}`);
    console.log(`   - Featured stories: ${featuredCount}`);
    console.log(`   - Regular stories: ${regularCount}`);
    
    if (featuredCount > 0) {
      const featuredStory = publicStories.find(s => s.isFeatured);
      console.log(`   - Featured story: "${featuredStory.title}"`);
    }
    
    console.log('\n🎯 Expected result on customer frontend:');
    console.log(`   - Featured section: ${featuredCount} story`);
    console.log(`   - Regular grid: ${regularCount} stories`);
    console.log(`   - Total visible: ${publicStories.length} stories`);
    
  } catch (error) {
    console.error('❌ Error fixing isActive types:', error);
  }
  
  process.exit(0);
}

fixIsActiveTypes();
