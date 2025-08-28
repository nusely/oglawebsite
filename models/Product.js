const mongoose = require('mongoose');

// Variant schema for product options (size, color, etc.)
const variantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  options: [{
    type: String,
    required: true,
    trim: true
  }]
});

// Bulk pricing schema for B2B pricing tiers
const bulkPricingSchema = new mongoose.Schema({
  minQuantity: {
    type: Number,
    required: true,
    min: 1
  },
  maxQuantity: {
    type: Number,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

// Product specifications schema (flexible for different product types)
const specificationsSchema = new mongoose.Schema({
  weight: String,
  dimensions: String,
  material: String,
  origin: String,
  processing: String,
  ingredients: [String],
  shelfLife: String,
  packaging: String,
  certifications: [String],
  // Additional fields can be added dynamically
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: 200
  },
  images: [{
    type: String,
    required: true
  }],
  specifications: {
    type: specificationsSchema,
    default: {}
  },
  pricing: {
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'GHS',
      enum: ['GHS', 'USD', 'EUR']
    },
    bulkPricing: [bulkPricingSchema]
  },
  variants: [variantSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  meta: {
    keywords: [String],
    seoDescription: String
  }
}, {
  timestamps: true
});

// Indexes for performance
productSchema.index({ brandId: 1 });
productSchema.index({ categoryId: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ sortOrder: 1 });

// Virtual for getting the brand
productSchema.virtual('brand', {
  ref: 'Brand',
  localField: 'brandId',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting the category
productSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

// Virtual for getting the main image
productSchema.virtual('mainImage').get(function() {
  return this.images && this.images.length > 0 ? this.images[0] : null;
});

// Method to calculate price based on quantity
productSchema.methods.calculatePrice = function(quantity = 1) {
  if (!this.pricing.bulkPricing || this.pricing.bulkPricing.length === 0) {
    return this.pricing.unitPrice * quantity;
  }

  // Find the appropriate bulk pricing tier
  const bulkTier = this.pricing.bulkPricing.find(tier => {
    if (tier.maxQuantity) {
      return quantity >= tier.minQuantity && quantity <= tier.maxQuantity;
    }
    return quantity >= tier.minQuantity;
  });

  const pricePerUnit = bulkTier ? bulkTier.price : this.pricing.unitPrice;
  return pricePerUnit * quantity;
};

// Method to get available variants
productSchema.methods.getAvailableVariants = function() {
  return this.variants.map(variant => ({
    name: variant.name,
    options: variant.options
  }));
};

// Static method to find products by brand
productSchema.statics.findByBrand = function(brandId, options = {}) {
  const query = { brandId, isActive: true };
  
  if (options.featured) {
    query.isFeatured = true;
  }
  
  return this.find(query)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isActive: true, isFeatured: true })
    .populate('brand', 'name slug brandColors')
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 });
};

// Static method to search products
productSchema.statics.search = function(searchTerm, filters = {}) {
  const query = { isActive: true };
  
  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { shortDescription: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  if (filters.brandId) {
    query.brandId = filters.brandId;
  }
  
  if (filters.categoryId) {
    query.categoryId = filters.categoryId;
  }
  
  return this.find(query)
    .populate('brand', 'name slug')
    .populate('category', 'name slug')
    .sort({ sortOrder: 1, createdAt: -1 });
};

// Ensure virtuals are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure slug is unique
productSchema.pre('save', async function(next) {
  if (this.isModified('slug') || this.isNew) {
    const existingProduct = await this.constructor.findOne({
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingProduct) {
      throw new Error('Product slug must be unique');
    }
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
