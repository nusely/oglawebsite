const mongoose = require('mongoose');
const { Brand, Category, Product } = require('../models');

// Sample data for the three brands
const brandsData = [
  {
    name: 'La Veeda',
    slug: 'la-veeda',
    description: 'Premium cosmetics and skincare products made with natural shea butter from Lawra, Ghana. Our products combine traditional African beauty wisdom with modern cosmetic science.',
    logo: '/images/brands/la-veeda-logo.png',
    bannerImage: '/images/brands/la-veeda-banner.jpg',
    brandColors: {
      primary: '#8B4513',
      secondary: '#D2691E',
      accent: '#F4A460'
    },
    designStyle: 'Clean, elegant, with cosmetic-focused photography, inclusive male/female models'
  },
  {
    name: 'AfriSmocks',
    slug: 'afrismocks',
    description: 'Authentic Ghanaian smocks, African prints, and kente cloth. We celebrate the rich cultural heritage of Ghana through contemporary fashion that honors tradition.',
    logo: '/images/brands/afrismocks-logo.png',
    bannerImage: '/images/brands/afrismocks-banner.jpg',
    brandColors: {
      primary: '#FF6B35',
      secondary: '#F7931E',
      accent: '#FFD23F'
    },
    designStyle: 'Cultural, stylish, bold colors with a blend of traditional and modern aesthetics'
  },
  {
    name: 'OgriBusiness',
    slug: 'ogribusiness',
    description: 'Premium agricultural products and bulk farm produce from Northern Ghana. We connect farmers to global markets with quality beans, maize, castor oil, and more.',
    logo: '/images/brands/ogribusiness-logo.png',
    bannerImage: '/images/brands/ogribusiness-banner.jpg',
    brandColors: {
      primary: '#2E7D32',
      secondary: '#4CAF50',
      accent: '#8BC34A'
    },
    designStyle: 'Earthy tones, farm/nature imagery to reflect large-scale production'
  }
];

// Sample categories for each brand
const categoriesData = [
  // La Veeda Categories
  {
    name: 'Shea Butter',
    slug: 'shea-butter',
    brandSlug: 'la-veeda',
    description: 'Pure, unrefined shea butter products for all skin types',
    image: '/images/categories/shea-butter.jpg',
    sortOrder: 1
  },
  {
    name: 'Body Creams',
    slug: 'body-creams',
    brandSlug: 'la-veeda',
    description: 'Nourishing body creams enriched with natural ingredients',
    image: '/images/categories/body-creams.jpg',
    sortOrder: 2
  },
  {
    name: 'Soaps',
    slug: 'soaps',
    brandSlug: 'la-veeda',
    description: 'Natural handmade soaps with shea butter and essential oils',
    image: '/images/categories/soaps.jpg',
    sortOrder: 3
  },
  {
    name: 'Oils',
    slug: 'oils',
    brandSlug: 'la-veeda',
    description: 'Pure essential oils and carrier oils for skincare',
    image: '/images/categories/oils.jpg',
    sortOrder: 4
  },

  // AfriSmocks Categories
  {
    name: 'Traditional Smocks',
    slug: 'traditional-smocks',
    brandSlug: 'afrismocks',
    description: 'Authentic Ghanaian smocks for men and women',
    image: '/images/categories/traditional-smocks.jpg',
    sortOrder: 1
  },
  {
    name: 'African Prints',
    slug: 'african-prints',
    brandSlug: 'afrismocks',
    description: 'Vibrant African print fabrics and ready-made garments',
    image: '/images/categories/african-prints.jpg',
    sortOrder: 2
  },
  {
    name: 'Kente Cloth',
    slug: 'kente-cloth',
    brandSlug: 'afrismocks',
    description: 'Handwoven kente cloth and kente-inspired designs',
    image: '/images/categories/kente-cloth.jpg',
    sortOrder: 3
  },

  // OgriBusiness Categories
  {
    name: 'Beans',
    slug: 'beans',
    brandSlug: 'ogribusiness',
    description: 'Premium quality beans for local and international markets',
    image: '/images/categories/beans.jpg',
    sortOrder: 1
  },
  {
    name: 'Maize',
    slug: 'maize',
    brandSlug: 'ogribusiness',
    description: 'High-quality maize and corn products',
    image: '/images/categories/maize.jpg',
    sortOrder: 2
  },
  {
    name: 'Castor Oil',
    slug: 'castor-oil',
    brandSlug: 'ogribusiness',
    description: 'Pure castor oil for industrial and cosmetic use',
    image: '/images/categories/castor-oil.jpg',
    sortOrder: 3
  },
  {
    name: 'Bulk Produce',
    slug: 'bulk-produce',
    brandSlug: 'ogribusiness',
    description: 'Large-scale farm produce for wholesale buyers',
    image: '/images/categories/bulk-produce.jpg',
    sortOrder: 4
  }
];

// Sample products for each category
const productsData = [
  // La Veeda - Shea Butter Products
  {
    name: 'Pure Shea Butter',
    slug: 'pure-shea-butter',
    categorySlug: 'shea-butter',
    brandSlug: 'la-veeda',
    description: '100% pure, unrefined shea butter sourced from Lawra, Northern Ghana. This natural moisturizer is perfect for all skin types and provides deep hydration.',
    shortDescription: 'Natural moisturizer for all skin types',
    images: [
      '/images/products/shea-butter-1.jpg',
      '/images/products/shea-butter-2.jpg',
      '/images/products/shea-butter-3.jpg'
    ],
    specifications: {
      weight: '500g',
      origin: 'Lawra, Northern Ghana',
      processing: 'Unrefined, Cold-pressed',
      ingredients: ['100% Pure Shea Butter'],
      shelfLife: '24 months',
      packaging: 'Food-grade plastic container'
    },
    pricing: {
      unitPrice: 45.00,
      currency: 'GHS',
      bulkPricing: [
        { minQuantity: 10, maxQuantity: 49, price: 40.00 },
        { minQuantity: 50, maxQuantity: 99, price: 35.00 },
        { minQuantity: 100, maxQuantity: null, price: 30.00 }
      ]
    },
    variants: [
      {
        name: 'Size',
        options: ['250g', '500g', '1kg']
      }
    ],
    isFeatured: true,
    sortOrder: 1,
    meta: {
      keywords: ['shea butter', 'natural moisturizer', 'Ghana', 'Lawra'],
      seoDescription: 'Pure shea butter from Lawra, Ghana - natural moisturizer for all skin types'
    }
  },
  {
    name: 'Lavender Shea Butter',
    slug: 'lavender-shea-butter',
    categorySlug: 'shea-butter',
    brandSlug: 'la-veeda',
    description: 'Pure shea butter infused with natural lavender essential oil. Perfect for relaxation and skin care.',
    shortDescription: 'Shea butter with lavender for relaxation',
    images: [
      '/images/products/lavender-shea-1.jpg',
      '/images/products/lavender-shea-2.jpg'
    ],
    specifications: {
      weight: '250g',
      origin: 'Lawra, Northern Ghana',
      processing: 'Unrefined, Cold-pressed',
      ingredients: ['Pure Shea Butter', 'Lavender Essential Oil'],
      shelfLife: '18 months',
      packaging: 'Glass jar with lid'
    },
    pricing: {
      unitPrice: 55.00,
      currency: 'GHS',
      bulkPricing: [
        { minQuantity: 10, maxQuantity: 49, price: 50.00 },
        { minQuantity: 50, maxQuantity: null, price: 45.00 }
      ]
    },
    variants: [
      {
        name: 'Size',
        options: ['100g', '250g', '500g']
      }
    ],
    isFeatured: false,
    sortOrder: 2
  },

  // La Veeda - Body Creams
  {
    name: 'Cocoa Butter Body Cream',
    slug: 'cocoa-butter-body-cream',
    categorySlug: 'body-creams',
    brandSlug: 'la-veeda',
    description: 'Rich body cream made with cocoa butter and shea butter. Provides intense hydration and leaves skin feeling silky smooth.',
    shortDescription: 'Rich body cream with cocoa and shea butter',
    images: [
      '/images/products/cocoa-cream-1.jpg',
      '/images/products/cocoa-cream-2.jpg'
    ],
    specifications: {
      weight: '200ml',
      origin: 'Ghana',
      processing: 'Handcrafted',
      ingredients: ['Cocoa Butter', 'Shea Butter', 'Coconut Oil', 'Vitamin E'],
      shelfLife: '12 months',
      packaging: 'Plastic pump bottle'
    },
    pricing: {
      unitPrice: 35.00,
      currency: 'GHS',
      bulkPricing: [
        { minQuantity: 20, maxQuantity: 99, price: 30.00 },
        { minQuantity: 100, maxQuantity: null, price: 25.00 }
      ]
    },
    variants: [
      {
        name: 'Size',
        options: ['100ml', '200ml', '500ml']
      },
      {
        name: 'Fragrance',
        options: ['Unscented', 'Vanilla', 'Lavender']
      }
    ],
    isFeatured: true,
    sortOrder: 1
  },

  // AfriSmocks - Traditional Smocks
  {
    name: 'Men\'s Traditional Smock',
    slug: 'mens-traditional-smock',
    categorySlug: 'traditional-smocks',
    brandSlug: 'afrismocks',
    description: 'Authentic Ghanaian men\'s smock made from handwoven cotton. Features traditional patterns and modern comfort.',
    shortDescription: 'Authentic Ghanaian men\'s smock',
    images: [
      '/images/products/mens-smock-1.jpg',
      '/images/products/mens-smock-2.jpg'
    ],
    specifications: {
      material: 'Handwoven Cotton',
      origin: 'Northern Ghana',
      processing: 'Handcrafted',
      weight: 'Medium weight',
      packaging: 'Gift box'
    },
    pricing: {
      unitPrice: 120.00,
      currency: 'GHS',
      bulkPricing: [
        { minQuantity: 5, maxQuantity: 19, price: 110.00 },
        { minQuantity: 20, maxQuantity: null, price: 100.00 }
      ]
    },
    variants: [
      {
        name: 'Size',
        options: ['Small', 'Medium', 'Large', 'XL', 'XXL']
      },
      {
        name: 'Color',
        options: ['White', 'Blue', 'Green', 'Red']
      }
    ],
    isFeatured: true,
    sortOrder: 1
  },

  // OgriBusiness - Beans
  {
    name: 'Premium Black Beans',
    slug: 'premium-black-beans',
    categorySlug: 'beans',
    brandSlug: 'ogribusiness',
    description: 'High-quality black beans sourced from Northern Ghana. Perfect for local consumption and export markets.',
    shortDescription: 'Premium black beans from Northern Ghana',
    images: [
      '/images/products/black-beans-1.jpg',
      '/images/products/black-beans-2.jpg'
    ],
    specifications: {
      weight: '50kg',
      origin: 'Northern Ghana',
      processing: 'Cleaned and sorted',
      packaging: 'Jute bags',
      moisture: '< 14%',
      impurities: '< 2%'
    },
    pricing: {
      unitPrice: 800.00,
      currency: 'GHS',
      bulkPricing: [
        { minQuantity: 10, maxQuantity: 49, price: 750.00 },
        { minQuantity: 50, maxQuantity: 99, price: 700.00 },
        { minQuantity: 100, maxQuantity: null, price: 650.00 }
      ]
    },
    variants: [
      {
        name: 'Package Size',
        options: ['25kg', '50kg', '100kg']
      }
    ],
    isFeatured: true,
    sortOrder: 1
  }
];

// Seeder function
async function seedProducts() {
  try {
    console.log('🌱 Starting product seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Brand.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create brands
    const brands = await Brand.insertMany(brandsData);
    console.log(`✅ Created ${brands.length} brands`);

    // Create categories
    const categories = [];
    for (const categoryData of categoriesData) {
      const brand = brands.find(b => b.slug === categoryData.brandSlug);
      if (brand) {
        const category = await Category.create({
          ...categoryData,
          brandId: brand._id
        });
        categories.push(category);
      }
    }
    console.log(`✅ Created ${categories.length} categories`);

    // Create products
    const products = [];
    for (const productData of productsData) {
      const brand = brands.find(b => b.slug === productData.brandSlug);
      const category = categories.find(c => c.slug === productData.categorySlug);
      
      if (brand && category) {
        const product = await Product.create({
          ...productData,
          brandId: brand._id,
          categoryId: category._id
        });
        products.push(product);
      }
    }
    console.log(`✅ Created ${products.length} products`);

    console.log('🎉 Product seeding completed successfully!');
    
    // Log summary
    console.log('\n📊 Seeding Summary:');
    console.log(`   Brands: ${brands.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);

  } catch (error) {
    console.error('❌ Error seeding products:', error);
    throw error;
  }
}

// Export for use in other files
module.exports = { seedProducts };

// Run seeder if this file is executed directly
if (require.main === module) {
  // Connect to MongoDB (you'll need to set up your connection)
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ogla-trading')
    .then(() => {
      console.log('🔗 Connected to MongoDB');
      return seedProducts();
    })
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
