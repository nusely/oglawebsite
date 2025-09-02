const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for different upload types
const productImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ogla/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

const brandLogoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ogla/brands',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 400, height: 400, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

const categoryImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ogla/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 600, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

const storyImageStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ogla/stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' }
    ]
  }
});

// Create multer upload instances
const uploadProductImage = multer({ storage: productImageStorage });
const uploadBrandLogo = multer({ storage: brandLogoStorage });
const uploadCategoryImage = multer({ storage: categoryImageStorage });
const uploadStoryImage = multer({ storage: storyImageStorage });

// Helper function to get optimized image URL
const getOptimizedImageUrl = (publicId, options = {}) => {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

// Helper function to delete image
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadProductImage,
  uploadBrandLogo,
  uploadCategoryImage,
  uploadStoryImage,
  getOptimizedImageUrl,
  deleteImage
};

