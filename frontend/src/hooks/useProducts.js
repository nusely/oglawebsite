import { useState, useEffect, createContext, useContext } from 'react';
import { productService, brandService, mockData } from '../services/productService';

// Create context for global product state
const ProductContext = createContext();

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Product provider component
export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Try to fetch from API first, fallback to mock data
        try {
          const [brandsResponse, productsResponse] = await Promise.all([
            brandService.getBrands(),
            productService.getProducts()
          ]);
          
          // Extract data from API responses
          const brandsData = brandsResponse.data?.data?.brands || brandsResponse.data?.brands || brandsResponse.data || [];
          const productsData = productsResponse.data?.data?.products || productsResponse.data?.products || productsResponse.data || [];
          
          setBrands(Array.isArray(brandsData) ? brandsData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError.message);
          // Use mock data for development
          setBrands(mockData.brands);
          setProducts(mockData.products);
        }
        
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get products by brand
  const getProductsByBrand = (brandId) => {
    if (!Array.isArray(products)) return [];
    
    // Handle both string and number brandId
    const filteredProducts = products.filter(product => {
      const productBrandId = product.brandId || product.brand_id;
      return productBrandId == brandId; // Use == for type coercion
    });
    
    return filteredProducts;
  };

  // Get featured products
  const getFeaturedProducts = () => {
    if (!Array.isArray(products)) return [];
    return products.filter(product => product.isFeatured);
  };

  // Get product by slug
  const getProductBySlug = (slug) => {
    if (!Array.isArray(products)) return null;
    return products.find(product => product.slug === slug);
  };

  // Get brand by slug
  const getBrandBySlug = (slug) => {
    if (!Array.isArray(brands)) return null;
    return brands.find(brand => brand.slug === slug);
  };

  // Search products
  const searchProducts = (searchTerm, filters = {}) => {
    if (!Array.isArray(products)) return [];
    let filteredProducts = products;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.shortDescription.toLowerCase().includes(term)
      );
    }

    // Apply brand filter
    if (filters.brandId) {
      filteredProducts = filteredProducts.filter(product => {
        const productBrandId = product.brandId || product.brand_id;
        return productBrandId == filters.brandId; // Use == for type coercion
      });
    }

    // Apply category filter
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => {
        const productCategory = product.categoryName || product.category;
        return productCategory === filters.category;
      });
    }

    // Apply price range filter
    if (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 10000)) {
      filteredProducts = filteredProducts.filter(product => {
        // Get price from multiple possible fields
        const price = product.price || product.pricing?.base || product.pricing?.unitPrice || 0;
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });
    }

    // Apply in stock filter
    if (filters.inStock) {
      filteredProducts = filteredProducts.filter(product => 
        product.inStock !== false
      );
    }

    // Apply featured filter
    if (filters.featured) {
      filteredProducts = filteredProducts.filter(product => 
        product.isFeatured
      );
    }

    return filteredProducts;
  };

  const value = {
    products,
    brands,
    loading,
    error,
    getProductsByBrand,
    getFeaturedProducts,
    getProductBySlug,
    getBrandBySlug,
    searchProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
