const express = require('express');
const { body, query: validatorQuery, validationResult } = require('express-validator');
const { pool, query } = require('../config/azure-database');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { uploadProductImage, deleteImage } = require('../config/cloudinary');
const { logActivity } = require('./activities');

// Helper: extract Cloudinary public ID from URL
function getCloudinaryPublicIdFromUrl(url) {
  try {
    if (!url) return null;
    const parsed = new URL(url);
    const path = parsed.pathname;
    const uploadIndex = path.indexOf('/upload/');
    if (uploadIndex === -1) return null;
    let afterUpload = path.substring(uploadIndex + '/upload/'.length);
    afterUpload = afterUpload.replace(/^v\d+\//, '');
    afterUpload = afterUpload.replace(/^\//, '');
    const lastDot = afterUpload.lastIndexOf('.');
    if (lastDot !== -1) afterUpload = afterUpload.substring(0, lastDot);
    return afterUpload;
  } catch (e) {
    return null;
  }
}

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

// Get all products with filtering and pagination
router.get('/', optionalAuth, [
  validatorQuery('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  validatorQuery('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validatorQuery('search').optional().isString().withMessage('Search must be a string'),
  validatorQuery('brand').optional().isString().withMessage('Brand must be a string'),
  validatorQuery('category').optional().isString().withMessage('Category must be a string'),
  validatorQuery('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  validatorQuery('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  validatorQuery('featured').optional().isBoolean().withMessage('Featured must be a boolean'),
  validatorQuery('inStock').optional().isBoolean().withMessage('In stock must be a positive number')
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

    const {
      page = 1,
      limit = 12,
      search,
      brand,
      category,
      minPrice,
      maxPrice,
      featured,
      inStock
    } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = ['p.isActive = 1'];
    const params = [];

    // Add search condition
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ? OR p.shortDescription LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add brand filter
    if (brand) {
      whereConditions.push('b.slug = ?');
      params.push(brand);
    }

    // Add category filter
    if (category) {
      whereConditions.push('c.slug = ?');
      params.push(category);
    }

    // Add price filters (SQLite doesn't have JSON_EXTRACT, so we'll filter after query)
    // We'll handle price filtering in the application layer

    // Add featured filter
    if (featured !== undefined) {
      whereConditions.push('p.isFeatured = ?');
      params.push(featured === 'true');
    }

    // Add in stock filter (you can implement inventory logic here)
    if (inStock !== undefined) {
      // For now, we'll assume all products are in stock
      // You can add inventory tracking later
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get products
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE ${whereClause}
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    // Parse JSON fields
    const formattedProducts = products.map(product => {
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

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products'
    });
  }
});

// Get single product by slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.slug = ? AND p.isActive = 1`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    // Parse JSON fields
    const parsedPricing = product.pricing ? JSON.parse(product.pricing) : {};
    const formattedProduct = {
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      specifications: product.specifications ? JSON.parse(product.specifications) : {},
      pricing: parsedPricing,
      price: parsedPricing.base || 0, // Add simple price field for frontend compatibility
      variants: product.variants ? JSON.parse(product.variants) : []
    };

    res.json({
      success: true,
      data: formattedProduct
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get product'
    });
  }
});

// Get featured products
router.get('/featured/featured', optionalAuth, async (req, res) => {
  try {
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.isFeatured = 1 AND p.isActive = 1
       ORDER BY p.createdAt DESC
       LIMIT 8`
    );

    // Parse JSON fields
    const formattedProducts = products.map(product => {
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

    res.json({
      success: true,
      data: formattedProducts
    });

  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get featured products'
    });
  }
});

// Get products by brand
router.get('/brand/:brandSlug', optionalAuth, async (req, res) => {
  try {
    const { brandSlug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       WHERE b.slug = ? AND p.isActive = 1`,
      [brandSlug]
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get products
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE b.slug = ? AND p.isActive = 1
       ORDER BY p.createdAt DESC
       LIMIT ? OFFSET ?`,
      [brandSlug, parseInt(limit), offset]
    );

    // Parse JSON fields
    const formattedProducts = products.map(product => {
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

    res.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get products by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get products by brand'
    });
  }
});

// Get related products
router.get('/:slug/related', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    // Get current product to find related ones
    const currentProduct = await query(
      'SELECT brandId, categoryId FROM products WHERE slug = ? AND isActive = 1',
      [slug]
    );

    if (currentProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { brandId, categoryId } = currentProduct[0];

    // Get related products (same brand or category, excluding current product)
    const products = await query(
      `SELECT p.*, b.name as brandName, b.slug as brandSlug, c.name as categoryName, c.slug as categorySlug
       FROM products p 
       LEFT JOIN brands b ON p.brandId = b.id 
       LEFT JOIN categories c ON p.categoryId = c.id 
       WHERE p.isActive = 1 AND p.slug != ? AND (p.brandId = ? OR p.categoryId = ?)
       ORDER BY p.isFeatured DESC, p.sortOrder ASC, p.createdAt DESC
       LIMIT 6`,
      [slug, brandId, categoryId]
    );

    // Parse JSON fields
    const formattedProducts = products.map(product => {
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

    res.json({
      success: true,
      data: formattedProducts
    });

  } catch (error) {
    console.error('Get related products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get related products'
    });
  }
});

// Admin routes (require authentication and admin role)
router.use(authenticateToken, requireAdmin);

// Create new product
router.post('/', uploadProductImage.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), [
  body('name').trim().isLength({ min: 2, max: 200 }).withMessage('Product name must be 2-200 characters'),
  body('brandId').isInt({ min: 1 }).withMessage('Valid brand ID is required'),
  body('categoryId').isInt({ min: 1 }).withMessage('Valid category ID is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('shortDescription').optional().isLength({ max: 500 }).withMessage('Short description must be max 500 characters'),
  body('specifications').optional().isString().withMessage('Specifications must be a JSON string'),
  body('pricing').isString().withMessage('Pricing must be a JSON string'),
  body('variants').optional().isString().withMessage('Variants must be a JSON string'),
  body('isFeatured').optional().isIn(['0', '1', 'true', 'false']).withMessage('Featured must be 0, 1, true, or false'),
  body('isActive').optional().isIn(['0', '1', 'true', 'false']).withMessage('Active must be 0, 1, true, or false')
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

    const {
      name,
      brandId,
      categoryId,
      description,
      shortDescription,
      specifications,
      pricing,
      variants,
      isFeatured,
      isActive
    } = req.body;

    // Convert string values to proper boolean/integer values
    const isFeaturedValue = isFeatured === '1' || isFeatured === 'true' || isFeatured === true;
    const isActiveValue = isActive === '1' || isActive === 'true' || isActive === true;

    // Generate slug from name
    let slug = generateSlug(name);
    
    // Ensure slug is unique by adding a number if needed
    let counter = 1;
    let originalSlug = slug;
    while (true) {
      const existingProducts = await query(
        'SELECT id FROM products WHERE slug = ?',
        [slug]
      );
      
      if (existingProducts.length === 0) {
        break;
      }
      
      slug = `${originalSlug}-${counter}`;
      counter++;
    }

    // Handle file uploads
    let mainImageUrl = null;
    let additionalImageUrls = [];

    if (req.files.mainImage && req.files.mainImage[0]) {
      mainImageUrl = req.files.mainImage[0].path; // Cloudinary URL
    }

    if (req.files.additionalImages) {
      additionalImageUrls = req.files.additionalImages.map(file => file.path); // Cloudinary URLs
    }

    // Parse JSON strings
    const parsedSpecifications = specifications ? JSON.parse(specifications) : null;
    const parsedPricing = pricing ? JSON.parse(pricing) : null;
    const parsedVariants = variants ? JSON.parse(variants) : null;

    // Check if product with slug already exists
    const existingProducts = await query(
      'SELECT id FROM products WHERE slug = ?',
      [slug]
    );

    if (existingProducts.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product with this slug already exists'
      });
    }

    // Insert new product and get the ID - Azure SQL compatible
    const result = await query(
      `INSERT INTO products (
        name, slug, brandId, categoryId, description, shortDescription,
        images, specifications, pricing, variants, isFeatured, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      SELECT SCOPE_IDENTITY() as insertId;`,
      [
        name,
        slug,
        brandId,
        categoryId,
        description || null,
        shortDescription || null,
        JSON.stringify([mainImageUrl, ...additionalImageUrls]),
        JSON.stringify(parsedSpecifications),
        JSON.stringify(parsedPricing),
        JSON.stringify(parsedVariants),
        isFeaturedValue,
        isActiveValue
      ]
    );

    // Get the insert ID from the result
    const insertId = result && result.length > 0 ? result[result.length - 1].insertId : null;
    
    if (!insertId) {
      throw new Error('Failed to get product ID after creation');
    }

    // Log product creation activity
    await logActivity(req.user.id, 'product_created', 'product', insertId, 'Admin created new product', req, {
      productName: name,
      slug: slug,
      brandId: brandId,
      categoryId: categoryId,
      isFeatured: isFeaturedValue,
      isActive: isActiveValue
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: {
        id: insertId,
        slug
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', uploadProductImage.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'additionalImages', maxCount: 10 }
]), [
  body('name').optional().trim().isLength({ min: 2, max: 200 }),
  body('brandId').optional().isInt({ min: 1 }),
  body('categoryId').optional().isInt({ min: 1 }),
  body('description').optional().isString(),
  body('shortDescription').optional().isLength({ max: 500 }),
  body('specifications').optional().isString(),
  body('pricing').optional().isString(),
  body('variants').optional().isString(),
  body('isFeatured').optional().isIn(['0', '1', 'true', 'false']),
  body('isActive').optional().isIn(['0', '1', 'true', 'false'])
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
        const existingProducts = await query(
          'SELECT id FROM products WHERE slug = ? AND id != ?',
          [newSlug, id]
        );
        
        if (existingProducts.length === 0) {
          break;
        }
        
        newSlug = `${originalSlug}-${counter}`;
        counter++;
      }
      
      updateFields.push('name = ?', 'slug = ?');
      updateValues.push(req.body.name, newSlug);
    }

    // Handle file uploads
    let imageUrls = [];
    
    if (req.files.mainImage && req.files.mainImage[0]) {
      imageUrls.push(req.files.mainImage[0].path); // Cloudinary URL
    }
    
    if (req.files.additionalImages) {
      const additionalImageUrls = req.files.additionalImages.map(file => file.path); // Cloudinary URLs
      imageUrls = [...imageUrls, ...additionalImageUrls];
    }
    
    if (imageUrls.length > 0) {
      // If new images were uploaded, replace existing images entirely with these new ones.
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(imageUrls));
    }

    // Handle removals if no new uploads provided
    const removeMainImage = req.body.removeMainImage === '1' || req.body.removeMainImage === 'true' || req.body.removeMainImage === true;
    const removeAdditional = Array.isArray(req.body['removeAdditional[]']) ? req.body['removeAdditional[]'] : (req.body.removeAdditional || req.body.removeAdditionalIndexes);
    let removeIndexes = [];
    if (Array.isArray(removeAdditional)) {
      removeIndexes = removeAdditional.map(i => parseInt(i, 10)).filter(n => !Number.isNaN(n));
    } else if (typeof removeAdditional === 'string') {
      // Comma-separated indexes
      removeIndexes = removeAdditional.split(',').map(i => parseInt(i, 10)).filter(n => !Number.isNaN(n));
    }

    if (removeMainImage || removeIndexes.length > 0) {
      // Fetch current images array
      const current = await query('SELECT images FROM products WHERE id = ?', [id]);
      const currentImages = current && current[0] && current[0].images ? JSON.parse(current[0].images) : [];

      // Prepare new images array
      let newImages = [...currentImages];

      // Remove main image
      if (removeMainImage && newImages[0]) {
        const publicId = getCloudinaryPublicIdFromUrl(newImages[0]);
        if (publicId) {
          try { await deleteImage(publicId); } catch (e) { console.warn('Cloudinary delete failed (main):', publicId, e.message); }
        }
        newImages[0] = null;
      }

      // Remove additional indexes
      for (const idx of removeIndexes) {
        const actualIndex = idx + 1; // additional starts after main
        if (newImages[actualIndex]) {
          const publicId = getCloudinaryPublicIdFromUrl(newImages[actualIndex]);
          if (publicId) {
            try { await deleteImage(publicId); } catch (e) { console.warn('Cloudinary delete failed (additional):', publicId, e.message); }
          }
          newImages[actualIndex] = null;
        }
      }

      // Compact the array and remove nulls
      newImages = newImages.filter(Boolean);

      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(newImages));
    }

    // Build dynamic update query for other fields
    Object.keys(req.body).forEach(key => {
      if (['brandId', 'categoryId', 'description', 'shortDescription', 'specifications', 'pricing', 'variants', 'isFeatured', 'isActive'].includes(key)) {
        updateFields.push(`${key} = ?`);
        if (['specifications', 'pricing', 'variants'].includes(key)) {
          updateValues.push(req.body[key] ? req.body[key] : null);
        } else if (key === 'isFeatured') {
          // Convert string to boolean/integer
          const isFeaturedValue = req.body[key] === '1' || req.body[key] === 'true' || req.body[key] === true;
          updateValues.push(isFeaturedValue);
        } else if (key === 'isActive') {
          // Convert string to boolean/integer
          const isActiveValue = req.body[key] === '1' || req.body[key] === 'true' || req.body[key] === true;
          updateValues.push(isActiveValue);
        } else {
          updateValues.push(req.body[key]);
        }
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
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Log product update activity
    await logActivity(req.user.id, 'product_updated', 'product', id, 'Admin updated product', req, {
      productId: id,
      updatedFields: Object.keys(req.body)
    });

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product (soft delete)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE products SET isActive = 0 WHERE id = ?',
      [id]
    );

    // Log product deletion activity
    await logActivity(req.user.id, 'product_deleted', 'product', id, 'Admin deleted product', req, {
      productId: id
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Bulk operations for products
router.post('/bulk/delete', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    // Soft delete multiple products
    const placeholders = productIds.map(() => '?').join(',');
    await query(
      `UPDATE products 
      SET isActive = 0, updatedAt = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `, productIds);

    // Log bulk delete activity
    await logActivity(req.user.id, 'bulk_products_deleted', 'product', null, `Admin deleted ${productIds.length} products`, req, {
      productIds: productIds,
      deletedCount: productIds.length
    });

    res.json({ 
      message: `Successfully deleted ${productIds.length} product(s)`,
      deletedCount: productIds.length
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({ message: 'Error performing bulk delete' });
  }
});

// Bulk update product status
router.post('/bulk/update-status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { productIds, status } = req.body;
    
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }

    if (status === undefined || ![0, 1].includes(status)) {
      return res.status(400).json({ message: 'Valid status (0 or 1) is required' });
    }

    // Update status for multiple products
    const placeholders = productIds.map(() => '?').join(',');
    await query(
      `UPDATE products 
      SET isActive = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id IN (${placeholders})
    `, [status, ...productIds]);

    // Log bulk status update activity
    await logActivity(req.user.id, 'bulk_products_status_updated', 'product', null, `Admin updated status for ${productIds.length} products`, req, {
      productIds: productIds,
      updatedCount: productIds.length,
      newStatus: status
    });

    res.json({ 
      message: `Successfully updated status for ${productIds.length} product(s)`,
      updatedCount: productIds.length,
      newStatus: status
    });

  } catch (error) {
    console.error('Error in bulk status update:', error);
    res.status(500).json({ message: 'Error performing bulk status update' });
  }
});

// Export products to CSV
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { includeInactive = 'false' } = req.query;
    const showOnlyActive = includeInactive !== 'true';

    const products = await query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.pricing,
        p.isActive,
        p.createdAt,
        p.updatedAt,
        b.name as brandName,
        c.name as categoryName
      FROM products p
      LEFT JOIN brands b ON p.brandId = b.id
      LEFT JOIN categories c ON p.categoryId = c.id
      ${showOnlyActive ? 'WHERE p.isActive = 1' : ''}
      ORDER BY p.createdAt DESC
    `);

    // Convert to CSV format
    const csvHeader = 'ID,Name,Description,Price,Status,Brand,Category,Created,Updated\n';
    const csvRows = products.map(product => {
      // Parse pricing JSON to get base price
      let price = 'Contact for pricing';
      try {
        if (product.pricing) {
          const pricingData = JSON.parse(product.pricing);
          price = pricingData.base ? `₵${pricingData.base}` : 'Contact for pricing';
        }
      } catch (e) {
        price = 'Contact for pricing';
      }
      
      return `${product.id},"${product.name || ''}","${product.description || ''}","${price}",${product.isActive ? 'Active' : 'Inactive'},"${product.brandName || ''}","${product.categoryName || ''}","${product.createdAt || ''}","${product.updatedAt || ''}"`;
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Log CSV export activity
    await logActivity(req.user.id, 'products_exported_csv', 'product', null, 'Admin exported products to CSV', req, {
      exportCount: products.length,
      filename: 'products-export.csv',
      includeInactive: !showOnlyActive,
      activeOnly: showOnlyActive
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="products-export.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Error exporting products:', error);
    res.status(500).json({ message: 'Error exporting products' });
  }
});

module.exports = router;
