import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/Loading';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReviews from '../components/ProductReviews';
import RelatedProducts from '../components/RelatedProducts';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';
import { getImageUrl } from '../utils/imageUtils';
import api from '../services/api';

const FeaturedProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToRequest, isInRequest } = useRequestBasket();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('description');
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [brand, setBrand] = useState(null);

  useEffect(() => {
    const fetchFeaturedProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the featured product by ID
        const response = await api.get(`/brand-featured-products/${id}`);
        
        if (response.data.success && response.data.data.featuredProduct) {
          const product = response.data.data.featuredProduct;
          setFeaturedProduct(product);
          
          // If it's a linked product, fetch brand info
          if (product.brandId) {
            try {
              const brandResponse = await api.get(`/brands/${product.brandId}`);
              if (brandResponse.data.success) {
                setBrand(brandResponse.data.data.brand);
              }
            } catch (brandError) {
              console.error('Error fetching brand:', brandError);
            }
          }
        } else {
          setError('Featured product not found');
        }
      } catch (error) {
        console.error('Error fetching featured product:', error);
        setError('Failed to load featured product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFeaturedProduct();
    }
  }, [id]);

  if (loading) {
    return <Loading message="Loading featured product..." />;
  }

  if (error || !featuredProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The featured product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'GH₵0.00';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  const getProductPrice = (product) => {
    if (product.pricing?.unitPrice) return product.pricing.unitPrice;
    if (product.pricing?.base) return product.pricing.base;
    if (product.price) return product.price;
    return 0;
  };

  const handleAddReview = (review) => {
    // In a real app, this would save to the backend
    console.log('New review:', review);
    // For now, we'll just show an alert
    alert('Thank you for your review! It will be published after moderation.');
  };

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' }
  ];

  // Prepare images for the gallery component
  const productImages = featuredProduct.images ? 
    (Array.isArray(featuredProduct.images) ? featuredProduct.images : [featuredProduct.images]) :
    [featuredProduct.image];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <ProductImageGallery 
              images={productImages} 
              productName={featuredProduct.name} 
            />

            {/* Product Info */}
            <div>
              {brand && (
                <div 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: brand.brandColors?.primary || '#b5a033' }}
                >
                  {brand.name}
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{featuredProduct.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{featuredProduct.description}</p>
              
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(getProductPrice(featuredProduct))}
              </div>
              
              {/* Quick Rating Display */}
              {featuredProduct.reviews && featuredProduct.reviews.length > 0 && (
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(
                            featuredProduct.reviews.reduce((sum, review) => sum + review.rating, 0) / featuredProduct.reviews.length
                          )
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({featuredProduct.reviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Add to Request Button - Hidden for admins */}
              {(!user || (user.role !== 'admin' && user.role !== 'super_admin')) && (
                <button
                  onClick={() => addToRequest(featuredProduct)}
                  disabled={isInRequest(featuredProduct._id || `featured_${featuredProduct.name.replace(/\s+/g, '_').toLowerCase()}`)}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    isInRequest(featuredProduct._id || `featured_${featuredProduct.name.replace(/\s+/g, '_').toLowerCase()}`)
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                  }`}
                >
                  {isInRequest(featuredProduct._id || `featured_${featuredProduct.name.replace(/\s+/g, '_').toLowerCase()}`)
                    ? '✓ Added to Request'
                    : 'Add to Request'
                  }
                </button>
              )}

              {/* Product Highlights */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Premium Quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Authentic Ghanaian</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="container py-12">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'description' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="prose max-w-none">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {featuredProduct.description || 'No description available for this product.'}
                  </p>
                  
                  {featuredProduct.longDescription && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-3">Detailed Information</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {featuredProduct.longDescription}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Specifications</h3>
                
                {featuredProduct.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(featuredProduct.specifications).map(([key, value]) => (
                      <div key={key} className="border-b border-gray-200 pb-3">
                        <dt className="text-sm font-medium text-gray-500 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No specifications available for this product.</p>
                )}
              </motion.div>
            )}

            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductReviews
                  productId={featuredProduct._id || featuredProduct.id}
                  reviews={featuredProduct.reviews || []}
                  onAddReview={handleAddReview}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="container pb-16">
        <RelatedProducts 
          currentProductId={featuredProduct._id || featuredProduct.id}
          brandId={featuredProduct.brandId}
          categoryId={featuredProduct.categoryId}
        />
      </div>
    </div>
  );
};

export default FeaturedProductDetail;


