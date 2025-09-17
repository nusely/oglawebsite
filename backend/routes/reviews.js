const express = require("express");
const { body, validationResult } = require("express-validator");
const { db, query, run } = require("../config/azure-database");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

// Optional authentication middleware - sets req.user if token is valid, but doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      // Use the same JWT verification as the main auth middleware
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      if (decoded) {
        // Get the full user data from database
        const user = await query(
          "SELECT id, firstName, lastName, email, role FROM users WHERE id = ?",
          [decoded.userId]
        );
        if (user.length > 0) {
          req.user = user[0];
          console.log("User authenticated via optionalAuth:", req.user);
        }
      }
    }
    next();
  } catch (error) {
    console.log("Optional auth failed (continuing as guest):", error.message);
    // Continue without authentication
    next();
  }
};

// Get all reviews for a product
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await query(
      `
      SELECT r.*, u.firstName, u.lastName, u.email
      FROM reviews r
      LEFT JOIN users u ON r.userId = u.id
      WHERE r.productId = ? AND r.isActive = 1
      ORDER BY r.createdAt DESC
    `,
      [productId]
    );

    // Format the reviews to match frontend expectations
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: review.createdAt,
      name:
        review.firstName && review.lastName
          ? `${review.firstName} ${review.lastName}`
          : review.email || "Anonymous",
      helpful: 0,
      userId: review.userId,
    }));

    res.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// Get all reviews (admin only)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const reviews = await query(`
      SELECT r.*, p.name as productName, p.slug as productSlug, u.firstName, u.lastName, u.email
      FROM reviews r
      LEFT JOIN products p ON r.productId = p.id
      LEFT JOIN users u ON r.userId = u.id
      ORDER BY r.createdAt DESC
    `);

    res.json(reviews);
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
});

// Add a new review
router.post(
  "/",
  optionalAuth,
  [
    body("productId")
      .isInt({ min: 1 })
      .withMessage("Valid product ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("comment")
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
    body("name")
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("Name must be between 1 and 100 characters"),
  ],
  async (req, res) => {
    console.log("Review submission request body:", req.body);
    console.log("Request user:", req.user);
    console.log("Authorization header:", req.headers.authorization);
    console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not set");
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { productId, rating, title, comment, name } = req.body;

      // Check if product exists and is active
      const product = await query(
        "SELECT id, name FROM products WHERE id = ? AND isActive = 1",
        [productId]
      );
      if (product.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      let userId = null;
      let reviewerName = name;

      // If user is authenticated, use their info
      if (req.user) {
        console.log("Using authenticated user:", req.user);
        userId = req.user.id;
        reviewerName = `${req.user.firstName} ${req.user.lastName}`;
        console.log("Set reviewerName to:", reviewerName);
      } else {
        console.log("No authenticated user, using guest name:", name);
      }

      // Check if user has already reviewed this product (only for logged-in users)
      if (userId) {
        const existingReview = await query(
          "SELECT id FROM reviews WHERE productId = ? AND userId = ? AND isActive = 1",
          [productId, userId]
        );
        if (existingReview.length > 0) {
          return res
            .status(400)
            .json({ message: "You have already reviewed this product" });
        }
      }

      // For guest users, we could add additional checks here if needed
      // For example, check by IP address or email if you want to prevent spam

      console.log("Inserting review with data:", {
        productId,
        userId,
        rating,
        title,
        comment,
      });

      // Insert the review
      const result = await run(
        `
      INSERT INTO reviews (productId, userId, rating, title, comment, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, 1, GETUTCDATE(), GETUTCDATE())
    `,
        [productId, userId, rating, title, comment]
      );

      console.log("Review inserted successfully with result:", result);

      // For now, just return success message
      // The frontend will refresh to show the new review
      res.status(201).json({
        message: "Review submitted successfully",
        success: true,
      });
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Error creating review" });
    }
  }
);

// Update a review (only by the author or admin)
router.put(
  "/:reviewId",
  authenticateToken,
  [
    body("rating")
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be between 1 and 200 characters"),
    body("comment")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Comment must be between 10 and 1000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { reviewId } = req.params;
      const { rating, title, comment } = req.body;

      // Check if review exists
      const existingReview = await query("SELECT * FROM reviews WHERE id = ?", [
        reviewId,
      ]);
      if (existingReview.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      const review = existingReview[0];

      // Check if user can edit this review
      if (req.user.role !== "admin" && review.userId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "You can only edit your own reviews" });
      }

      // Update the review
      await run(
        `
      UPDATE reviews 
      SET rating = COALESCE(?, rating), 
          title = COALESCE(?, title), 
          comment = COALESCE(?, comment), 
          updatedAt = GETUTCDATE()
      WHERE id = ?
    `,
        [rating, title, comment, reviewId]
      );

      res.json({ message: "Review updated successfully" });
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ message: "Error updating review" });
    }
  }
);

// Delete a review (soft delete)
router.delete("/:reviewId", authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const existingReview = await query("SELECT * FROM reviews WHERE id = ?", [
      reviewId,
    ]);
    if (existingReview.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = existingReview[0];

    // Check if user can delete this review
    if (req.user.role !== "admin" && review.userId !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own reviews" });
    }

    // Soft delete the review
    await run(
      "UPDATE reviews SET isActive = 0, updatedAt = GETUTCDATE() WHERE id = ?",
      [reviewId]
    );

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review" });
  }
});

// Admin: Toggle review status
router.patch(
  "/:reviewId/toggle-status",
  authenticateToken,
  async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }

      const { reviewId } = req.params;

      // Check if review exists
      const existingReview = await query("SELECT * FROM reviews WHERE id = ?", [
        reviewId,
      ]);
      if (existingReview.length === 0) {
        return res.status(404).json({ message: "Review not found" });
      }

      const currentStatus = existingReview[0].isActive;
      const newStatus = currentStatus ? 0 : 1;

      await run(
        "UPDATE reviews SET isActive = ?, updatedAt = GETUTCDATE() WHERE id = ?",
        [newStatus, reviewId]
      );

      res.json({
        message: `Review ${
          newStatus ? "activated" : "deactivated"
        } successfully`,
        isActive: newStatus,
      });
    } catch (error) {
      console.error("Error toggling review status:", error);
      res.status(500).json({ message: "Error toggling review status" });
    }
  }
);

// Get review statistics for a product
router.get("/product/:productId/stats", async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await query(
      `
      SELECT 
        COUNT(*) as totalReviews,
        AVG(rating) as averageRating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStar,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStar,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStar,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStar,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStar
      FROM reviews 
      WHERE productId = ? AND isActive = 1
    `,
      [productId]
    );

    if (stats.length === 0) {
      return res.json({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      });
    }

    const stat = stats[0];
    const ratingDistribution = {
      5: stat.fiveStar || 0,
      4: stat.fourStar || 0,
      3: stat.threeStar || 0,
      2: stat.twoStar || 0,
      1: stat.oneStar || 0,
    };

    res.json({
      totalReviews: stat.totalReviews || 0,
      averageRating: parseFloat(stat.averageRating || 0).toFixed(1),
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching review stats:", error);
    res.status(500).json({ message: "Error fetching review statistics" });
  }
});

module.exports = router;
