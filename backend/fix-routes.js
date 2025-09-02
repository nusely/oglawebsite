const fs = require('fs');
const path = require('path');

// Function to fix pool.execute calls in a file
function fixPoolExecute(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Add query import if not present
  if (!content.includes('query: dbQuery')) {
    content = content.replace(
      /const \{ pool \} = require\('\.\.\/config\/database'\);/,
      "const { pool, query: dbQuery } = require('../config/database');"
    );
  }
  
  // Replace pool.execute with dbQuery and remove array destructuring
  content = content.replace(
    /const \[([^\]]+)\] = await pool\.execute\(/g,
    'const $1 = await dbQuery('
  );
  
  // Replace single pool.execute calls
  content = content.replace(
    /await pool\.execute\(/g,
    'await dbQuery('
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
    fixPoolExecute(filePath);
  }
});

console.log('✅ All route files fixed!');
