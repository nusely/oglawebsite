const bcrypt = require('bcryptjs');
const { query } = require('../config/database');

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@oglasheabutter.com']
    );

    if (existingUsers.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('Oglaadmin@123', saltRounds);

    // Insert admin user
    await query(
      `INSERT INTO users (
        firstName, lastName, email, phone, password, 
        companyName, companyType, companyRole, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Admin',
        'User',
        'admin@oglasheabutter.com',
        '+233 54 152 8841',
        hashedPassword,
        'Ogla Admin',
        'Manufacturing',
        'Owner/CEO',
        'admin'
      ]
    );

    console.log('Admin user created successfully');
    console.log('Email: admin@oglasheabutter.com');
    console.log('Password: Oglaadmin@123');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Run the script
createAdminUser();
