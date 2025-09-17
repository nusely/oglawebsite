const express = require('express');
const { query: validatorQuery, body, validationResult } = require('express-validator');
const { pool, query } = require('../config/azure-database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { single } = require('../middleware/upload');

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

// Get all categories
router.get('/', optionalAuth, async (req, res) => {
  try {
    const categories = await query(
      'SELECT * FROM categories WHERE isActive = 1 ORDER BY name ASC'
    );

    res.json({
      success: true,
      data: {
        categories: categories
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get categories'
    });
  }
});

// Get a single category by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const categories = await query(
      'SELECT * FROM categories WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category'
    });
  }
});

// Get products by category
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

    // Get category first
    const categories = await query(
      'SELECT * FROM categories WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    const category = categories[0];

    // Build where conditions
    const whereConditions = ['p.categoryId = ?', 'p.isActive = 1'];
    const params = [category.id];

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
      if (product.images) {
        try {
          product.images = JSON.parse(product.images);
        } catch (e) {
          product.images = [];
        }
      }
      if (product.specifications) {
        try {
          product.specifications = JSON.parse(product.specifications);
        } catch (e) {
          product.specifications = {};
        }
      }
      if (product.pricing) {
        try {
          product.pricing = JSON.parse(product.pricing);
        } catch (e) {
          product.pricing = {};
        }
      }
      if (product.variants) {
        try {
          product.variants = JSON.parse(product.variants);
        } catch (e) {
          product.variants = [];
        }
      }
      return product;
    });

    res.json({
      success: true,
      data: {
        category,
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
    console.error('Get category products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category products'
    });
  }
});

// Admin: Create new category
router.post('/', authenticateToken, requireAdmin, single('image'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Category name must be 2-100 characters'),
  body('description').optional().trim()
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

    const { name, description, isActive } = req.body;
    
    // Generate slug from name
    let slug = generateSlug(name);
    
    // Ensure slug is unique by adding a number if needed
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingCategories = await query(
        'SELECT id FROM categories WHERE slug = ?',
        [slug]
      );
      
      if (existingCategories.length === 0) {
        break;
      }
      
      slug = `${originalSlug}-${counter}`;
      counter++;
    }
    
    // Handle image file upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/images/${req.file.filename}`;
    }

    // Insert new category and get ID - Azure SQL compatible
    const result = await query(
      `INSERT INTO categories (name, slug, description, image, isActive) VALUES (?, ?, ?, ?, ?);
       SELECT SCOPE_IDENTITY() as insertId;`,
      [name, slug, description || null, image_url, isActive !== false]
    );

    // Get the insert ID from the result
    const insertId = result && result.length > 0 ? result[result.length - 1].insertId : null;
    
    if (!insertId) {
      throw new Error('Failed to get category ID after creation');
    }

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        id: insertId,
        name,
        slug,
        description,
        image: image_url,
        isActive: isActive !== false
      }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create category'
    });
  }
});

// Admin: Update category
router.put('/:id', authenticateToken, requireAdmin, single('image'), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim(),
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
        const existingCategories = await query(
          'SELECT id FROM categories WHERE slug = ? AND id != ?',
          [newSlug, id]
        );
        
        if (existingCategories.length === 0) {
          break;
        }
        
        newSlug = `${originalSlug}-${counter}`;
        counter++;
      }
      
      updateFields.push('name = ?', 'slug = ?');
      updateValues.push(req.body.name, newSlug);
    }

    // Handle image file upload
    if (req.file) {
      updateFields.push('image = ?');
      updateValues.push(`/uploads/images/${req.file.filename}`);
    }

    // Build dynamic update query for other fields
    Object.keys(req.body).forEach(key => {
      if (['description', 'isActive'].includes(key)) {
        updateFields.push(`${key} = ?`);
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
      `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    res.json({
      success: true,
      message: 'Category updated successfully'
    });

  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update category'
    });
  }
});

// Admin: Delete category (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // First, check if this category has any products
    const productsInCategory = await query(
      'SELECT COUNT(*) as count FROM products WHERE categoryId = ? AND isActive = 1',
      [id]
    );

    const productCount = productsInCategory[0].count;

    if (productCount > 0) {
      // Get the default category ID
      const defaultCategory = await query(
        'SELECT id FROM categories WHERE slug = "ogla-category" OR name = "Ogla Category"'
      );

      if (defaultCategory.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category: Default category not found. Please run setup-default-category.js first.'
        });
      }

      const defaultCategoryId = defaultCategory[0].id;

      // Migrate all products in this category to the default category
      await query(
        'UPDATE products SET categoryId = ? WHERE categoryId = ?',
        [defaultCategoryId, id]
      );

      // Now soft delete the category
      await query(
        'UPDATE categories SET isActive = 0 WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: `Category deleted successfully. ${productCount} products migrated to default category.`
      });
    } else {
      // No products in this category, safe to delete
      await query(
        'UPDATE categories SET isActive = 0 WHERE id = ?',
        [id]
      );

      res.json({
        success: true,
        message: 'Category deleted successfully (no products were affected).'
      });
    }

  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete category'
    });
  }
});

module.exports = router;
