# Ogla Shea Butter & General Trading - Product Structure

## Overview

This document outlines the product structure for the Ogla Shea Butter & General Trading system, which manages three distinct sub-brands:

- **La Veeda** - Cosmetics and skincare products
- **AfriSmocks** - Traditional Ghanaian clothing and fabrics
- **OgriBusiness** - Agricultural products and bulk farm produce

## Database Models

### 1. Brand Model (`models/Brand.js`)

Represents the three main sub-brands with their unique design styles and branding elements.

```javascript
const brand = {
  name: 'La Veeda', // 'La Veeda', 'AfriSmocks', 'OgriBusiness'
  slug: 'la-veeda',
  description: 'Premium cosmetics and skincare products...',
  logo: '/images/brands/la-veeda-logo.png',
  bannerImage: '/images/brands/la-veeda-banner.jpg',
  brandColors: {
    primary: '#8B4513',
    secondary: '#D2691E',
    accent: '#F4A460'
  },
  designStyle: 'Clean, elegant, with cosmetic-focused photography...',
  isActive: true
};
```

### 2. Category Model (`models/Category.js`)

Organizes products within each brand with proper relationships.

```javascript
const category = {
  name: 'Shea Butter',
  slug: 'shea-butter',
  brandId: ObjectId, // Reference to Brand
  description: 'Pure, unrefined shea butter products...',
  image: '/images/categories/shea-butter.jpg',
  isActive: true,
  sortOrder: 1
};
```

### 3. Product Model (`models/Product.js`)

Comprehensive product structure with variants, bulk pricing, and flexible specifications.

```javascript
const product = {
  name: 'Pure Shea Butter',
  slug: 'pure-shea-butter',
  brandId: ObjectId, // Reference to Brand
  categoryId: ObjectId, // Reference to Category
  description: '100% pure, unrefined shea butter...',
  shortDescription: 'Natural moisturizer for all skin types',
  images: ['/images/products/shea-butter-1.jpg'],
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
  isActive: true,
  isFeatured: true,
  sortOrder: 1
};
```

## Key Features

### 🔄 **Flexible Product Specifications**

The `specifications` field is designed to handle different product types:

- **La Veeda**: weight, ingredients, shelfLife, packaging
- **AfriSmocks**: material, dimensions, weight, origin
- **OgriBusiness**: weight, moisture, impurities, packaging

### 💰 **B2B Bulk Pricing**

Products support multiple pricing tiers for wholesale customers:

```javascript
bulkPricing: [
  { minQuantity: 10, maxQuantity: 49, price: 40.00 },
  { minQuantity: 50, maxQuantity: 99, price: 35.00 },
  { minQuantity: 100, maxQuantity: null, price: 30.00 }
]
```

### 🎨 **Product Variants**

Support for multiple variant types (size, color, fragrance, etc.):

```javascript
variants: [
  {
    name: 'Size',
    options: ['Small', 'Medium', 'Large', 'XL']
  },
  {
    name: 'Color',
    options: ['White', 'Blue', 'Green', 'Red']
  }
]
```

### 🔍 **Advanced Search & Filtering**

Built-in methods for product discovery:

```javascript
// Find products by brand
const laVeedaProducts = await Product.findByBrand(brandId, { featured: true });

// Search products
const searchResults = await Product.search('shea butter', { brandId: laVeedaId });

// Get featured products
const featuredProducts = await Product.findFeatured();
```

## Usage Examples

### Creating a New Product

```javascript
const { Product, Brand, Category } = require('./models');

// Find the brand and category
const laVeeda = await Brand.findOne({ slug: 'la-veeda' });
const sheaButterCategory = await Category.findOne({ 
  slug: 'shea-butter', 
  brandId: laVeeda._id 
});

// Create the product
const newProduct = await Product.create({
  name: 'Vanilla Shea Butter',
  slug: 'vanilla-shea-butter',
  brandId: laVeeda._id,
  categoryId: sheaButterCategory._id,
  description: 'Pure shea butter with natural vanilla...',
  shortDescription: 'Shea butter with vanilla fragrance',
  images: ['/images/products/vanilla-shea-1.jpg'],
  specifications: {
    weight: '250g',
    origin: 'Lawra, Northern Ghana',
    processing: 'Unrefined, Cold-pressed',
    ingredients: ['Pure Shea Butter', 'Vanilla Essential Oil'],
    shelfLife: '18 months',
    packaging: 'Glass jar'
  },
  pricing: {
    unitPrice: 50.00,
    currency: 'GHS',
    bulkPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 45.00 },
      { minQuantity: 50, maxQuantity: null, price: 40.00 }
    ]
  },
  variants: [
    {
      name: 'Size',
      options: ['100g', '250g', '500g']
    }
  ],
  isFeatured: false,
  sortOrder: 3
});
```

### Calculating Product Pricing

```javascript
const product = await Product.findOne({ slug: 'pure-shea-butter' });

// Calculate price for different quantities
const price1 = product.calculatePrice(1);    // 45.00 GHS
const price10 = product.calculatePrice(10);  // 400.00 GHS (bulk pricing)
const price100 = product.calculatePrice(100); // 3000.00 GHS (bulk pricing)
```

### Getting Products with Relationships

```javascript
// Get all La Veeda products with brand and category info
const laVeedaProducts = await Product.find({ brandId: laVeedaId })
  .populate('brand', 'name slug brandColors')
  .populate('category', 'name slug')
  .sort({ sortOrder: 1, createdAt: -1 });

// Get featured products across all brands
const featuredProducts = await Product.findFeatured();
```

### Searching Products

```javascript
// Search for products containing "shea"
const searchResults = await Product.search('shea', {
  brandId: laVeedaId,
  categoryId: sheaButterCategoryId
});
```

## Brand-Specific Product Examples

### La Veeda (Cosmetics)

```javascript
// Shea Butter Product
{
  name: 'Pure Shea Butter',
  specifications: {
    weight: '500g',
    origin: 'Lawra, Northern Ghana',
    processing: 'Unrefined, Cold-pressed',
    ingredients: ['100% Pure Shea Butter'],
    shelfLife: '24 months',
    packaging: 'Food-grade plastic container'
  },
  variants: [
    { name: 'Size', options: ['250g', '500g', '1kg'] }
  ]
}

// Body Cream Product
{
  name: 'Cocoa Butter Body Cream',
  specifications: {
    weight: '200ml',
    origin: 'Ghana',
    processing: 'Handcrafted',
    ingredients: ['Cocoa Butter', 'Shea Butter', 'Coconut Oil', 'Vitamin E'],
    shelfLife: '12 months',
    packaging: 'Plastic pump bottle'
  },
  variants: [
    { name: 'Size', options: ['100ml', '200ml', '500ml'] },
    { name: 'Fragrance', options: ['Unscented', 'Vanilla', 'Lavender'] }
  ]
}
```

### AfriSmocks (Clothing)

```javascript
// Traditional Smock
{
  name: 'Men\'s Traditional Smock',
  specifications: {
    material: 'Handwoven Cotton',
    origin: 'Northern Ghana',
    processing: 'Handcrafted',
    weight: 'Medium weight',
    packaging: 'Gift box'
  },
  variants: [
    { name: 'Size', options: ['Small', 'Medium', 'Large', 'XL', 'XXL'] },
    { name: 'Color', options: ['White', 'Blue', 'Green', 'Red'] }
  ]
}
```

### OgriBusiness (Agriculture)

```javascript
// Bulk Beans
{
  name: 'Premium Black Beans',
  specifications: {
    weight: '50kg',
    origin: 'Northern Ghana',
    processing: 'Cleaned and sorted',
    packaging: 'Jute bags',
    moisture: '< 14%',
    impurities: '< 2%'
  },
  variants: [
    { name: 'Package Size', options: ['25kg', '50kg', '100kg'] }
  ]
}
```

## Seeding Data

To populate the database with sample data:

```bash
# Run the seeder
node seeders/productSeeder.js

# Or import and use in your application
const { seedProducts } = require('./seeders/productSeeder');
await seedProducts();
```

## Performance Optimizations

### Database Indexes

The models include strategic indexes for optimal performance:

```javascript
// Products
productSchema.index({ brandId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sortOrder: 1 });

// Categories
categorySchema.index({ brandId: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

// Brands
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });
```

### Virtual Relationships

Models include virtual fields for easy relationship access:

```javascript
// Get all products in a brand
const brand = await Brand.findOne({ slug: 'la-veeda' });
const products = await brand.populate('products');

// Get all categories in a brand
const categories = await brand.populate('categories');
```

## Next Steps

1. **API Development**: Create REST endpoints for product management
2. **Frontend Integration**: Build React components for product display
3. **Admin Panel**: Develop admin interface for product management
4. **Image Management**: Implement image upload and storage system
5. **Search & Filter**: Add advanced search and filtering capabilities

This product structure provides a solid foundation for managing the diverse product catalog across all three brands while maintaining flexibility for future enhancements.
