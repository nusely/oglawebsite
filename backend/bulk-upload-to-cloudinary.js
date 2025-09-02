require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const FRONTEND_IMAGES_PATH = path.join(__dirname, '../frontend/public/images');
const urlMapping = {};

async function uploadImage(filePath, cloudinaryPath) {
  try {
    console.log(`📤 Uploading: ${cloudinaryPath}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `ogla/static/${cloudinaryPath.replace(/\\/g, '/')}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    const originalPath = `/images/${cloudinaryPath.replace(/\\/g, '/')}`;
    urlMapping[originalPath] = result.secure_url;
    
    console.log(`✅ Uploaded: ${originalPath} → ${result.secure_url}`);
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to upload ${cloudinaryPath}:`, error.message);
    return null;
  }
}

async function walkDirectory(dir, relativePath = '') {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const itemRelativePath = path.join(relativePath, item);
    
    if (fs.statSync(fullPath).isDirectory()) {
      console.log(`📁 Processing directory: ${itemRelativePath}`);
      await walkDirectory(fullPath, itemRelativePath);
    } else if (isImageFile(item)) {
      await uploadImage(fullPath, itemRelativePath);
    }
  }
}

function isImageFile(filename) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

async function main() {
  try {
    console.log('🚀 Starting bulk upload to Cloudinary...');
    console.log(`📂 Source: ${FRONTEND_IMAGES_PATH}`);
    
    // Test connection first
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    
    // Upload all images
    await walkDirectory(FRONTEND_IMAGES_PATH);
    
    // Save URL mapping
    const mappingFile = path.join(__dirname, 'cloudinary-url-mapping.json');
    fs.writeFileSync(mappingFile, JSON.stringify(urlMapping, null, 2));
    
    console.log('\n🎉 Upload complete!');
    console.log(`📊 Total images uploaded: ${Object.keys(urlMapping).length}`);
    console.log(`💾 URL mapping saved to: ${mappingFile}`);
    
    // Show some examples
    console.log('\n📋 Sample URL mappings:');
    Object.entries(urlMapping).slice(0, 5).forEach(([old, newUrl]) => {
      console.log(`  ${old} → ${newUrl}`);
    });
    
    if (Object.keys(urlMapping).length > 5) {
      console.log(`  ... and ${Object.keys(urlMapping).length - 5} more`);
    }
    
  } catch (error) {
    console.error('❌ Error during bulk upload:', error.message);
  }
}

main();
