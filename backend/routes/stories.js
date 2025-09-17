const express = require("express");
const {
  body,
  query: validatorQuery,
  validationResult,
} = require("express-validator");
const { pool, query } = require("../config/azure-database");
const {
  authenticateToken,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");
const { uploadStoryImage, deleteImage } = require("../config/cloudinary");

const router = express.Router();

// Test endpoint for content sanitization (remove in production)
router.post("/test-sanitize", (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const sanitized = sanitizeContent(content);
    res.json({
      original: content,
      sanitized: sanitized,
      originalLength: content.length,
      sanitizedLength: sanitized.length,
      entitiesFound: {
        "&mdash;": (content.match(/&mdash;/g) || []).length,
        "&rsquo;": (content.match(/&rsquo;/g) || []).length,
        "&hellip;": (content.match(/&hellip;/g) || []).length,
        "&#8217;": (content.match(/&#8217;/g) || []).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test endpoint for HTML entity decoding (remove in production)
router.post("/test-entities", (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const decoded = decodeHtmlEntities(content);
    res.json({
      original: content,
      decoded: decoded,
      entitiesFound: {
        "&mdash;": (content.match(/&mdash;/g) || []).length,
        "&rsquo;": (content.match(/&rsquo;/g) || []).length,
        "&hellip;": (content.match(/&hellip;/g) || []).length,
        "&#8217;": (content.match(/&#8217;/g) || []).length,
        "&amp;": (content.match(/&amp;/g) || []).length,
        "&quot;": (content.match(/&quot;/g) || []).length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim("-"); // Remove leading/trailing hyphens
}

// Helper function to calculate read time (average 200 words per minute)
function calculateReadTime(content) {
  const wordCount = content.trim().split(/\s+/).length;
  const readTimeMinutes = Math.ceil(wordCount / 200);
  return readTimeMinutes;
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  const entities = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&mdash;": "-",
    "&ndash;": "-",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&hellip;": "...",
    "&copy;": "(c)",
    "&reg;": "(R)",
    "&trade;": "(TM)",
    "&apos;": "'",
    "&cent;": "¢",
    "&pound;": "£",
    "&euro;": "€",
    "&deg;": "°",
    "&plusmn;": "±",
    "&times;": "×",
    "&divide;": "÷",
  };

  let decoded = text;
  for (const [entity, replacement] of Object.entries(entities)) {
    decoded = decoded.replace(new RegExp(entity, "g"), replacement);
  }

  // Also handle numeric entities like &#8217; (right single quote)
  decoded = decoded.replace(/&#(\d+);/g, (match, dec) => {
    return String.fromCharCode(dec);
  });

  return decoded;
}

// Helper function to strip HTML and convert to clean plain text
function sanitizeContent(content) {
  if (!content) return content;

  console.log("🧹 Before sanitization:", content.substring(0, 200) + "...");

  let sanitized = content;

  // Step 1: Remove all HTML tags and convert to plain text
  sanitized = sanitized.replace(/<[^>]*>/g, " ");

  // Step 2: Decode HTML entities using comprehensive decoder
  sanitized = decodeHtmlEntities(sanitized);

  // Step 3: Clean up excessive whitespace and normalize
  sanitized = sanitized.replace(/\s+/g, " "); // Multiple spaces to single space
  sanitized = sanitized.replace(/\n\s*\n/g, "\n\n"); // Multiple newlines to double newlines
  sanitized = sanitized.trim(); // Remove leading/trailing whitespace

  // Step 4: Add proper paragraph breaks for readability
  sanitized = sanitized.replace(/\n\n+/g, "\n\n"); // Normalize paragraph breaks

  console.log(
    "🧹 After sanitization (plain text):",
    sanitized.substring(0, 200) + "..."
  );

  return sanitized;
}

// Helper: extract Cloudinary public ID from a Cloudinary URL
function getCloudinaryPublicIdFromUrl(url) {
  try {
    if (!url) return null;
    const parsed = new URL(url);
    const path = parsed.pathname; // e.g. /image/upload/v12345/ogla/stories/filename.jpg
    const uploadIndex = path.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    let afterUpload = path.substring(uploadIndex + "/upload/".length); // v12345/ogla/stories/filename.jpg
    // Strip version segment if present (v12345/)
    afterUpload = afterUpload.replace(/^v\d+\//, ""); // ogla/stories/filename.jpg
    // Remove leading slash if any
    afterUpload = afterUpload.replace(/^\//, "");
    // Drop file extension
    const lastDot = afterUpload.lastIndexOf(".");
    if (lastDot !== -1) {
      afterUpload = afterUpload.substring(0, lastDot);
    }
    return afterUpload; // e.g. ogla/stories/filename
  } catch (e) {
    return null;
  }
}

// Get all stories with pagination
router.get(
  "/",
  optionalAuth,
  [
    validatorQuery("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    validatorQuery("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
    validatorQuery("featured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be a boolean"),
    validatorQuery("category")
      .optional()
      .isString()
      .withMessage("Category must be a string"),
  ],
  async (req, res) => {
    try {
      // Set cache control for public stories (allow short-term caching)
      res.set({
        "Cache-Control": "public, max-age=300", // 5 minutes cache
        ETag: `stories-${Date.now()}`,
      });

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { page = 1, limit = 10, featured, category } = req.query;

      const offset = (page - 1) * limit;
      const whereConditions = ["isActive = 1"];
      const params = [];

      // Add featured filter
      if (featured !== undefined) {
        whereConditions.push("isFeatured = ?");
        params.push(featured === "true");
      }

      // Add category filter
      if (category) {
        whereConditions.push("category = ?");
        params.push(category);
      }

      const whereClause = whereConditions.join(" AND ");

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM stories WHERE ${whereClause}`,
        params
      );

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      // Get stories
      const stories = await query(
        `SELECT TOP ${parseInt(limit)} * FROM stories WHERE ${whereClause}`,
        params
      );

      res.json({
        success: true,
        data: {
          stories,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get stories",
      });
    }
  }
);

// Get stories for popup (returns array in exact StoryPopup format)
router.get("/popup-stories", optionalAuth, async (req, res) => {
  try {
    const stories = await query(
      "SELECT TOP 10 id, title, excerpt, slug FROM stories WHERE isActive = 1 ORDER BY isFeatured DESC, createdAt DESC"
    );

    // Format stories to match StoryPopup mock data structure exactly
    const formattedStories = stories.map((story) => ({
      id: story.id,
      title: story.title,
      excerpt:
        story.excerpt || `Discover more about ${story.title.toLowerCase()}...`,
      slug: story.slug,
    }));

    res.json({
      success: true,
      data: formattedStories,
    });
  } catch (error) {
    console.error("Get popup stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get popup stories",
    });
  }
});

// Get single story by slug
router.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const stories = await query(
      "SELECT * FROM stories WHERE slug = ? AND isActive = 1",
      [slug]
    );

    if (stories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.json({
      success: true,
      data: stories[0],
    });
  } catch (error) {
    console.error("Get story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get story",
    });
  }
});

// Get featured stories
router.get("/featured/featured", optionalAuth, async (req, res) => {
  try {
    const stories = await query(
      "SELECT TOP(3) * FROM stories WHERE featured = 1 AND isActive = 1 ORDER BY date DESC, createdAt DESC"
    );

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Get featured stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured stories",
    });
  }
});

// Get random story for popup
router.get("/random/popup", optionalAuth, async (req, res) => {
  try {
    const stories = await query(
      "SELECT TOP(1) id, title, excerpt, slug FROM stories WHERE isActive = 1 ORDER BY NEWID()"
    );

    if (stories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No stories available",
      });
    }

    res.json({
      success: true,
      data: stories[0],
    });
  } catch (error) {
    console.error("Get random story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get random story",
    });
  }
});

// Get all stories for admin (including inactive ones) - temporarily removed auth
router.get("/admin/all", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Prevent caching for admin endpoints
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    const { page = 1, limit = 50, featured, category } = req.query;

    const offset = (page - 1) * limit;
    const whereConditions = []; // No isActive filter for admin
    const params = [];

    // Add featured filter
    if (featured !== undefined) {
      whereConditions.push("isFeatured = ?");
      params.push(featured === "true");
    }

    // Add category filter
    if (category) {
      whereConditions.push("category = ?");
      params.push(category);
    }

    const whereClause =
      whereConditions.length > 0 ? whereConditions.join(" AND ") : "1=1";

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM stories WHERE ${whereClause}`,
      params
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Get stories (all stories for admin)
    const stories = await query(
      `SELECT * FROM stories WHERE ${whereClause} ORDER BY isFeatured DESC, createdAt DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY`,
      [...params, offset, parseInt(limit)]
    );

    res.json({
      success: true,
      data: {
        stories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
        },
      },
      timestamp: new Date().toISOString(), // Add timestamp to prevent caching
    });
  } catch (error) {
    console.error("Get admin stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stories",
    });
  }
});

// Create new story
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  uploadStoryImage.single("image"),
  [
    body("title")
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be 5-200 characters"),
    body("excerpt")
      .optional()
      .trim()
      .custom((value) => {
        if (value && value.length > 0 && value.length < 10) {
          throw new Error("Excerpt must be at least 10 characters if provided");
        }
        if (value && value.length > 500) {
          throw new Error("Excerpt must be no more than 500 characters");
        }
        return true;
      }),
    body("content")
      .trim()
      .isLength({ min: 50 })
      .withMessage("Content must be at least 50 characters"),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be a boolean"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("Active must be a boolean"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors
          .array()
          .map((err) => err.msg)
          .join(", ");
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          errors: errors.array(),
        });
      }

      const {
        title,
        excerpt,
        content,
        isFeatured = false,
        isActive = true,
      } = req.body;

      // Normalize flags to booleans for consistent storage in SQLite
      const isFeaturedValue =
        isFeatured === "1" || isFeatured === "true" || isFeatured === true;
      const isActiveValue =
        isActive === "1" || isActive === "true" || isActive === true;

      // Handle image file upload (Cloudinary)
      let imageUrl = null;
      if (req.file) {
        imageUrl = req.file.path; // Cloudinary URL
      }

      // Generate slug from title
      let slug = generateSlug(title);

      // Ensure slug is unique by adding a number if needed
      let counter = 1;
      let originalSlug = slug;
      while (true) {
        const existingStories = await query(
          "SELECT id FROM stories WHERE slug = ?",
          [slug]
        );

        if (existingStories.length === 0) {
          break;
        }

        slug = `${originalSlug}-${counter}`;
        counter++;
      }

      // Sanitize content from rich text editor
      const sanitizedContent = sanitizeContent(content);

      // Calculate read time
      const readTime = calculateReadTime(sanitizedContent);

      // Get author from authenticated user
      const author = req.user.firstName + " " + req.user.lastName;

      // Check if story with slug already exists
      const existingStories = await query(
        "SELECT id FROM stories WHERE slug = ?",
        [slug]
      );

      if (existingStories.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Story with this slug already exists",
        });
      }

      // Insert new story and get ID - Azure SQL compatible
      const result = await query(
        `INSERT INTO stories (
        title, slug, excerpt, content, image_url, author, readTime, isFeatured, isActive
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
      SELECT SCOPE_IDENTITY() as insertId;`,
        [
          title,
          slug,
          excerpt || null,
          sanitizedContent,
          imageUrl,
          author,
          readTime,
          isFeaturedValue,
          isActiveValue,
        ]
      );

      // Get the insert ID from the result
      const insertId = result && result.length > 0 ? result[result.length - 1].insertId : null;
      
      if (!insertId) {
        throw new Error('Failed to get story ID after creation');
      }

      res.status(201).json({
        success: true,
        message: "Story created successfully",
        data: {
          id: insertId,
          slug,
        },
      });
    } catch (error) {
      console.error("Create story error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create story",
      });
    }
  }
);

// Update story
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  uploadStoryImage.single("image"),
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage("Title must be 5-200 characters"),
    body("excerpt")
      .optional()
      .trim()
      .custom((value) => {
        if (value && value.length > 0 && value.length < 10) {
          throw new Error("Excerpt must be at least 10 characters if provided");
        }
        if (value && value.length > 500) {
          throw new Error("Excerpt must be no more than 500 characters");
        }
        return true;
      }),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 50 })
      .withMessage("Content must be at least 50 characters"),
    body("isFeatured")
      .optional()
      .isBoolean()
      .withMessage("Featured must be a boolean"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("Active must be a boolean"),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors
          .array()
          .map((err) => err.msg)
          .join(", ");
        return res.status(400).json({
          success: false,
          message: `Validation failed: ${errorMessages}`,
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateFields = [];
      const updateValues = [];

      // Handle title change - regenerate slug and recalculate read time
      if (req.body.title) {
        let newSlug = generateSlug(req.body.title);

        // Ensure slug is unique by adding a number if needed
        let counter = 1;
        let originalSlug = newSlug;
        while (true) {
          const existingStories = await query(
            "SELECT id FROM stories WHERE slug = ? AND id != ?",
            [newSlug, id]
          );

          if (existingStories.length === 0) {
            break;
          }

          newSlug = `${originalSlug}-${counter}`;
          counter++;
        }

        updateFields.push("title = ?", "slug = ?");
        updateValues.push(req.body.title, newSlug);
      }

      // Handle content change - recalculate read time
      if (req.body.content) {
        const sanitizedContent = sanitizeContent(req.body.content);
        const readTime = calculateReadTime(sanitizedContent);
        updateFields.push("content = ?", "readTime = ?");
        updateValues.push(sanitizedContent, readTime);
      }

      // Handle image file upload (Cloudinary)
      if (req.file) {
        // If uploading a new image, replace the old URL
        updateFields.push("image_url = ?");
        updateValues.push(req.file.path); // Cloudinary URL
      }

      // Handle image removal
      const removeImage =
        req.body.removeImage === "1" ||
        req.body.removeImage === "true" ||
        req.body.removeImage === true;
      if (removeImage && !req.file) {
        // Fetch current image URL
        const current = await query(
          "SELECT image_url FROM stories WHERE id = ?",
          [id]
        );
        const currentUrl = current && current[0] ? current[0].image_url : null;
        if (currentUrl) {
          const publicId = getCloudinaryPublicIdFromUrl(currentUrl);
          if (publicId) {
            try {
              await deleteImage(publicId);
            } catch (e) {
              // Log and continue; not critical if cloud delete fails
              console.warn(
                "Cloudinary delete failed for story image:",
                publicId,
                e.message
              );
            }
          }
        }
        updateFields.push("image_url = NULL");
      }

      // Build dynamic update query for other fields
      Object.keys(req.body).forEach((key) => {
        if (["excerpt", "isFeatured", "isActive"].includes(key)) {
          updateFields.push(`${key} = ?`);
          if (key === "isFeatured") {
            const value =
              req.body[key] === "1" ||
              req.body[key] === "true" ||
              req.body[key] === true;
            updateValues.push(value);
          } else if (key === "isActive") {
            const value =
              req.body[key] === "1" ||
              req.body[key] === "true" ||
              req.body[key] === true;
            updateValues.push(value);
          } else {
            updateValues.push(req.body[key]);
          }
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields to update",
        });
      }

      updateValues.push(id);

      await query(
        `UPDATE stories SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      res.json({
        success: true,
        message: "Story updated successfully",
      });
    } catch (error) {
      console.error("Update story error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update story",
      });
    }
  }
);

// Delete story (soft delete)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // First check if story exists
    const existingStory = await query("SELECT * FROM stories WHERE id = ?", [
      id,
    ]);

    if (existingStory.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Perform soft delete
    await query("UPDATE stories SET isActive = 0 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete story",
    });
  }
});

module.exports = router;
