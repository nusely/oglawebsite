const express = require('express');
const { query: validatorQuery, body, validationResult } = require('express-validator');
const { pool, query } = require('../config/azure-database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadBrandLogo } = require('../config/cloudinary');

const router = express.Router();

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim('-'); // Remove leading/trailing hyphens
}

// Get all brands (public - only active)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const brands = await query(
      'SELECT * FROM brands WHERE isActive = 1 ORDER BY name ASC'
    );

    // Format brands for frontend compatibility
    const formattedBrands = brands.map(brand => ({
      ...brand,
      _id: brand.id, // Frontend expects _id
      logo: brand.logo_url, // Frontend expects logo
      website: brand.website_url, // Frontend expects website
      brandColors: brand.brandColors ? JSON.parse(brand.brandColors) : {}
    }));

    res.json({
      success: true,
      data: {
        brands: formattedBrands
      }
    });

  } catch (error) {
    console.error('❌ Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brands'
    });
  }
});

// Admin: Get all brands (including inactive)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent caching for admin endpoints
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    const brands = await query(
      'SELECT * FROM brands ORDER BY name ASC'
    );

    // Format brands for frontend compatibility
    const formattedBrands = brands.map(brand => ({
      ...brand,
      _id: brand.id, // Frontend expects _id
      logo: brand.logo_url, // Frontend expects logo
      website: brand.website_url, // Frontend expects website
      brandColors: brand.brandColors ? JSON.parse(brand.brandColors) : {}
    }));

    res.json({
      success: true,
      data: {
        brands: formattedBrands
      },
      timestamp: new Date().toISOString() // Add timestamp to prevent caching
    });

  } catch (error) {
    console.error('❌ Admin get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brands'
    });
  }
});

// Get products by brand (MUST come before /:slug route)
router.get('/:slug/products', optionalAuth, [
  validatorQuery('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  validatorQuery('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validatorQuery('featured').optional().isBoolean().withMessage('Featured must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { slug } = req.params;
    const { page = 1, limit = 12, featured } = req.query;
    const offset = (page - 1) * limit;

    // Get brand first
    const brands = await query(
      'SELECT * FROM brands WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const brand = brands[0];

    // Build where conditions
    const whereConditions = ['p.brandId = ?', 'p.isActive = 1'];
    const params = [brand.id];

    if (featured !== undefined) {
      whereConditions.push('p.isFeatured = ?');
      params.push(featured === 'true');
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p WHERE ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get products
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p
       LEFT JOIN brands b ON p.brandId = b.id
       LEFT JOIN categories c ON p.categoryId = c.id
       WHERE ${whereClause}
       ORDER BY p.isFeatured DESC, p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Parse JSON fields
    const processedProducts = products.map(product => {
      const parsedPricing = product.pricing ? JSON.parse(product.pricing) : {};
      
      return {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        specifications: product.specifications ? JSON.parse(product.specifications) : {},
        pricing: parsedPricing,
        price: parsedPricing.base || 0, // Add simple price field for frontend compatibility
        variants: product.variants ? JSON.parse(product.variants) : []
      };
    });

    // Format brand for frontend compatibility
    const formattedBrand = {
      ...brand,
      _id: brand.id, // Frontend expects _id
      logo: brand.logo_url, // Frontend expects logo
      website: brand.website_url, // Frontend expects website
      brandColors: brand.brandColors ? JSON.parse(brand.brandColors) : {}
    };

    res.json({
      success: true,
      data: {
        brand: formattedBrand,
        products: processedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get brand products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brand products'
    });
  }
});

// Get a single brand by slug (MUST come after /:slug/products route)
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const brands = await query(
      'SELECT * FROM brands WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (brands.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    const brand = brands[0];
    
    // Format brand for frontend compatibility
    const formattedBrand = {
      ...brand,
      _id: brand.id, // Frontend expects _id
      logo: brand.logo_url, // Frontend expects logo
      website: brand.website_url, // Frontend expects website
      brandColors: brand.brandColors ? JSON.parse(brand.brandColors) : {}
    };

    res.json({
      success: true,
      data: formattedBrand
    });

  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get brand'
    });
  }
});

// Admin: Create new brand
router.post('/', authenticateToken, requireAdmin, uploadBrandLogo.single('logo'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Brand name must be 2-100 characters'),
  body('description').optional().trim(),
  body('website_url').notEmpty().withMessage('Website URL is required').isURL().withMessage('Website must be a valid URL')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, description, website_url, brandColors, isActive } = req.body;
    
    // Generate slug from name
    let slug = generateSlug(name);
    
    // Ensure slug is unique by adding a number if needed
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingBrands = await query(
        'SELECT id FROM brands WHERE slug = ?',
        [slug]
      );
      
      if (existingBrands.length === 0) {
        break;
      }
      
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    
    // Handle logo file upload
    let logo_url = null;
    if (req.file) {
      logo_url = req.file.path; // Cloudinary URL
    }

    // Insert new brand and get ID - Azure SQL compatible
    const result = await query(
      `INSERT INTO brands (name, slug, description, logo_url, website_url, isActive) VALUES (?, ?, ?, ?, ?, ?);
       SELECT SCOPE_IDENTITY() as insertId;`,
      [name, slug, description || null, logo_url, website_url || null, isActive !== false]
    );

    // Get the insert ID from the result
    const insertId = result && result.length > 0 ? result[result.length - 1].insertId : null;
    
    if (!insertId) {
      throw new Error('Failed to get brand ID after creation');
    }

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: {
        id: insertId,
        name,
        slug,
        description,
        logo: logo_url,
        website: website_url,
        isActive: isActive !== false
      }
    });

  } catch (error) {
    console.error('Create brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create brand'
    });
  }
});

// Admin: Update brand
router.put('/:id', authenticateToken, requireAdmin, uploadBrandLogo.single('logo'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim(),
  body('website_url').notEmpty().withMessage('Website URL is required').isURL().withMessage('Website must be a valid URL'),
  body('isActive').optional().isBoolean()
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updateFields = [];
    const updateValues = [];

    // Handle name change - regenerate slug
    if (req.body.name) {
      let newSlug = generateSlug(req.body.name);
      
      // Ensure slug is unique by adding a number if needed
      let counter = 1;
      let originalSlug = newSlug;
      while (true) {
        const existingBrands = await query(
          'SELECT id FROM brands WHERE slug = ? AND id != ?',
          [newSlug, id]
        );
        
        if (existingBrands.length === 0) {
          break;
        }
        
        newSlug = `${originalSlug}-${counter}`;
        counter++;
      }
      
      updateFields.push('name = ?', 'slug = ?');
      updateValues.push(req.body.name, newSlug);
    }

    // Handle logo file upload
    if (req.file) {
      updateFields.push('logo_url = ?');
      updateValues.push(req.file.path); // Cloudinary URL
    }

    // Build dynamic update query for other fields
    Object.keys(req.body).forEach(key => {
      if (['description', 'website_url', 'isActive'].includes(key)) {
        if (key === 'website_url') {
          updateFields.push('website_url = ?');
        } else {
          updateFields.push(`${key} = ?`);
        }
        updateValues.push(req.body[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateValues.push(id);

    await query(
      `UPDATE brands SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Brand updated successfully'
    });

  } catch (error) {
    console.error('Update brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update brand'
    });
  }
});

// Admin: Delete brand (hard delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Delete request for brand ID:', id);

    // Check if brand exists
    const brands = await query('SELECT * FROM brands WHERE id = ?', [id]);
    console.log('🗑️ Found brands:', brands.length);
    
    if (brands.length === 0) {
      console.log('❌ Brand not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    console.log('✅ Brand found:', brands[0].name);

    // Check if brand has associated products
    const products = await query('SELECT COUNT(*) as count FROM products WHERE brandId = ?', [id]);
    console.log('🗑️ Associated products:', products[0].count);
    
    if (products[0].count > 0) {
      console.log('❌ Cannot delete - has products');
      return res.status(400).json({
        success: false,
        message: `Cannot delete brand. It has ${products[0].count} associated product(s). Please remove or reassign the products first.`
      });
    }

    // Check if brand has associated categories (if categories table exists)
    try {
      const categories = await query('SELECT COUNT(*) as count FROM categories WHERE brandId = ?', [id]);
      console.log('🗑️ Associated categories:', categories[0].count);
      
      if (categories[0].count > 0) {
        console.log('❌ Cannot delete - has categories');
        return res.status(400).json({
          success: false,
          message: `Cannot delete brand. It has ${categories[0].count} associated categor(ies). Please remove or reassign the categories first.`
        });
      }
    } catch (error) {
      console.log('🗑️ Categories table not found or no brandId column, skipping category check');
    }

    // Delete the brand
    console.log('🗑️ Proceeding with deletion...');
    const deleteResult = await query('DELETE FROM brands WHERE id = ?', [id]);
    console.log('🗑️ Delete result:', deleteResult);

    // Verify deletion
    const verifyBrand = await query('SELECT * FROM brands WHERE id = ?', [id]);
    console.log('🗑️ Verification - brands remaining:', verifyBrand.length);

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete brand'
    });
  }
});

module.exports = router;
