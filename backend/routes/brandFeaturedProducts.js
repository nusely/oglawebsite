const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { db, query, run } = require("../config/database");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { logActivity } = require("./activities");
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
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
    console.log("✅ Brand Featured Products table initialized");
  } catch (error) {
    console.error(
      "❌ Error initializing brand featured products table:",
      error
    );
  }
};

// Initialize table on module load
initializeBrandFeaturedProductsTable();

/* -------------------------
   Helper: uploadToCloudinary
   ------------------------- */
async function uploadToCloudinary(
  buffer,
  folder = "ogla/brand-featured-products"
) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

/* ============================
   ROUTES
   - All routes assume `query` and `run` are promise wrappers around sqlite operations
   =============================*/

/**
 * GET /api/brand-featured-products/
 * Admin only - list all brand featured products
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
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

    res.json({ success: true, data: { featuredProducts } });
  } catch (error) {
    console.error("Error fetching brand featured products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching brand featured products",
    });
  }
});

/**
 * GET /api/brand-featured-products/brand/:brandSlug
 * Public endpoint to get the latest featured product for a brand by brand slug
 */
router.get("/brand/:brandSlug", async (req, res) => {
  try {
    const { brandSlug } = req.params;

    const rows = await query(
      `
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE b.slug = ? AND bfp.isActive = 1
      ORDER BY bfp.createdAt DESC
      LIMIT 1
    `,
      [brandSlug]
    );

    const featuredProduct = rows.length ? rows[0] : null;

    res.json({ success: true, data: { featuredProduct } });
  } catch (error) {
    console.error("Error fetching featured product for brand:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching featured product" });
  }
});

/**
 * GET /api/brand-featured-products/available-products/:brandId
 * Admin only - get available products for a specific brand
 * NOTE: We SELECT p.image as mainImage to keep API shape expected by frontend,
 * but read from the `image` column in DB.
 */
router.get(
  "/available-products/:brandId",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { brandId } = req.params;

      const products = await query(
        `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.pricing as price,
        p.image as mainImage,
        p.slug,
        p.brandId,
        c.name as categoryName,
        b.name as brandName
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      LEFT JOIN brands b ON p.brandId = b.id
      WHERE p.brandId = ? AND p.isActive = 1
      ORDER BY p.name
    `,
        [brandId]
      );

      res.json({ success: true, data: { products } });
    } catch (error) {
      console.error("Error fetching available products for brand:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching available products for brand",
      });
    }
  }
);

/**
 * POST /api/brand-featured-products/
 * Admin only - create new featured product
 * Accepts multipart form with optional file `image` or `image` field as URL
 */
router.post(
  "/",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { brandId, productId, name, description, price } = req.body;

      if (!brandId || !name || !price) {
        return res.status(400).json({
          success: false,
          message: "Brand ID, name, and price are required",
        });
      }

      // Validate brand exists
      const brandExists = await query("SELECT id FROM brands WHERE id = ?", [
        brandId,
      ]);
      if (brandExists.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Brand not found" });
      }

      // Validate productId optionally
      if (productId) {
        const productExists = await query(
          "SELECT id FROM products WHERE id = ?",
          [productId]
        );
        if (productExists.length === 0) {
          return res
            .status(400)
            .json({ success: false, message: "Product not found" });
        }
      }

      // upload image if provided
      let imageUrl = "";
      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res
            .status(500)
            .json({ success: false, message: "Failed to upload image" });
        }
      } else if (req.body.image) {
        imageUrl = req.body.image;
      } else {
        return res.status(400).json({
          success: false,
          message: "Image file or image URL is required",
        });
      }

      const result = await run(
        `
      INSERT INTO brand_featured_products (brandId, productId, name, description, price, image, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `,
        [brandId, productId || null, name, description || null, price, imageUrl]
      );

      const newFeaturedProduct = await query(
        `
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE bfp.id = ?
    `,
        [result.id]
      );

      await logActivity(
        req.user.id,
        "featured_product_added",
        "brand_featured_product",
        result.id,
        "Admin added featured product for brand",
        req,
        {
          brandId,
          productId,
          productName: name,
          brandName: newFeaturedProduct[0]?.brandName || "Unknown",
        }
      );

      res.status(201).json({
        success: true,
        message: "Brand featured product created successfully",
        data: { featuredProduct: newFeaturedProduct[0] },
      });
    } catch (error) {
      console.error("Error creating brand featured product:", error);
      res.status(500).json({
        success: false,
        message: "Error creating brand featured product",
      });
    }
  }
);

/**
 * PUT /api/brand-featured-products/:id
 * Admin only - update a featured product
 */
router.put(
  "/:id",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      const { id } = req.params;
      const { brandId, productId, name, description, price, isActive } =
        req.body;

      // Read existing product so we can keep existing image if none uploaded
      const existingRows = await query(
        "SELECT * FROM brand_featured_products WHERE id = ?",
        [id]
      );
      if (existingRows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Brand featured product not found",
        });
      }

      let imageUrl = existingRows[0].image;

      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          return res
            .status(500)
            .json({ success: false, message: "Failed to upload image" });
        }
      } else if (req.body.image) {
        imageUrl = req.body.image;
      }

      await run(
        `
      UPDATE brand_featured_products 
      SET brandId = ?, productId = ?, name = ?, description = ?, price = ?, image = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
        [
          brandId || existingRows[0].brandId,
          productId || existingRows[0].productId,
          name || existingRows[0].name,
          description || existingRows[0].description,
          price || existingRows[0].price,
          imageUrl,
          typeof isActive !== "undefined" ? isActive : existingRows[0].isActive,
          id,
        ]
      );

      const updatedProduct = await query(
        `
      SELECT 
        bfp.*,
        b.name as brandName,
        b.slug as brandSlug
      FROM brand_featured_products bfp
      LEFT JOIN brands b ON bfp.brandId = b.id
      WHERE bfp.id = ?
    `,
        [id]
      );

      await logActivity(
        req.user.id,
        "featured_product_updated",
        "brand_featured_product",
        id,
        "Admin updated featured product",
        req,
        {
          featuredProductId: id,
          brandId,
          productId,
          productName: name || updatedProduct[0]?.name,
        }
      );

      res.json({
        success: true,
        message: "Brand featured product updated successfully",
        data: { featuredProduct: updatedProduct[0] },
      });
    } catch (error) {
      console.error("Error updating brand featured product:", error);
      res.status(500).json({
        success: false,
        message: "Error updating brand featured product",
      });
    }
  }
);

/**
 * DELETE /api/brand-featured-products/:id
 * Admin only - delete a featured product
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { id } = req.params;

    const existingProduct = await query(
      "SELECT id FROM brand_featured_products WHERE id = ?",
      [id]
    );
    if (existingProduct.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Brand featured product not found" });
    }

    await run("DELETE FROM brand_featured_products WHERE id = ?", [id]);

    await logActivity(
      req.user.id,
      "featured_product_removed",
      "brand_featured_product",
      id,
      "Admin removed featured product",
      req,
      { featuredProductId: id }
    );

    res.json({
      success: true,
      message: "Brand featured product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting brand featured product:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting brand featured product",
    });
  }
});

module.exports = router;
