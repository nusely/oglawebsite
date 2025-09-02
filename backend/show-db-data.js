const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path - the one the backend server actually uses
const dbPath = path.join(__dirname, 'data', 'ogla.db');

console.log('🔍 Showing all data in the database...');
console.log('📁 Database path:', dbPath);

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to SQLite database');
    showAllData();
  }
});

function showAllData() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 DATABASE CONTENTS');
  console.log('='.repeat(80));

  // Show Users
  db.all('SELECT id, firstName, lastName, email, role, emailVerified, isActive FROM users', (err, users) => {
    if (err) {
      console.error('❌ Error fetching users:', err.message);
    } else {
      console.log('\n👥 USERS (' + users.length + ' records):');
      console.log('-'.repeat(50));
      users.forEach(user => {
        console.log(`ID: ${user.id} | ${user.firstName} ${user.lastName} | ${user.email} | Role: ${user.role} | Verified: ${user.emailVerified ? 'Yes' : 'No'} | Active: ${user.isActive ? 'Yes' : 'No'}`);
      });
    }

    // Show Brands
    db.all('SELECT id, name, slug, description, isActive FROM brands', (err, brands) => {
      if (err) {
        console.error('❌ Error fetching brands:', err.message);
      } else {
        console.log('\n🏷️  BRANDS (' + brands.length + ' records):');
        console.log('-'.repeat(50));
        brands.forEach(brand => {
          console.log(`ID: ${brand.id} | ${brand.name} | Slug: ${brand.slug} | Active: ${brand.isActive ? 'Yes' : 'No'}`);
        });
      }

      // Show Categories
      db.all('SELECT id, name, slug, description, isActive FROM categories', (err, categories) => {
        if (err) {
          console.error('❌ Error fetching categories:', err.message);
        } else {
          console.log('\n📂 CATEGORIES (' + categories.length + ' records):');
          console.log('-'.repeat(50));
          categories.forEach(category => {
            console.log(`ID: ${category.id} | ${category.name} | Slug: ${category.slug} | Active: ${category.isActive ? 'Yes' : 'No'}`);
          });
        }

        // Show Products
        db.all('SELECT id, name, slug, brandId, categoryId, isFeatured, isActive FROM products', (err, products) => {
          if (err) {
            console.error('❌ Error fetching products:', err.message);
          } else {
            console.log('\n📦 PRODUCTS (' + products.length + ' records):');
            console.log('-'.repeat(50));
            products.forEach(product => {
              console.log(`ID: ${product.id} | ${product.name} | Slug: ${product.slug} | Brand: ${product.brandId} | Category: ${product.categoryId} | Featured: ${product.isFeatured ? 'Yes' : 'No'} | Active: ${product.isActive ? 'Yes' : 'No'}`);
            });
          }

          // Show Stories
          db.all('SELECT id, title, slug, isFeatured, isActive FROM stories', (err, stories) => {
            if (err) {
              console.error('❌ Error fetching stories:', err.message);
            } else {
              console.log('\n📰 STORIES (' + stories.length + ' records):');
              console.log('-'.repeat(50));
              stories.forEach(story => {
                console.log(`ID: ${story.id} | ${story.title} | Slug: ${story.slug} | Featured: ${story.isFeatured ? 'Yes' : 'No'} | Active: ${story.isActive ? 'Yes' : 'No'}`);
              });
            }

            // Show Requests
            db.all('SELECT id, customerName, customerEmail, status, totalAmount, createdAt FROM requests', (err, requests) => {
              if (err) {
                console.error('❌ Error fetching requests:', err.message);
              } else {
                console.log('\n📋 REQUESTS (' + requests.length + ' records):');
                console.log('-'.repeat(50));
                requests.forEach(request => {
                  console.log(`ID: ${request.id} | ${request.customerName} | ${request.customerEmail} | Status: ${request.status} | Amount: GH₵${request.totalAmount || '0'} | Date: ${request.createdAt}`);
                });
              }

              console.log('\n' + '='.repeat(80));
              console.log('✅ Database scan complete!');
              console.log('='.repeat(80));

              // Close database
              db.close((err) => {
                if (err) {
                  console.error('❌ Error closing database:', err.message);
                } else {
                  console.log('\n✅ Database connection closed');
                }
              });
            });
          });
        });
      });
    });
  });
}


