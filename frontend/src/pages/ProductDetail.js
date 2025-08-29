import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import Loading from '../components/Loading';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductReviews from '../components/ProductReviews';
import RelatedProducts from '../components/RelatedProducts';
import { ProductCardSkeleton } from '../components/LoadingSkeleton';

const ProductDetail = () => {
  const { slug } = useParams();
  const { getProductBySlug, getBrandBySlug, products, brands } = useProducts();
  const { addToRequest, isInRequest } = useRequestBasket();
  const [activeTab, setActiveTab] = useState('description');
  
  const product = getProductBySlug(slug);
  const brand = product ? brands.find(b => b._id === product.brandId) : null;

  if (!product) {
    return <Loading message="Product not found" />;
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <ProductImageGallery 
              images={product.images} 
              productName={product.name} 
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
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{product.shortDescription}</p>
              
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(getProductPrice(product))}
              </div>
              
              {/* Quick Rating Display */}
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(
                            product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
                          )
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">
                    ({product.reviews.length} reviews)
                  </span>
                </div>
              )}
              
                             {/* Add to Request Button */}
               <button 
                 className={`w-full text-lg py-3 font-semibold rounded-lg transition-all duration-300 mb-6 ${
                   isInRequest(product._id)
                     ? 'text-white hover:bg-golden-700'
                     : 'btn btn-primary'
                 }`}
                 style={isInRequest(product._id) ? { backgroundColor: '#8B6914' } : {}}
                 onClick={() => addToRequest(product)}
               >
                 {isInRequest(product._id) ? '✓ Added to Request' : 'Add to Request'}
               </button>

              {/* Bulk Pricing Info */}
              {product.pricing.bulkPricing && product.pricing.bulkPricing.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Bulk Pricing Available</h4>
                  <div className="space-y-1 text-sm">
                    {product.pricing.bulkPricing.map((tier, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-gray-600">
                          {tier.minQuantity}+ units:
                        </span>
                        <span className="font-medium">
                          {formatPrice(tier.price)} each
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="container py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-golden-500 text-golden-600'
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
                <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
                
                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Options</h4>
                    {product.variants.map((variant, index) => (
                      <div key={index} className="mb-4">
                        <p className="text-gray-600 mb-2 font-medium">{variant.name}:</p>
                        <div className="flex flex-wrap gap-2">
                          {variant.options.map((option, optionIndex) => (
                            <span
                              key={optionIndex}
                              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                              {option}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600 capitalize font-medium">{key}:</span>
                        <span className="text-gray-900">{value}</span>
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
                  reviews={product.reviews || []}
                  productId={product._id}
                  onAddReview={handleAddReview}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts 
        currentProduct={product} 
        products={products} 
        maxProducts={4} 
      />
    </div>
  );
};

export default ProductDetail;
