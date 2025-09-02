const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Database file path
const dbPath = path.join(__dirname, 'ogla.db');

console.log('🔍 Checking admin user status...');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
    checkAdminUser();
  }
});

function checkAdminUser() {
  console.log('\n📋 Admin User Details:');
  
  db.get(
    'SELECT id, email, password, emailVerified, role, isActive FROM users WHERE email = ?',
    ['admin@ogla.com'],
    async (err, row) => {
      if (err) {
        console.error('❌ Error checking admin user:', err.message);
      } else if (row) {
        console.log('   ID:', row.id);
        console.log('   Email:', row.email);
        console.log('   Email Verified:', row.emailVerified ? 'Yes' : 'No');
        console.log('   Role:', row.role);
        console.log('   Is Active:', row.isActive ? 'Yes' : 'No');
        console.log('   Has Password:', row.password ? 'Yes' : 'No');
        
        // Test password
        if (row.password) {
          const isValidPassword = await bcrypt.compare('admin123', row.password);
          console.log('   Password Valid:', isValidPassword ? 'Yes' : 'No');
        }
        
        // Check if all required fields are correct
        const issues = [];
        if (!row.emailVerified) issues.push('Email not verified');
        if (!row.isActive) issues.push('User not active');
        if (!row.password) issues.push('No password set');
        if (row.role !== 'admin') issues.push('Role is not admin');
        
        if (issues.length > 0) {
          console.log('\n❌ Issues found:');
          issues.forEach(issue => console.log('   -', issue));
        } else {
          console.log('\n✅ Admin user looks good!');
        }
        
      } else {
        console.log('❌ Admin user not found');
      }
      
      // Close database
      db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('\n✅ Database connection closed');
        }
      });
    }
  );
}


