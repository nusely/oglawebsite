require('dotenv').config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');

// Show first few characters of each
if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('Cloud Name starts with:', process.env.CLOUDINARY_CLOUD_NAME.substring(0, 3) + '...');
}
if (process.env.CLOUDINARY_API_KEY) {
  console.log('API Key starts with:', process.env.CLOUDINARY_API_KEY.substring(0, 3) + '...');
}
