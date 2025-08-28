# Ogla Trading Frontend

A React-based frontend for Ogla Shea Butter & General Trading, featuring three distinct brands: La Veeda (cosmetics), AfriSmocks (clothing), and OgriBusiness (agriculture).

## 🚀 Quick Start

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   The app will open automatically at `http://localhost:3000`

## 🧪 Testing What We've Built

### 1. **Homepage (`/`)**
- ✅ Beautiful hero section with Northern Ghana messaging
- ✅ Brand showcase with 3 brand cards (La Veeda, AfriSmocks, OgriBusiness)
- ✅ Featured products carousel
- ✅ Story section about Lawra, Ghana
- ✅ Call-to-action sections

### 2. **Brand Pages (`/brands/:brandSlug`)**
Test these URLs:
- `/brands/la-veeda` - La Veeda cosmetics brand page
- `/brands/afrismocks` - AfriSmocks clothing brand page  
- `/brands/ogribusiness` - OgriBusiness agriculture brand page

Each brand page features:
- ✅ Brand-specific hero section with custom colors
- ✅ Product carousels showcasing featured products
- ✅ Complete product collections
- ✅ Brand-specific features and benefits
- ✅ Origin story from Lawra, Northern Ghana

### 3. **Navigation**
- ✅ Header with responsive navigation
- ✅ Brand dropdown menu
- ✅ Mobile-friendly hamburger menu
- ✅ Search functionality (UI only)
- ✅ Shopping cart icon (UI only)

### 4. **Product Pages**
- ✅ `/products` - All products listing
- ✅ `/products/:productSlug` - Individual product detail pages
- ✅ Product cards with hover effects
- ✅ Brand-specific styling

### 5. **Contact Page**
- ✅ `/contact` - Contact form and information
- ✅ Contact details for Lawra, Ghana

## 🎨 Features to Test

### **Responsive Design**
- Test on desktop, tablet, and mobile
- Navigation adapts to screen size
- Product carousels are responsive

### **Brand-Specific Styling**
- Each brand has unique color schemes:
  - **La Veeda**: Brown/orange tones (#8B4513, #D2691E, #F4A460)
  - **AfriSmocks**: Vibrant orange/yellow (#FF6B35, #F7931E, #FFD23F)
  - **OgriBusiness**: Green tones (#2E7D32, #4CAF50, #8BC34A)

### **Animations**
- Smooth page transitions
- Hover effects on product cards
- Loading animations

### **Product Carousels**
- Auto-playing slideshows
- Navigation arrows
- Responsive design (4 items on desktop, fewer on mobile)

## 📱 Sample Data

The app currently uses mock data for:
- 3 brands (La Veeda, AfriSmocks, OgriBusiness)
- 3 sample products (Pure Shea Butter, Men's Traditional Smock, Premium Black Beans)

## 🔧 Development Notes

- **Mock Data**: Currently using mock data since backend isn't ready
- **API Ready**: Frontend is prepared to connect to backend API
- **Responsive**: Works on all device sizes
- **Modern UI**: Clean, professional design with smooth animations

## 🐛 Troubleshooting

If you encounter issues:

1. **Port already in use**: Try `npm start -- --port 3001`
2. **Dependencies issues**: Delete `node_modules` and run `npm install` again
3. **Build errors**: Check console for specific error messages

## 📁 Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/     # Reusable components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── styles/        # Global styles
│   ├── App.js         # Main app component
│   └── index.js       # Entry point
└── package.json
```

## 🎯 Next Steps

Once you've tested the frontend, we can:
1. Build the backend API
2. Connect frontend to real data
3. Add shopping cart functionality
4. Implement user authentication
5. Add admin panel

---

**Happy Testing! 🎉**
