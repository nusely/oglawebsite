// backend/scripts/clearForProduction.js
// Run this script to clear sensitive data before production deployment

const { db } = require("../config/database");

async function clearForProduction() {
  try {
    // Clear all requests
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM requests;", function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("All requests deleted.");

    // Clear all reviews
    await new Promise((resolve, reject) => {
      db.run("DELETE FROM reviews;", function (err) {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("All reviews deleted.");

    // Clear all stories except the featured one (replace 1 with your featured story ID)
    const featuredStoryId = 1; // TODO: Set this to your actual featured story ID
    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM stories WHERE id != ?;",
        [featuredStoryId],
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log("All non-featured stories deleted.");

    // Clear all users except admin and super_admin
    await new Promise((resolve, reject) => {
      db.run(
        "DELETE FROM users WHERE role NOT IN ('admin', 'super_admin');",
        function (err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    console.log("All non-admin and non-super_admin users deleted.");

    db.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

clearForProduction();
