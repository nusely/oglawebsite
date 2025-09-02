# Test Database

This directory contains scripts to populate the Ogla application with realistic test data.

## 📁 Files

- `populate-test-data.js` - Creates and populates the test database with sample data
- `copy-test-db.js` - Copies the test database to the main database location
- `test-ogla.db` - The generated test database file

## 🚀 Quick Start

### Step 1: Populate Test Database
```bash
cd backend/testdb
node populate-test-data.js
```

### Step 2: Copy to Main Database
```bash
node copy-test-db.js
```

### Step 3: Start the Application
```bash
# Start backend
cd ..
npm start

# Start frontend (in another terminal)
cd ../frontend
npm start
```

## 📊 Test Data Included

### 👥 Users (5 total)
- **Admin User**
  - Email: `admin@ogla.com`
  - Password: `admin123`
  - Role: Admin

- **Customer Users**
  - Email: `john.doe@example.com`
  - Password: `password123`
  - Role: Customer

### 🏷️ Brands (3 total)
1. **La Veeda** - Premium natural skincare and beauty products
2. **AfriSmocks** - Authentic Ghanaian fashion
3. **Ogribusiness** - Premium agricultural products

### 📂 Categories (5 total)
1. **Skincare** - Natural skincare products
2. **Hair Care** - Organic hair care products
3. **Body Care** - Body care and wellness products
4. **Traditional Clothing** - Authentic Ghanaian traditional clothing
5. **Agricultural Products** - Premium agricultural products for export

### 🛍️ Products (5 total)
1. **250ml Unrefined Shea Butter** - Natural moisturizer
2. **500ml Virgin Coconut Oil** - Virgin coconut oil for natural care
3. **Traditional Kente Cloth** - Authentic handwoven Kente cloth
4. **Premium Cocoa Beans** - High-quality cocoa beans for export
5. **Natural Honey** - Pure natural honey

### 📰 Stories (5 total)
1. **The Journey of Shea Butter** - Traditional process
2. **Sustainable Farming Practices** - Ecological balance
3. **Empowering Local Communities** - Women entrepreneurs
4. **The Art of Kente Weaving** - Cultural significance
5. **From Farm to Market** - Agricultural journey

### 📋 Requests (5 total)
- Various request statuses (pending, approved, rejected)
- Different customer types and order sizes
- Realistic pricing and quantities

## 🖼️ Images

All images use the placeholder: `/uploads/images/imageplaceholder.webp` or `/uploads/products/imageplaceholder.webp`

## 🔧 Features

- **Realistic Data**: All data is contextually relevant to Ghanaian products
- **Complete Relationships**: Proper foreign key relationships between tables
- **Bulk Pricing**: Products include bulk pricing tiers (10+, 50+, 100+ units)
- **Variants**: Products include size and grade variants
- **Specifications**: Detailed product specifications
- **Multiple Images**: Products have main image and additional gallery images
- **Brand Colors**: Each brand has defined color schemes
- **Status Management**: Requests have different statuses for testing workflows

## 🧹 Reset Database

To reset the database with fresh test data:

1. Delete the main database: `rm ../ogla.db`
2. Run: `node populate-test-data.js`
3. Run: `node copy-test-db.js`

## 🔐 Login Credentials

### Admin Access
- **URL**: http://localhost:3000/admin
- **Email**: admin@ogla.com
- **Password**: admin123

### Customer Access
- **URL**: http://localhost:3000/login
- **Email**: john.doe@example.com
- **Password**: password123

## 📝 Notes

- All passwords are hashed using bcrypt
- Email verification is set to true for all users
- All data includes proper timestamps
- Foreign key relationships are maintained
- JSON fields are properly serialized for complex data


