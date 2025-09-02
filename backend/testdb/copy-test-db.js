const fs = require('fs');
const path = require('path');

const copyTestDatabase = () => {
  const testDbPath = path.join(__dirname, 'test-ogla.db');
  const mainDbPath = path.join(__dirname, '..', 'ogla.db');
  
  try {
    // Check if test database exists
    if (!fs.existsSync(testDbPath)) {
      console.error('❌ Test database not found. Please run populate-test-data.js first.');
      return;
    }
    
    // Copy test database to main location
    fs.copyFileSync(testDbPath, mainDbPath);
    
    console.log('✅ Test database copied successfully!');
    console.log('From:', testDbPath);
    console.log('To:', mainDbPath);
    console.log('\n🎉 Your main database is now populated with test data!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the backend: npm start');
    console.log('2. Start the frontend: cd ../frontend && npm start');
    console.log('3. Login to admin dashboard with:');
    console.log('   Email: admin@ogla.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error copying test database:', error);
  }
};

copyTestDatabase();


