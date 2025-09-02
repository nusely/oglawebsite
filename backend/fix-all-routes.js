const fs = require('fs');
const path = require('path');

// Function to fix route files
function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the import - rename express-validator query to validatorQuery
  content = content.replace(
    /const \{ ([^}]*), query, ([^}]*)\} = require\('express-validator'\);/g,
    "const { $1, query: validatorQuery, $2} = require('express-validator');"
  );
  
  // Fix all express-validator query calls to validatorQuery
  content = content.replace(
    /validatorQuery\(/g,
    'validatorQuery('
  );
  
  // Fix any remaining express-validator query calls
  content = content.replace(
    /query\('([^']+)'\)\.optional\(\)/g,
    "validatorQuery('$1').optional()"
  );
  
  // Fix any remaining express-validator query calls without optional
  content = content.replace(
    /query\('([^']+)'\)\./g,
    "validatorQuery('$1')."
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
