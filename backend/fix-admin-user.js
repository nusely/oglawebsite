const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'ogla.db');

console.log('Connecting to database:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
    fixAdminUser();
  }
});

function fixAdminUser() {
  console.log('🔧 Fixing admin user email verification...');
  
  // Update admin user to have verified email
  db.run(
    'UPDATE users SET emailVerified = 1 WHERE email = ?',
    ['admin@ogla.com'],
    function(err) {
      if (err) {
        console.error('❌ Error updating admin user:', err.message);
      } else {
        console.log('✅ Admin user updated successfully');
        console.log('📊 Rows affected:', this.changes);
        
        // Verify the update
        db.get(
          'SELECT id, email, emailVerified, role FROM users WHERE email = ?',
          ['admin@ogla.com'],
          (err, row) => {
            if (err) {
              console.error('❌ Error checking admin user:', err.message);
            } else if (row) {
              console.log('✅ Admin user details:');
              console.log('   ID:', row.id);
              console.log('   Email:', row.email);
              console.log('   Email Verified:', row.emailVerified ? 'Yes' : 'No');
              console.log('   Role:', row.role);
            } else {
              console.log('❌ Admin user not found');
            }
            
            // Close database
            db.close((err) => {
              if (err) {
                console.error('❌ Error closing database:', err.message);
              } else {
                console.log('✅ Database connection closed');
                console.log('\n🎉 Admin user is now ready for login!');
                console.log('   Email: admin@ogla.com');
                console.log('   Password: admin123');
              }
            });
          }
        );
      }
    }
  );
}


