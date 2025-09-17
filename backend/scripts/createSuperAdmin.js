// backend/scripts/createSuperAdmin.js
// Run this script to create a super admin account

const bcrypt = require("bcryptjs");
const { db } = require("../config/database");

const email = "cimons@oglasheabutter.com";
const password = "Cimons1234321";
const firstName = "Super";
const lastName = "Admin";
const role = "super_admin";
const isActive = 1;
const emailVerified = 1;
const companyName = "OGLA";
const companyType = "Shea Butter";
const companyRole = "Owner";

async function createSuperAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (firstName, lastName, email, password, companyName, companyType, companyRole, role, isActive, emailVerified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          firstName,
          lastName,
          email,
          hashedPassword,
          companyName,
          companyType,
          companyRole,
          role,
          isActive,
          emailVerified,
        ],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    db.close();
  } catch (error) {
    console.error("Error creating super admin:", error);
  }
}

createSuperAdmin();
