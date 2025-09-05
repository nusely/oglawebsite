// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651328/ogla/static/laveedaimageplaceholder.png/laveedaimageplaceholder.png';
  
  // Debug logging
  console.log('getImageUrl input:', imagePath);
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('getImageUrl output (full URL):', imagePath);
    return imagePath;
  }
  
  // If it starts with /uploads, prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    const backendUrl = 'http://192.168.0.123:5000';
    const fullUrl = `${backendUrl}${imagePath}`;
    console.log('getImageUrl output (uploads):', fullUrl);
    return fullUrl;
  }
  
  // If it's a relative path, assume it's in the public folder
  console.log('getImageUrl output (relative):', imagePath);
  return imagePath;
};

// Utility function to get the first image from a product
export const getProductImage = (product) => {
  if (product.images && product.images.length > 0) {
    return getImageUrl(product.images[0]);
  }
  if (product.image) {
    return getImageUrl(product.image);
  }
  return 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651328/ogla/static/laveedaimageplaceholder.png/laveedaimageplaceholder.png';
};

