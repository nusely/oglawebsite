const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories based on file type
    let uploadPath = uploadsDir;
    
    if (file.fieldname === 'logo' || file.fieldname === 'image') {
      uploadPath = path.join(uploadsDir, 'images');
    } else if (file.fieldname === 'mainImage' || file.fieldname === 'additionalImages') {
      uploadPath = path.join(uploadsDir, 'products');
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  }
});

// Export different upload configurations
module.exports = {
  // Single image upload (for logos, main images)
  single: (fieldName) => upload.single(fieldName),
  
  // Multiple images upload (for product galleries)
  array: (fieldName, maxCount) => upload.array(fieldName, maxCount || 10),
  
  // Multiple fields upload
  fields: (fields) => upload.fields(fields),
  
  // Any upload
  any: () => upload.any()
};
