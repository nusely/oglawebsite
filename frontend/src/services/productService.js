import api from './api';

// Product API calls
export const productService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.search) params.append('search', filters.search);
    if (filters.featured) params.append('featured', 'true');
    
    return api.get(`/products?${params.toString()}`);
  },

  // Get a single product by slug
  getProduct: async (slug) => {
    return api.get(`/products/${slug}`);
  },

  // Get featured products
  getFeaturedProducts: async () => {
    return api.get('/products/featured');
  },

  // Get products by brand
  getProductsByBrand: async (brandId, options = {}) => {
    const params = new URLSearchParams();
    if (options.featured) params.append('featured', 'true');
    
    return api.get(`/brands/${brandId}/products?${params.toString()}`);
  },

  // Search products
  searchProducts: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams();
    params.append('search', searchTerm);
    
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    
    return api.get(`/products/search?${params.toString()}`);
  }
};

// Brand API calls
export const brandService = {
  // Get all brands
  getBrands: async () => {
    return api.get('/brands');
  },

  // Get a single brand by slug
  getBrand: async (slug) => {
    return api.get(`/brands/${slug}`);
  },

  // Get brand with products
  getBrandWithProducts: async (slug) => {
    return api.get(`/brands/${slug}/products`);
  }
};

// Category API calls
export const categoryService = {
  // Get categories by brand
  getCategoriesByBrand: async (brandId) => {
    return api.get(`/brands/${brandId}/categories`);
  },

  // Get products by category
  getProductsByCategory: async (categoryId) => {
    return api.get(`/categories/${categoryId}/products`);
  }
};

// Mock data for development (when backend is not ready)
export const mockData = {
  brands: [
    {
      _id: '1',
      name: 'La Veeda',
      slug: 'la-veeda',
      description: 'Premium Quality Shea Butter, African Black Soap, and Natural Skincare Products. Sustainably sourced and traditionally handcrafted, our products deliver deep nourishment, gentle cleansing, and long-lasting care - pure beauty from nature, made for you.',
      logo: '/images/brands/la-veeda-logo.png',
      bannerImage: '/images/brands/la-veeda-banner.jpg',
      brandColors: {
        primary: '#1b4332',
        secondary: '#e8d77c',
        accent: '#ffffff'
      },
      designStyle: 'Clean, elegant, with cosmetic-focused photography, inclusive male/female models',
      website: 'https://oglasheabutter.com/brand/la-veeda'
    },
    {
      _id: '2',
      name: 'AfriSmocks',
      slug: 'afrismocks',
      description: 'Authentic Ghanaian smocks, African prints, and kente cloth.',
      logo: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651270/ogla/static/brands/afrismocks-logo.png/afrismocks-logo.png',
      bannerImage: '/images/brands/afrismocks-banner.jpg',
      brandColors: {
        primary: '#1E40AF',
        secondary: '#3B82F6',
        accent: '#FFFFFF'
      },
      designStyle: 'Cultural, stylish, bold colors with a blend of traditional and modern aesthetics',
      website: 'https://oglasheabutter.com/brand/afrismocks'
    },
    {
      _id: '3',
      name: 'OgriBusiness',
      slug: 'ogribusiness',
      description: 'Premium agricultural products and bulk farm produce from Northern Ghana.',
      logo: '/images/brands/ogribusiness-logo.png',
      bannerImage: '/images/brands/ogribusiness-banner.jpg',
      brandColors: {
        primary: '#2E7D32',
        secondary: '#4CAF50',
        accent: '#8BC34A'
      },
      designStyle: 'Earthy tones, farm/nature imagery to reflect large-scale production',
      website: 'https://oglasheabutter.com/brand/ogribusiness'
    }
  ],
  
  products: [
    {
      _id: '1',
      name: 'Pure Shea Butter',
      slug: 'pure-shea-butter',
      brandId: '1',
      categoryId: '1',
      description: '100% pure, unrefined shea butter sourced from Lawra, Northern Ghana.',
      shortDescription: 'Natural moisturizer for all skin types',
      images: [
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651294/ogla/static/brands/laveeda_cat/BlackSoap_Gel.webp/BlackSoap_Gel.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651293/ogla/static/brands/laveeda_cat/25Kg_unrefined_shea.webp/25Kg_unrefined_shea.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651296/ogla/static/brands/laveeda_cat/la_veeda_250ml_shea.webp/la_veeda_250ml_shea.jpg'
      ],
      specifications: {
        weight: '500g',
        origin: 'Lawra, Northern Ghana',
        processing: 'Unrefined, Cold-pressed',
        ingredients: ['100% Pure Shea Butter'],
        shelfLife: '24 months',
        packaging: 'Food-grade plastic container'
      },
      pricing: {
        unitPrice: 45.00,
        currency: 'GHS',
        bulkPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 40.00 },
          { minQuantity: 50, maxQuantity: 99, price: 35.00 },
          { minQuantity: 100, maxQuantity: null, price: 30.00 }
        ]
      },
      variants: [
        {
          name: 'Size',
          options: ['250g', '500g', '1kg']
        }
      ],
      isFeatured: true,
      sortOrder: 1,
      reviews: [
        {
          id: 1,
          rating: 5,
          title: 'Excellent Quality',
          comment: 'This shea butter is absolutely amazing! My skin feels so soft and moisturized. Will definitely order again.',
          name: 'Sarah M.',
          date: '2024-01-15T10:30:00Z',
          helpful: 12
        },
        {
          id: 2,
          rating: 4,
          title: 'Great Product',
          comment: 'Very good quality shea butter. Natural and effective for dry skin. Highly recommend!',
          name: 'John D.',
          date: '2024-01-10T14:20:00Z',
          helpful: 8
        },
        {
          id: 3,
          rating: 5,
          title: 'Perfect for My Skin',
          comment: 'I have sensitive skin and this shea butter works perfectly. No irritation and great moisturizing effect.',
          name: 'Ama K.',
          date: '2024-01-05T09:15:00Z',
          helpful: 15
        }
      ]
    },
    {
      _id: '4',
      name: '250ml Unrefined Shea Butter',
      slug: '250ml-unrefined-shea-butter',
      brandId: '1',
      categoryId: '1',
      description: 'Premium 250ml unrefined shea butter in convenient packaging for daily use.',
      shortDescription: 'Natural moisturizer for all skin types',
      images: [
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651296/ogla/static/brands/laveeda_cat/la_veeda_250ml_shea.webp/la_veeda_250ml_shea.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651294/ogla/static/brands/laveeda_cat/BlackSoap_Gel.webp/BlackSoap_Gel.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651293/ogla/static/brands/laveeda_cat/25Kg_unrefined_shea.webp/25Kg_unrefined_shea.jpg'
      ],
      specifications: {
        weight: '250ml',
        origin: 'Lawra, Northern Ghana',
        processing: 'Unrefined, Cold-pressed',
        ingredients: ['100% Pure Shea Butter'],
        shelfLife: '24 months',
        packaging: 'Plastic container with pump'
      },
      pricing: {
        unitPrice: 25.00,
        currency: 'GHS',
        bulkPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 22.00 },
          { minQuantity: 50, maxQuantity: 99, price: 20.00 },
          { minQuantity: 100, maxQuantity: null, price: 18.00 }
        ]
      },
      variants: [
        {
          name: 'Size',
          options: ['250ml']
        }
      ],
      isFeatured: true,
      sortOrder: 2,
      reviews: [
        {
          id: 4,
          rating: 5,
          title: 'Convenient Size',
          comment: 'Perfect size for daily use. The pump makes it easy to apply and the quality is excellent.',
          name: 'Kwame A.',
          date: '2024-01-12T11:45:00Z',
          helpful: 6
        },
        {
          id: 5,
          rating: 4,
          title: 'Good Value',
          comment: 'Great product at a reasonable price. The 250ml size is perfect for my needs.',
          name: 'Efua B.',
          date: '2024-01-08T16:30:00Z',
          helpful: 4
        }
      ]
    },
    {
      _id: '2',
      name: 'Men\'s Traditional Smock',
      slug: 'mens-traditional-smock',
      brandId: '2',
      categoryId: '4',
      description: 'Authentic Ghanaian men\'s smock made from handwoven cotton.',
      shortDescription: 'Authentic Ghanaian men\'s smock',
      images: [
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651271/ogla/static/brands/afrismock_cat/Kente_afrismock.webp/Kente_afrismock.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651266/ogla/static/brands/afrismocks/Image_testimonial3.webp/Image_testimonial3.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651268/ogla/static/brands/afrismocks/Image_testimonial4.webp/Image_testimonial4.jpg'
      ],
      specifications: {
        material: 'Handwoven Cotton',
        origin: 'Northern Ghana',
        processing: 'Handcrafted',
        weight: 'Medium weight',
        packaging: 'Gift box'
      },
      pricing: {
        unitPrice: 120.00,
        currency: 'GHS',
        bulkPricing: [
          { minQuantity: 5, maxQuantity: 19, price: 110.00 },
          { minQuantity: 20, maxQuantity: null, price: 100.00 }
        ]
      },
      variants: [
        {
          name: 'Size',
          options: ['Small', 'Medium', 'Large', 'XL', 'XXL']
        },
        {
          name: 'Color',
          options: ['White', 'Blue', 'Green', 'Red']
        }
      ],
      isFeatured: true,
      sortOrder: 1,
      reviews: [
        {
          id: 6,
          rating: 5,
          title: 'Beautiful Traditional Wear',
          comment: 'This smock is beautifully crafted and fits perfectly. The quality of the handwoven cotton is exceptional.',
          name: 'Kofi M.',
          date: '2024-01-14T13:20:00Z',
          helpful: 18
        },
        {
          id: 7,
          rating: 4,
          title: 'Authentic Design',
          comment: 'Very authentic traditional design. Great for cultural events and ceremonies.',
          name: 'Yaw S.',
          date: '2024-01-09T10:15:00Z',
          helpful: 11
        }
      ]
    },
    {
      _id: '3',
      name: 'Premium White Beans',
      slug: 'premium-white-beans',
      brandId: '3',
      categoryId: '7',
      description: 'High-quality white beans sourced from Northern Ghana.',
      shortDescription: 'Premium white beans from Northern Ghana',
      images: [
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651301/ogla/static/brands/ogribusiness_cat/5kg_Ogri_Beans.webp/5kg_Ogri_Beans.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651299/ogla/static/brands/ogribusiness/Image_testimonial1.webp/Image_testimonial1.jpg',
        'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651300/ogla/static/brands/ogribusiness/Image_testimonial2.webp/Image_testimonial2.jpg'
      ],
      specifications: {
        weight: '50kg',
        origin: 'Northern Ghana',
        processing: 'Cleaned and sorted',
        packaging: 'Jute bags',
        moisture: '< 14%',
        impurities: '< 2%'
      },
      pricing: {
        unitPrice: 800.00,
        currency: 'GHS',
        bulkPricing: [
          { minQuantity: 10, maxQuantity: 49, price: 750.00 },
          { minQuantity: 50, maxQuantity: 99, price: 700.00 },
          { minQuantity: 100, maxQuantity: null, price: 650.00 }
        ]
      },
      variants: [
        {
          name: 'Package Size',
          options: ['25kg', '50kg', '100kg']
        }
      ],
      isFeatured: true,
      sortOrder: 1,
      reviews: [
        {
          id: 8,
          rating: 5,
          title: 'Excellent Quality Beans',
          comment: 'These beans are of the highest quality. Clean, well-sorted, and perfect for our restaurant.',
          name: 'Restaurant Owner',
          date: '2024-01-13T15:45:00Z',
          helpful: 22
        },
        {
          id: 9,
          rating: 4,
          title: 'Great for Bulk Orders',
          comment: 'Perfect for our bulk orders. The quality is consistent and delivery was on time.',
          name: 'Market Vendor',
          date: '2024-01-07T12:30:00Z',
          helpful: 9
        }
      ]
    }
  ]
};
