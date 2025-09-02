const { cloudinary } = require('./config/cloudinary');
const { query } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function migrateImagesToCloudinary() {
  try {
    console.log('Starting migration to Cloudinary...');

    // Get all products with local image paths
    const products = await query('SELECT id, name, images FROM products WHERE images IS NOT NULL');
    
    for (const product of products) {
      if (!product.images) continue;
      
      const images = JSON.parse(product.images);
      const newImages = [];
      
      for (const imagePath of images) {
        if (imagePath && imagePath.startsWith('/uploads/')) {
          const localPath = path.join(__dirname, '..', imagePath);
          
          if (fs.existsSync(localPath)) {
            try {
              console.log(`Uploading ${imagePath} to Cloudinary...`);
              
              const result = await cloudinary.uploader.upload(localPath, {
                folder: 'ogla/products',
                transformation: [
                  { width: 800, height: 800, crop: 'limit' },
                  { quality: 'auto', fetch_format: 'auto' }
                ]
              });
              
              newImages.push(result.secure_url);
              console.log(`✅ Uploaded: ${result.secure_url}`);
              
            } catch (uploadError) {
              console.error(`❌ Failed to upload ${imagePath}:`, uploadError.message);
              newImages.push(imagePath); // Keep original path if upload fails
            }
          } else {
            console.log(`⚠️ File not found: ${localPath}`);
            newImages.push(imagePath); // Keep original path
          }
        } else {
          newImages.push(imagePath); // Keep non-local paths
        }
      }
      
      // Update product with new image URLs
      await query(
        'UPDATE products SET images = ? WHERE id = ?',
        [JSON.stringify(newImages), product.id]
      );
      
      console.log(`Updated product: ${product.name}`);
    }
    
    console.log('Migration completed!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateImagesToCloudinary();
}

module.exports = { migrateImagesToCloudinary };

