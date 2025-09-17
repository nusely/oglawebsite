# Ogla Shea Butter & General Trading - Backend API

A Node.js/Express backend API for the Ogla Shea Butter e-commerce platform.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Registration, login, profile management, password reset
- **Product Management**: CRUD operations for products, brands, and categories
- **Request System**: B2B request submission and management
- **Content Management**: Stories/news articles with rich content
- **Email System**: Transactional emails with templates
- **File Upload**: Image upload and management
- **Security**: Rate limiting, input validation, CORS protection
- **Database**: Azure SQL Database with connection pooling

## 📋 Prerequisites

- Node.js (v14 or higher)
- Azure SQL Database access
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # Database Configuration (Azure SQL)
   DB_SERVER=your-server.database.windows.net
   DB_DATABASE=your-database-name
   DB_USER=your-username
   DB_PASSWORD=your-password
   DB_ENCRYPT=true
   DB_TRUST_SERVER_CERTIFICATE=false

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=oglatrade@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=oglatrade@gmail.com

   # File Upload Configuration
   UPLOAD_PATH=uploads
   MAX_FILE_SIZE=5242880

   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100

   # Security
   BCRYPT_ROUNDS=12
   ```

4. **Set up Azure SQL Database**
   - Create an Azure SQL Database instance
   - Configure firewall rules to allow your IP
   - Note down connection details for environment variables

5. **Initialize database tables**
   ```bash
   npm run dev
   ```
   The tables will be created automatically when the server starts.

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+233 54 152 8841",
  "password": "password123",
  "companyName": "ABC Company",
  "companyType": "Manufacturing",
  "companyRole": "Owner/CEO",
  "address": {
    "street": "123 Main St",
    "city": "Accra",
    "state": "Greater Accra",
    "country": "Ghana",
    "postalCode": "00233"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+233 54 152 8842"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "password123",
  "newPassword": "newpassword123"
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "newpassword123"
}
```

### Product Endpoints

#### Get All Products
```http
GET /api/products?page=1&limit=12&search=shea&brand=la-veeda&category=skincare&minPrice=10&maxPrice=100&featured=true
```

#### Get Single Product
```http
GET /api/products/pure-shea-butter
```

#### Get Featured Products
```http
GET /api/products/featured/featured
```

#### Get Products by Brand
```http
GET /api/products/brand/la-veeda?page=1&limit=12
```

#### Get Related Products
```http
GET /api/products/pure-shea-butter/related
```

#### Create Product (Admin)
```http
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Pure Shea Butter",
  "slug": "pure-shea-butter",
  "brandId": 1,
  "categoryId": 1,
  "description": "100% pure, unrefined shea butter...",
  "shortDescription": "Natural moisturizer for all skin types",
  "images": ["/images/products/shea-butter-1.jpg"],
  "specifications": {
    "weight": "500g",
    "origin": "Lawra, Northern Ghana",
    "processing": "Unrefined, Cold-pressed"
  },
  "pricing": {
    "unitPrice": 45.00,
    "currency": "GHS",
    "bulkPricing": [
      {"minQuantity": 10, "maxQuantity": 49, "price": 40.00},
      {"minQuantity": 50, "maxQuantity": 99, "price": 35.00}
    ]
  },
  "variants": [
    {
      "name": "Size",
      "options": ["250g", "500g", "1kg"]
    }
  ],
  "isFeatured": true,
  "sortOrder": 1
}
```

### Story Endpoints

#### Get All Stories
```http
GET /api/stories?page=1&limit=10&featured=true&category=Business
```

#### Get Single Story
```http
GET /api/stories/international-expansion
```

#### Get Featured Stories
```http
GET /api/stories/featured/featured
```

#### Get Random Story for Popup
```http
GET /api/stories/random/popup
```

### Request Endpoints

#### Submit Request
```http
POST /api/requests
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "price": 45.00,
      "name": "Pure Shea Butter"
    }
  ],
  "totalAmount": 450.00,
  "notes": "Please deliver by next week"
}
```

#### Get User Requests
```http
GET /api/requests/my-requests
Authorization: Bearer <token>
```

#### Get Single Request
```http
GET /api/requests/1
Authorization: Bearer <token>
```

### User Management Endpoints (Admin)

#### Get All Users
```http
GET /api/users?page=1&limit=20&search=john&role=customer&isActive=true
Authorization: Bearer <admin_token>
```

#### Get Single User
```http
GET /api/users/1
Authorization: Bearer <admin_token>
```

#### Update User Status
```http
PATCH /api/users/1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "isActive": false
}
```

#### Update User Role
```http
PATCH /api/users/1/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "admin"
}
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Users Table
- `id` - Primary key
- `firstName`, `lastName` - User names
- `email` - Unique email address
- `phone` - Phone number
- `password` - Hashed password
- `companyName`, `companyType`, `companyRole` - B2B information
- `address` - JSON object with address details
- `role` - User role (customer, admin, super_admin)
- `isActive` - Account status
- `emailVerified` - Email verification status
- `resetPasswordToken`, `resetPasswordExpires` - Password reset fields
- `createdAt`, `updatedAt`, `lastLoginAt` - Timestamps

### Products Table
- `id` - Primary key
- `name`, `slug` - Product name and URL slug
- `brandId`, `categoryId` - Foreign keys
- `description`, `shortDescription` - Product descriptions
- `images` - JSON array of image URLs
- `specifications` - JSON object with product specs
- `pricing` - JSON object with pricing information
- `variants` - JSON array of product variants
- `isActive`, `isFeatured` - Status flags
- `sortOrder` - Display order
- `createdAt`, `updatedAt` - Timestamps

### Stories Table
- `id` - Primary key
- `title`, `slug` - Story title and URL slug
- `excerpt`, `content` - Story content
- `author`, `date` - Author and publication date
- `category` - Story category
- `image` - Featured image URL
- `featured` - Featured story flag
- `readTime` - Estimated read time
- `isActive` - Publication status
- `createdAt`, `updatedAt` - Timestamps

### Requests Table
- `id` - Primary key
- `userId` - Foreign key to users
- `requestNumber` - Unique request identifier
- `items` - JSON array of request items
- `totalAmount` - Total request amount
- `currency` - Currency code
- `status` - Request status
- `notes` - Additional notes
- `createdAt`, `updatedAt` - Timestamps

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: All inputs are validated using express-validator
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers
- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication
- **SQL Injection Protection**: Parameterized queries

## 📧 Email System

The backend includes a comprehensive email system with templates for:
- Welcome emails
- Password reset
- Request confirmations
- Request status updates

## 🚀 Deployment

### Environment Variables
Make sure to set all required environment variables in production.

### Database
- Use a production MySQL database
- Set up proper backups
- Configure connection pooling

### Security
- Use strong JWT secrets
- Enable HTTPS
- Set up proper CORS origins
- Configure rate limiting

### Process Management
Use PM2 or similar for process management:
```bash
npm install -g pm2
pm2 start server.js --name "ogla-backend"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, email oglatrade@gmail.com or call +233 54 152 8841.
