# Ogla Shea Butter & General Trading - Database Schema

## Collections Overview

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  // B2B Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyType: {
    type: String,
    required: true,
    enum: [
      'Agriculture & Farming',
      'Food & Beverage', 
      'Cosmetics & Beauty',
      'Textiles & Fashion',
      'Healthcare & Pharmaceuticals',
      'Retail & Wholesale',
      'Manufacturing',
      'Export/Import',
      'Hospitality & Tourism',
      'Education',
      'Technology',
      'Construction',
      'Transportation & Logistics',
      'Energy & Utilities',
      'Other'
    ]
  },
  companyRole: {
    type: String,
    required: true,
    enum: [
      'Owner/CEO',
      'Manager/Director',
      'Purchasing Manager',
      'Procurement Officer',
      'Sales Manager',
      'Marketing Manager',
      'Operations Manager',
      'Business Development',
      'Consultant',
      'Employee',
      'Other'
    ]
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'super_admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### 2. Brands Collection
```javascript
{
  _id: ObjectId,
  name: String, // "La Veeda", "AfriSmocks", "OgriBusiness"
  slug: String, // "la-veeda", "afrismocks", "ogribusiness"
  description: String,
  logo: String, // URL to logo image
  bannerImage: String, // URL to banner image
  brandColors: {
    primary: String,
    secondary: String,
    accent: String
  },
  designStyle: String, // "Clean, elegant", "Cultural, stylish", "Earthy tones"
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Categories Collection
```javascript
{
  _id: ObjectId,
  name: String, // "Shea Butter", "Soaps", "Smocks", "Beans", etc.
  slug: String,
  brandId: {
    type: ObjectId,
    ref: 'Brands'
  },
  description: String,
  image: String, // URL to category image
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  slug: String,
  brandId: {
    type: ObjectId,
    ref: 'Brands'
  },
  categoryId: {
    type: ObjectId,
    ref: 'Categories'
  },
  description: String,
  shortDescription: String,
  images: [String], // Array of image URLs
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    origin: String,
    // Additional fields based on product type
  },
  pricing: {
    unitPrice: Number,
    currency: {
      type: String,
      default: 'GHS'
    },
    bulkPricing: [{
      minQuantity: Number,
      maxQuantity: Number,
      price: Number
    }]
  },
  variants: [{
    name: String, // "Size", "Color", "Flavor"
    options: [String] // ["Small", "Medium", "Large"]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Requests Collection (Orders)
```javascript
{
  _id: ObjectId,
  requestNumber: String, // Auto-generated: "OGLA-2024-001"
  userId: {
    type: ObjectId,
    ref: 'Users'
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    }
  },
  items: [{
    productId: {
      type: ObjectId,
      ref: 'Products'
    },
    productName: String,
    brandName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number,
    variant: String // Optional variant selection
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    currency: {
      type: String,
      default: 'GHS'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  notes: String, // Customer notes
  adminNotes: String, // Internal notes
  shippingMethod: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. RequestStatusHistory Collection
```javascript
{
  _id: ObjectId,
  requestId: {
    type: ObjectId,
    ref: 'Requests'
  },
  status: String,
  changedBy: {
    type: ObjectId,
    ref: 'Users'
  },
  notes: String,
  createdAt: Date
}
```

### 7. Invoices Collection
```javascript
{
  _id: ObjectId,
  invoiceNumber: String, // Auto-generated: "INV-2024-001"
  requestId: {
    type: ObjectId,
    ref: 'Requests'
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    company: String,
    address: String
  },
  items: [{
    productName: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    currency: String
  },
  companyInfo: {
    name: "Ogla Shea Butter & General Trading",
    address: String,
    phone: String,
    email: String,
    taxId: String
  },
  issueDate: Date,
  dueDate: Date,
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue'],
    default: 'draft'
  },
  paymentTerms: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. ContactInquiries Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  company: String,
  subject: String,
  message: String,
  source: {
    type: String,
    enum: ['contact_form', 'whatsapp', 'email'],
    default: 'contact_form'
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  assignedTo: {
    type: ObjectId,
    ref: 'Users'
  },
  response: String, // Admin response
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Notifications Collection
```javascript
{
  _id: ObjectId,
  type: {
    type: String,
    enum: ['new_request', 'status_update', 'contact_inquiry', 'system'],
    required: true
  },
  recipient: {
    type: ObjectId,
    ref: 'Users'
  },
  title: String,
  message: String,
  data: Object, // Additional data for the notification
  channels: [{
    type: String,
    enum: ['email', 'whatsapp', 'in_app'],
    default: ['email']
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  createdAt: Date
}
```

### 10. Settings Collection
```javascript
{
  _id: ObjectId,
  key: String, // "company_info", "notification_settings", "tax_rates"
  value: Object,
  description: String,
  updatedAt: Date
}
```

## Indexes for Performance

```javascript
// Users Collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "role": 1 })

// Products Collection
db.products.createIndex({ "brandId": 1 })
db.products.createIndex({ "categoryId": 1 })
db.products.createIndex({ "isActive": 1 })
db.products.createIndex({ "isFeatured": 1 })
db.products.createIndex({ "slug": 1 }, { unique: true })

// Requests Collection
db.requests.createIndex({ "requestNumber": 1 }, { unique: true })
db.requests.createIndex({ "userId": 1 })
db.requests.createIndex({ "status": 1 })
db.requests.createIndex({ "createdAt": -1 })

// Invoices Collection
db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true })
db.invoices.createIndex({ "requestId": 1 })

// Categories Collection
db.categories.createIndex({ "brandId": 1 })
db.categories.createIndex({ "slug": 1 })
```

## Sample Data Structure

### Sample Brand Document
```javascript
{
  _id: ObjectId("..."),
  name: "La Veeda",
  slug: "la-veeda",
  description: "Premium cosmetics and skincare products made with natural shea butter from Lawra, Ghana.",
  logo: "/images/brands/la-veeda-logo.png",
  bannerImage: "/images/brands/la-veeda-banner.jpg",
  brandColors: {
    primary: "#8B4513",
    secondary: "#D2691E",
    accent: "#F4A460"
  },
  designStyle: "Clean, elegant, with cosmetic-focused photography, inclusive male/female models",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Sample Product Document
```javascript
{
  _id: ObjectId("..."),
  name: "Pure Shea Butter",
  slug: "pure-shea-butter",
  brandId: ObjectId("..."), // La Veeda brand ID
  categoryId: ObjectId("..."), // Shea Butter category ID
  description: "100% pure, unrefined shea butter sourced from Lawra, Northern Ghana.",
  shortDescription: "Natural moisturizer for all skin types",
  images: [
    "/images/products/shea-butter-1.jpg",
    "/images/products/shea-butter-2.jpg"
  ],
  specifications: {
    weight: "500g",
    origin: "Lawra, Northern Ghana",
    processing: "Unrefined, Cold-pressed"
  },
  pricing: {
    unitPrice: 45.00,
    currency: "GHS",
    bulkPricing: [
      { minQuantity: 10, maxQuantity: 49, price: 40.00 },
      { minQuantity: 50, maxQuantity: 99, price: 35.00 },
      { minQuantity: 100, maxQuantity: null, price: 30.00 }
    ]
  },
  variants: [
    {
      name: "Size",
      options: ["250g", "500g", "1kg"]
    }
  ],
  isActive: true,
  isFeatured: true,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

This schema provides a solid foundation for the Ogla Shea Butter & General Trading system, supporting all the required features while maintaining flexibility for future enhancements.
