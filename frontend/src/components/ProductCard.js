import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiPlus, FiCheck } from 'react-icons/fi';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import LazyImage from './LazyImage';
import { getProductImage } from '../utils/imageUtils';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product, className = '' }) => {
  const { addToRequest, isInRequest, getItemQuantity } = useRequestBasket();
  const [isAddingToRequest, setIsAddingToRequest] = useState(false);
  const { user } = useAuth();

  const handleAddToRequest = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAddingToRequest(true);
    try {
      addToRequest(product, 1);
      // Show success feedback
      setTimeout(() => setIsAddingToRequest(false), 1000);
    } catch (error) {
      console.error('Error adding to request:', error);
      setIsAddingToRequest(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'GH₵0.00';
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  // Get the correct price from product
  const getProductPrice = (product) => {
    if (product.price) return product.price;
    if (product.pricing?.base) return product.pricing.base;
    if (product.pricing?.unitPrice) return product.pricing.unitPrice;
    return 0;
  };

  const isProductInRequest = isInRequest(product._id);
  const requestQuantity = getItemQuantity(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col ${className}`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square">
        <LazyImage
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          placeholder="https://res.cloudinary.com/dpznya3mz/image/upload/v1756651328/ogla/static/laveedaimageplaceholder.png/laveedaimageplaceholder.png"
        />
        
        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </span>
          </div>
        )}
        
        {/* Quick Actions */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
            <button 
              onClick={handleAddToRequest}
              disabled={isAddingToRequest}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isProductInRequest 
                  ? 'text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-600'
              }`}
              style={isProductInRequest ? { backgroundColor: '#8B6914' } : {}}
            >
              {isAddingToRequest ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : isProductInRequest ? (
                <FiCheck size={16} />
              ) : (
                <FiShoppingBag size={16} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Brand */}
        {product.brandName && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {product.brandName}
          </p>
        )}
        
        {/* Product Name */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-lg sm:text-lg font-semibold text-gray-900 mb-2 transition-colors line-clamp-2 hover:text-golden-600">
            {product.name}
          </h3>
        </Link>
        
        {/* Short Description */}
        <p className="text-sm sm:text-sm text-gray-600 mb-3 line-clamp-2 h-8 sm:h-10 flex items-center">
          {product.shortDescription || product.description || 'Natural product for all types'}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3 mt-auto">
          <div>
            <span className="text-lg sm:text-lg font-bold text-gray-900">
              {formatPrice(getProductPrice(product))}
            </span>
            {(product.pricing?.bulkPricing && product.pricing.bulkPricing.length > 0) || product.bulkPricing && (
              <p className="text-sm text-gray-500">
                Bulk pricing available
              </p>
            )}
          </div>
        </div>
        
        {/* Available Sizes/Variants */}
        {product.variants && product.variants.length > 0 && product.variants[0]?.options && (
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-1">Available in:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants[0].options.slice(0, 3).map((option, index) => (
                <span 
                  key={index}
                  className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {option}
                </span>
              ))}
              {product.variants[0].options.length > 3 && (
                <span className="text-sm text-gray-500">
                  +{product.variants[0].options.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
          <Link 
            to={`/product/${product.slug}`}
            className="flex-1 btn text-center text-sm sm:text-sm py-1.5 sm:py-2 bg-transparent border-2 border-golden-600 text-golden-600 hover:text-white hover:bg-golden-600 transition-all duration-200"
          >
            View Details
          </Link>
          {/* Add to Request Button - Hidden for admins */}
          {(!user || (user.role !== 'admin' && user.role !== 'super_admin')) && (
            <button
              onClick={handleAddToRequest}
              disabled={isAddingToRequest}
              className="flex-1 btn text-center text-sm sm:text-sm py-1.5 sm:py-2 text-white transition-all duration-200"
              style={{ 
                backgroundColor: isProductInRequest ? '#8B6914' : '#b5a033' // deep ogla gold : golden-600
              }}
            >
              {isAddingToRequest ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                  <span className="text-xs sm:text-sm">Adding...</span>
                </div>
              ) : isProductInRequest ? (
                <div className="flex items-center justify-center">
                  <FiCheck className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">In Request ({requestQuantity})</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FiPlus className="mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Add to Request</span>
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
