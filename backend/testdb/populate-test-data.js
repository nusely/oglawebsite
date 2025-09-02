const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Create test database
const testDbPath = path.join(__dirname, 'test-ogla.db');
const db = new sqlite3.Database(testDbPath);

console.log('Creating test database at:', testDbPath);

// Create tables
const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        companyName TEXT,
        companyType TEXT,
        companyRole TEXT,
        role TEXT DEFAULT 'customer',
        emailVerified BOOLEAN DEFAULT 0,
        emailVerificationToken TEXT,
        emailVerificationExpires DATETIME,
        resetPasswordToken TEXT,
        resetPasswordExpires DATETIME,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        lastLoginAt DATETIME
      )`);

      // Brands table
      db.run(`CREATE TABLE IF NOT EXISTS brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        logo_url TEXT,
        website_url TEXT,
        brandColors TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Categories table
      db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Products table
      db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        shortDescription TEXT,
        brandId INTEGER,
        categoryId INTEGER,
        mainImage TEXT,
        additionalImages TEXT,
        specifications TEXT,
        pricing TEXT,
        variants TEXT,
        isFeatured BOOLEAN DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brandId) REFERENCES brands (id),
        FOREIGN KEY (categoryId) REFERENCES categories (id)
      )`);

      // Stories table
      db.run(`CREATE TABLE IF NOT EXISTS stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT,
        image_url TEXT,
        category TEXT,
        isFeatured BOOLEAN DEFAULT 0,
        isActive BOOLEAN DEFAULT 1,
        publishedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Requests table
      db.run(`CREATE TABLE IF NOT EXISTS requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER,
        customerName TEXT NOT NULL,
        customerEmail TEXT NOT NULL,
        items TEXT NOT NULL,
        totalAmount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )`);

      resolve();
    });
  });
};

// Insert test data
const insertTestData = async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  // Insert Users
  const users = [
    {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ogla.com',
      password: adminPassword,
      phone: '+233 54 152 8841',
      companyName: 'Ogla Admin',
      companyType: 'Manufacturing',
      companyRole: 'Owner/CEO',
      role: 'admin',
      emailVerified: 1
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      phone: '+233 54 123 4567',
      companyName: 'ABC Company Ltd',
      companyType: 'Manufacturing',
      companyRole: 'Manager/Director',
      role: 'customer',
      emailVerified: 1
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      password: hashedPassword,
      phone: '+233 55 987 6543',
      companyName: 'XYZ Enterprises',
      companyType: 'Retail & Wholesale',
      companyRole: 'Owner/CEO',
      role: 'customer',
      emailVerified: 1
    },
    {
      firstName: 'Kwame',
      lastName: 'Mensah',
      email: 'kwame.mensah@ghana.com',
      password: hashedPassword,
      phone: '+233 24 456 7890',
      companyName: 'Ghana Natural Products',
      companyType: 'Export',
      companyRole: 'Manager/Director',
      role: 'customer',
      emailVerified: 1
    },
    {
      firstName: 'Ama',
      lastName: 'Osei',
      email: 'ama.osei@africa.com',
      password: hashedPassword,
      phone: '+233 20 123 4567',
      companyName: 'African Beauty Supply',
      companyType: 'Retail & Wholesale',
      companyRole: 'Owner/CEO',
      role: 'customer',
      emailVerified: 1
    }
  ];

  // Insert Brands
  const brands = [
    {
      name: 'La Veeda',
      slug: 'la-veeda',
      description: 'Premium natural skincare and beauty products from Northern Ghana. Our products combine traditional African beauty wisdom with modern cosmetic science.',
      logo_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      website_url: 'https://laveeda.com',
      brandColors: JSON.stringify({
        primary: '#1b4332',
        secondary: '#2d6a4f',
        accent: '#40916c'
      })
    },
    {
      name: 'AfriSmocks',
      slug: 'afrismocks',
      description: 'Authentic Ghanaian fashion celebrating rich cultural heritage through contemporary designs that honor tradition. From handwoven smocks to vibrant African prints.',
      logo_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      website_url: 'https://afrismocks.com',
      brandColors: JSON.stringify({
        primary: '#8b4513',
        secondary: '#a0522d',
        accent: '#cd853f'
      })
    },
    {
      name: 'Ogribusiness',
      slug: 'ogribusiness',
      description: 'Premium agricultural products connecting farmers to global markets. We specialize in bulk farm produce from Northern Ghana with highest quality standards.',
      logo_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      website_url: 'https://ogribusiness.com',
      brandColors: JSON.stringify({
        primary: '#2f4f4f',
        secondary: '#556b2f',
        accent: '#6b8e23'
      })
    }
  ];

  // Insert Categories
  const categories = [
    {
      name: 'Skincare',
      slug: 'skincare',
      description: 'Natural skincare products for all skin types, made with pure ingredients from Ghana',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'
    },
    {
      name: 'Hair Care',
      slug: 'hair-care',
      description: 'Organic hair care products for natural hair maintenance and growth',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'
    },
    {
      name: 'Body Care',
      slug: 'body-care',
      description: 'Body care and wellness products for overall health and beauty',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'
    },
    {
      name: 'Traditional Clothing',
      slug: 'traditional-clothing',
      description: 'Authentic Ghanaian traditional clothing and accessories',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'
    },
    {
      name: 'Agricultural Products',
      slug: 'agricultural-products',
      description: 'Premium agricultural products and farm produce for export',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'
    }
  ];

  // Insert Products
  const products = [
    {
      name: '250ml Unrefined Shea Butter',
      slug: '250ml-unrefined-shea-butter',
      description: 'Premium 250ml unrefined shea butter in convenient packaging for daily use. Made from the finest shea nuts harvested in Northern Ghana.',
      shortDescription: 'Natural moisturizer for all skin types',
      brandId: 1,
      categoryId: 1,
      mainImage: '/uploads/products/imageplaceholder.webp',
      additionalImages: JSON.stringify([
        '/uploads/products/imageplaceholder.webp',
        '/uploads/products/imageplaceholder.webp',
        '/uploads/products/imageplaceholder.webp'
      ]),
      specifications: JSON.stringify({
        size: '250ml',
        weight: '250g',
        origin: 'Northern Ghana'
      }),
      pricing: JSON.stringify({
        base: 25.00,
        bulk: {
          '10': 22.00,
          '50': 20.00,
          '100': 18.00
        }
      }),
      variants: JSON.stringify([
        { size: '250ml', price: 25.00 },
        { size: '500ml', price: 45.00 },
        { size: '1L', price: 85.00 }
      ]),
      isFeatured: 1
    },
    {
      name: '500ml Virgin Coconut Oil',
      slug: '500ml-virgin-coconut-oil',
      description: 'Cold-pressed virgin coconut oil for hair and skin care. Pure and natural without any additives.',
      shortDescription: 'Virgin coconut oil for natural care',
      brandId: 1,
      categoryId: 2,
      mainImage: '/uploads/products/imageplaceholder.webp',
      additionalImages: JSON.stringify([
        '/uploads/products/imageplaceholder.webp',
        '/uploads/products/imageplaceholder.webp'
      ]),
      specifications: JSON.stringify({
        size: '500ml',
        weight: '500g',
        origin: 'Ghana Coast'
      }),
      pricing: JSON.stringify({
        base: 35.00,
        bulk: {
          '10': 32.00,
          '50': 30.00,
          '100': 28.00
        }
      }),
      variants: JSON.stringify([
        { size: '250ml', price: 20.00 },
        { size: '500ml', price: 35.00 },
        { size: '1L', price: 65.00 }
      ]),
      isFeatured: 0
    },
    {
      name: 'Traditional Kente Cloth',
      slug: 'traditional-kente-cloth',
      description: 'Handwoven traditional Kente cloth with authentic patterns and cultural significance.',
      shortDescription: 'Authentic handwoven Kente cloth',
      brandId: 2,
      categoryId: 4,
      mainImage: '/uploads/products/imageplaceholder.webp',
      additionalImages: JSON.stringify([
        '/uploads/products/imageplaceholder.webp',
        '/uploads/products/imageplaceholder.webp'
      ]),
      specifications: JSON.stringify({
        size: '6 yards',
        weight: '800g',
        origin: 'Ashanti Region'
      }),
      pricing: JSON.stringify({
        base: 150.00,
        bulk: {
          '5': 140.00,
          '10': 130.00,
          '20': 120.00
        }
      }),
      variants: JSON.stringify([
        { pattern: 'Traditional', price: 150.00 },
        { pattern: 'Modern', price: 180.00 },
        { pattern: 'Royal', price: 250.00 }
      ]),
      isFeatured: 1
    },
    {
      name: 'Premium Cocoa Beans',
      slug: 'premium-cocoa-beans',
      description: 'High-quality cocoa beans suitable for chocolate production and export.',
      shortDescription: 'Premium cocoa beans for export',
      brandId: 3,
      categoryId: 5,
      mainImage: '/uploads/products/imageplaceholder.webp',
      additionalImages: JSON.stringify([
        '/uploads/products/imageplaceholder.webp'
      ]),
      specifications: JSON.stringify({
        size: '50kg bag',
        weight: '50kg',
        origin: 'Western Region'
      }),
      pricing: JSON.stringify({
        base: 800.00,
        bulk: {
          '10': 750.00,
          '50': 700.00,
          '100': 650.00
        }
      }),
      variants: JSON.stringify([
        { grade: 'Grade A', price: 800.00 },
        { grade: 'Grade B', price: 650.00 },
        { grade: 'Grade C', price: 500.00 }
      ]),
      isFeatured: 0
    },
    {
      name: 'Natural Honey',
      slug: 'natural-honey',
      description: 'Pure natural honey harvested from local beehives in Ghana.',
      shortDescription: 'Pure natural honey',
      brandId: 3,
      categoryId: 5,
      mainImage: '/uploads/products/imageplaceholder.webp',
      additionalImages: JSON.stringify([
        '/uploads/products/imageplaceholder.webp'
      ]),
      specifications: JSON.stringify({
        size: '1L jar',
        weight: '1.4kg',
        origin: 'Central Region'
      }),
      pricing: JSON.stringify({
        base: 45.00,
        bulk: {
          '10': 42.00,
          '50': 40.00,
          '100': 38.00
        }
      }),
      variants: JSON.stringify([
        { size: '500ml', price: 25.00 },
        { size: '1L', price: 45.00 },
        { size: '2L', price: 85.00 }
      ]),
      isFeatured: 1
    }
  ];

  // Insert Stories
  const stories = [
    {
      title: 'The Journey of Shea Butter',
      slug: 'journey-of-shea-butter',
      excerpt: 'Discover the traditional process of making pure shea butter in Ghana',
      content: 'Shea butter has been a cornerstone of Ghanaian beauty and wellness for centuries. Our journey begins in the northern regions of Ghana, where the shea tree (Vitellaria paradoxa) grows abundantly. The traditional process of making shea butter involves several steps, each carried out with care and respect for the natural ingredients. From harvesting the nuts to the final product, every step preserves the natural properties that make shea butter so beneficial for skin and hair care.',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      category: 'Traditional',
      isFeatured: 1,
      publishedAt: '2024-01-15'
    },
    {
      title: 'Sustainable Farming Practices',
      slug: 'sustainable-farming-practices',
      excerpt: 'How we maintain ecological balance while producing quality products',
      content: 'Our commitment to sustainable farming goes beyond just organic certification. We work closely with local farmers to implement practices that protect the environment while ensuring high-quality yields. This includes crop rotation, natural pest control, and water conservation techniques. By supporting sustainable farming, we not only produce better products but also help preserve Ghana\'s natural resources for future generations.',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      category: 'Sustainability',
      isFeatured: 0,
      publishedAt: '2024-01-10'
    },
    {
      title: 'Empowering Local Communities',
      slug: 'empowering-local-communities',
      excerpt: 'Supporting women entrepreneurs in rural Ghana',
      content: 'Through our partnerships with local communities, we create opportunities for women entrepreneurs in rural Ghana. Many of our products are sourced from women-led cooperatives, providing them with fair wages and stable income. This empowerment extends beyond economic benefits, as these women become role models in their communities and help preserve traditional knowledge and skills.',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      category: 'Community',
      isFeatured: 1,
      publishedAt: '2024-01-05'
    },
    {
      title: 'The Art of Kente Weaving',
      slug: 'art-of-kente-weaving',
      excerpt: 'Exploring the cultural significance of Ghana\'s famous textile',
      content: 'Kente cloth is more than just a beautiful fabric; it is a symbol of Ghanaian culture and heritage. Each pattern and color has specific meanings, passed down through generations. The weaving process itself is a form of art, requiring skill, patience, and cultural knowledge. Our Kente products are made by master weavers who have dedicated their lives to preserving this traditional craft.',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      category: 'Culture',
      isFeatured: 0,
      publishedAt: '2024-01-20'
    },
    {
      title: 'From Farm to Market',
      slug: 'from-farm-to-market',
      excerpt: 'The journey of agricultural products from Ghana to global markets',
      content: 'Our agricultural products follow a carefully managed journey from farm to market. We work with farmers to ensure proper harvesting, processing, and packaging standards. This includes quality control measures, proper storage facilities, and efficient transportation networks. By maintaining high standards throughout the supply chain, we ensure that our products meet international quality requirements.',
      image_url: '/uploadshttps://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png',
      category: 'Agriculture',
      isFeatured: 1,
      publishedAt: '2024-01-25'
    }
  ];

  // Insert Requests
  const requests = [
    {
      userId: 2,
      customerName: 'John Doe',
      customerEmail: 'john.doe@example.com',
      items: JSON.stringify([
        {
          productId: 1,
          name: '250ml Unrefined Shea Butter',
          quantity: 50,
          price: 22.00
        },
        {
          productId: 2,
          name: '500ml Virgin Coconut Oil',
          quantity: 25,
          price: 32.00
        }
      ]),
      totalAmount: 2200.00,
      notes: 'Need delivery by end of month. Please include bulk pricing.',
      status: 'pending'
    },
    {
      userId: 3,
      customerName: 'Jane Smith',
      customerEmail: 'jane.smith@example.com',
      items: JSON.stringify([
        {
          productId: 1,
          name: '250ml Unrefined Shea Butter',
          quantity: 100,
          price: 18.00
        }
      ]),
      totalAmount: 1800.00,
      notes: 'For export to Europe. Need certificates of origin.',
      status: 'approved'
    },
    {
      userId: null,
      customerName: 'Anonymous Customer',
      customerEmail: 'customer@example.com',
      items: JSON.stringify([
        {
          productId: 5,
          name: 'Natural Honey',
          quantity: 10,
          price: 45.00
        }
      ]),
      totalAmount: 450.00,
      notes: 'Sample order for testing.',
      status: 'rejected'
    },
    {
      userId: 4,
      customerName: 'Kwame Mensah',
      customerEmail: 'kwame.mensah@ghana.com',
      items: JSON.stringify([
        {
          productId: 3,
          name: 'Traditional Kente Cloth',
          quantity: 5,
          price: 140.00
        },
        {
          productId: 4,
          name: 'Premium Cocoa Beans',
          quantity: 10,
          price: 750.00
        }
      ]),
      totalAmount: 8200.00,
      notes: 'For export to USA. Need all documentation.',
      status: 'pending'
    },
    {
      userId: 5,
      customerName: 'Ama Osei',
      customerEmail: 'ama.osei@africa.com',
      items: JSON.stringify([
        {
          productId: 1,
          name: '250ml Unrefined Shea Butter',
          quantity: 200,
          price: 18.00
        },
        {
          productId: 2,
          name: '500ml Virgin Coconut Oil',
          quantity: 100,
          price: 28.00
        },
        {
          productId: 5,
          name: 'Natural Honey',
          quantity: 50,
          price: 40.00
        }
      ]),
      totalAmount: 7200.00,
      notes: 'For retail distribution in West Africa.',
      status: 'approved'
    }
  ];

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Insert users
      const userStmt = db.prepare(`INSERT INTO users (
        firstName, lastName, email, password, phone, companyName, companyType, companyRole, role, emailVerified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      users.forEach(user => {
        userStmt.run([
          user.firstName, user.lastName, user.email, user.password, user.phone,
          user.companyName, user.companyType, user.companyRole, user.role, user.emailVerified
        ]);
      });
      userStmt.finalize();

      // Insert brands
      const brandStmt = db.prepare(`INSERT INTO brands (
        name, slug, description, logo_url, website_url, brandColors
      ) VALUES (?, ?, ?, ?, ?, ?)`);
      
      brands.forEach(brand => {
        brandStmt.run([
          brand.name, brand.slug, brand.description, brand.logo_url,
          brand.website_url, brand.brandColors
        ]);
      });
      brandStmt.finalize();

      // Insert categories
      const categoryStmt = db.prepare(`INSERT INTO categories (
        name, slug, description, image_url
      ) VALUES (?, ?, ?, ?)`);
      
      categories.forEach(category => {
        categoryStmt.run([
          category.name, category.slug, category.description, category.image_url
        ]);
      });
      categoryStmt.finalize();

      // Insert products
      const productStmt = db.prepare(`INSERT INTO products (
        name, slug, description, shortDescription, brandId, categoryId, mainImage, 
        additionalImages, specifications, pricing, variants, isFeatured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      
      products.forEach(product => {
        productStmt.run([
          product.name, product.slug, product.description, product.shortDescription,
          product.brandId, product.categoryId, product.mainImage, product.additionalImages,
          product.specifications, product.pricing, product.variants, product.isFeatured
        ]);
      });
      productStmt.finalize();

      // Insert stories
      const storyStmt = db.prepare(`INSERT INTO stories (
        title, slug, excerpt, content, image_url, category, isFeatured, publishedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      
      stories.forEach(story => {
        storyStmt.run([
          story.title, story.slug, story.excerpt, story.content, story.image_url,
          story.category, story.isFeatured, story.publishedAt
        ]);
      });
      storyStmt.finalize();

      // Insert requests
      const requestStmt = db.prepare(`INSERT INTO requests (
        userId, customerName, customerEmail, items, totalAmount, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      
      requests.forEach(request => {
        requestStmt.run([
          request.userId, request.customerName, request.customerEmail,
          request.items, request.totalAmount, request.notes, request.status
        ]);
      });
      requestStmt.finalize();

      resolve();
    });
  });
};

// Main execution
const main = async () => {
  try {
    console.log('Creating tables...');
    await createTables();
    
    console.log('Inserting test data...');
    await insertTestData();
    
    console.log('✅ Test database populated successfully!');
    console.log('Database location:', testDbPath);
    console.log('\n📊 Data Summary:');
    console.log('- 5 Users (1 admin, 4 customers)');
    console.log('- 3 Brands (La Veeda, AfriSmocks, Ogribusiness)');
    console.log('- 5 Categories (Skincare, Hair Care, Body Care, Traditional Clothing, Agricultural Products)');
    console.log('- 5 Products (with variants and pricing)');
    console.log('- 5 Stories (with different categories)');
    console.log('- 5 Requests (with different statuses)');
    console.log('\n🔑 Admin Login:');
    console.log('Email: admin@ogla.com');
    console.log('Password: admin123');
    console.log('\n👤 Customer Login:');
    console.log('Email: john.doe@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error populating test database:', error);
  } finally {
    db.close();
  }
};

main();


