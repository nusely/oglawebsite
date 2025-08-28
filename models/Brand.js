const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['La Veeda', 'AfriSmocks', 'OgriBusiness']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    required: true
  },
  bannerImage: {
    type: String,
    required: true
  },
  brandColors: {
    primary: {
      type: String,
      required: true
    },
    secondary: {
      type: String,
      required: true
    },
    accent: {
      type: String,
      required: true
    }
  },
  designStyle: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });

// Virtual for getting all products in this brand
brandSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'brandId'
});

// Virtual for getting all categories in this brand
brandSchema.virtual('categories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'brandId'
});

// Ensure virtuals are serialized
brandSchema.set('toJSON', { virtuals: true });
brandSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Brand', brandSchema);
