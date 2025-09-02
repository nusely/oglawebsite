const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { db, query, run } = require('../config/database');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { logActivity } = require('./activities');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// Create brand_featured_products table if it doesn't exist
const initializeBrandFeaturedProductsTable = async () => {
  try {
    await run(`
      CREATE TABLE IF NOT EXISTS brand_featured_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brandId INTEGER NOT NULL,
        productId INTEGER,
        name TEXT NOT NULL,
        description TEXT,
        price TEXT NOT NULL,
        image TEXT NOT NULL,
        isActive BOOLEAN DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (brandId) REFERENCES brands (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Brand Featured Products table initialized');
  } catch (error) {
    console.error('❌ Error initializing brand featured products table:', error);
  }
};

// Initialize table on module load
initializeBrandFeaturedProductsTable();

// Get all brand featured products (admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const featuredProducts = await query(`
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug,
        p.name as productName,
        p.slug as productSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      LEFT JOIN products p ON bfp.productId = p.id
      ORDER BY bfp.brandId, bfp.createdAt DESC
    `);

    res.json({
      success: true,
      data: {
        featuredProducts
      }
    });

  } catch (error) {
    console.error('Error fetching brand featured products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching brand featured products' 
    });
  }
});

// Get featured product by brand slug (public endpoint)
router.get('/brand/:brandSlug', async (req, res) => {
  try {
    const { brandSlug } = req.params;

    const featuredProduct = await query(`
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE b.slug = ? AND bfp.isActive = 1
      ORDER BY bfp.createdAt DESC
      LIMIT 1
    `, [brandSlug]);

    if (featuredProduct.length === 0) {
      return res.json({
        success: true,
        data: {
          featuredProduct: null
        }
      });
    }

    res.json({
      success: true,
      data: {
        featuredProduct: featuredProduct[0]
      }
    });

  } catch (error) {
    console.error('Error fetching featured product for brand:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching featured product' 
    });
  }
});

// Create new brand featured product (admin only)
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { brandId, productId, name, description, price } = req.body;

    // Validate required fields
    if (!brandId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Brand ID, name, and price are required'
      });
    }

    // Check if brand exists
    const brandExists = await query('SELECT id FROM brands WHERE id = ?', [brandId]);
    if (brandExists.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // If productId is provided, check if product exists
    if (productId) {
      const productExists = await query('SELECT id FROM products WHERE id = ?', [productId]);
      if (productExists.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Product not found'
        });
      }
    }

    let imageUrl = '';

    // Handle image upload if file is provided
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'ogla/brand-featured-products',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          stream.end(req.file.buffer);
        });
        
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    } else if (req.body.image) {
      // Fallback to URL if provided
      imageUrl = req.body.image;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Image file or URL is required'
      });
    }

    // Insert new featured product
    const result = await run(`
      INSERT INTO brand_featured_products (brandId, productId, name, description, price, image, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [brandId, productId, name, description, price, imageUrl]);

    // Get the created featured product
    const newFeaturedProduct = await query(`
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE bfp.id = ?
    `, [result.id]);

    // Log featured product creation activity
    await logActivity(req.user.id, 'featured_product_added', 'brand_featured_product', result.id, 'Admin added featured product for brand', req, {
      brandId: brandId,
      productId: productId,
      productName: name,
      brandName: newFeaturedProduct[0]?.brandName || 'Unknown'
    });

    res.status(201).json({
      success: true,
      message: 'Brand featured product created successfully',
      data: {
        featuredProduct: newFeaturedProduct[0]
      }
    });

  } catch (error) {
    console.error('Error creating brand featured product:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating brand featured product'
    });
  }
});

// Update brand featured product (admin only)
router.put('/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;
    const { brandId, productId, name, description, price, isActive } = req.body;

    // Check if featured product exists
    const existingProduct = await query('SELECT id FROM brand_featured_products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand featured product not found'
      });
    }

    let imageUrl = existingProduct[0].image; // Keep existing image by default

    // Handle image upload if new file is provided
    if (req.file) {
      try {
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'ogla/brand-featured-products',
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          stream.end(req.file.buffer);
        });
        
        imageUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image'
        });
      }
    } else if (req.body.image) {
      // Use provided URL
      imageUrl = req.body.image;
    }

    // Update the featured product
    await run(`
      UPDATE brand_featured_products 
      SET brandId = ?, productId = ?, name = ?, description = ?, price = ?, image = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [brandId, productId, name, description, price, imageUrl, isActive, id]);

    // Log featured product update activity
    await logActivity(req.user.id, 'featured_product_updated', 'brand_featured_product', id, 'Admin updated featured product', req, {
      featuredProductId: id,
      brandId: brandId,
      productId: productId,
      productName: name
    });

    // Get the updated featured product
    const updatedProduct = await query(`
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE bfp.id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Brand featured product updated successfully',
      data: {
        featuredProduct: updatedProduct[0]
      }
    });

  } catch (error) {
    console.error('Error updating brand featured product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating brand featured product'
    });
  }
});

// Delete brand featured product (admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { id } = req.params;

    // Check if featured product exists
    const existingProduct = await query('SELECT id FROM brand_featured_products WHERE id = ?', [id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand featured product not found'
      });
    }

    // Delete the featured product
    await run('DELETE FROM brand_featured_products WHERE id = ?', [id]);

    // Log featured product deletion activity
    await logActivity(req.user.id, 'featured_product_removed', 'brand_featured_product', id, 'Admin removed featured product', req, {
      featuredProductId: id
    });

    res.json({
      success: true,
      message: 'Brand featured product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting brand featured product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting brand featured product'
    });
  }
});

// Get available products for a specific brand (admin only)
router.get('/available-products/:brandId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { brandId } = req.params;

    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.mainImage,
        p.slug,
        p.brandId,
        c.name as categoryName,
        b.name as brandName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN brands b ON p.brandId = b.id
      WHERE p.brandId = ? AND p.isActive = 1
      ORDER BY p.name
    `, [brandId]);

    res.json({
      success: true,
      data: {
        products
      }
    });

  } catch (error) {
    console.error('Error fetching available products for brand:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available products for brand'
    });
  }
});

module.exports = router;
