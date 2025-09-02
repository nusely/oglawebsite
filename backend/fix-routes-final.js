const fs = require('fs');
const path = require('path');

// Function to fix route files
function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the import - change dbQuery back to query
  content = content.replace(
    /const \{ pool, query: dbQuery \} = require\('\.\.\/config\/database'\);/g,
    "const { pool, query } = require('../config/database');"
  );
  
  // Fix all dbQuery calls back to query
  content = content.replace(/dbQuery/g, 'query');
  
  // Remove sortOrder from ORDER BY clauses
  content = content.replace(
    /ORDER BY p\.sortOrder ASC, p\.createdAt DESC/g,
    'ORDER BY p.createdAt DESC'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${filePath}`);
}

// Fix all route files
const routeFiles = [
  'routes/products.js',
  'routes/brands.js', 
  'routes/categories.js',
  'routes/stories.js',
  'routes/requests.js',
  'routes/users.js',
  'routes/auth.js'
];

routeFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    fixRouteFile(filePath);
  }
});

console.log('✅ All route files fixed!');
