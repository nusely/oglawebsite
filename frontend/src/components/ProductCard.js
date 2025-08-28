import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPlus, FiCheck } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';

const ProductCard = ({ product }) => {
  const { getBrandBySlug } = useProducts();
  const brand = getBrandBySlug(product.brandId);
  const { addToRequest, isInRequest, getItemQuantity } = useRequestBasket();
  const [isAddingToRequest, setIsAddingToRequest] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: product.pricing.currency || 'GHS'
    }).format(price);
  };

  const getBrandClass = (brandSlug) => {
    switch (brandSlug) {
      case 'la-veeda':
        return 'brand-la-veeda';
      case 'afrismocks':
        return 'brand-afrismocks';
      case 'ogribusiness':
        return 'brand-ogribusiness';
      default:
        return '';
    }
  };

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

  const isProductInRequest = isInRequest(product._id);
  const requestQuantity = getItemQuantity(product._id);

  return (
    <div className={`group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col ${getBrandClass(brand?.slug)}`}>
      {/* Product Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.images[0] || '/images/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Brand Badge */}
        {brand && (
          <div 
            className="absolute top-2 left-2 sm:top-3 sm:left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: brand.brandColors.primary }}
          >
            {brand.name}
          </div>
        )}
        
        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-golden-500 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
            Featured
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
                  ? 'bg-green-500 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-600'
              }`}
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
        {/* Brand Name */}
        {brand && (
          <p 
            className="text-xs font-medium mb-1"
            style={{ color: brand.brandColors.primary }}
          >
            {brand.name}
          </p>
        )}
        
        {/* Product Name */}
        <Link to={`/products/${product.slug}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 hover:text-golden-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        {/* Short Description - Fixed height */}
        <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 h-8 sm:h-10 flex items-center">
          {product.shortDescription}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-3 mt-auto">
          <div>
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatPrice(product.pricing.unitPrice)}
            </span>
            {product.pricing.bulkPricing && product.pricing.bulkPricing.length > 0 && (
              <p className="text-xs text-gray-500">
                Bulk pricing available
              </p>
            )}
          </div>
        </div>
        
        {/* Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Available in:</p>
            <div className="flex flex-wrap gap-1">
              {product.variants[0].options.slice(0, 3).map((option, index) => (
                <span 
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                >
                  {option}
                </span>
              ))}
              {product.variants[0].options.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{product.variants[0].options.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-auto">
          <Link 
            to={`/products/${product.slug}`}
            className="flex-1 btn btn-outline text-center text-xs sm:text-sm py-1.5 sm:py-2"
          >
            View Details
          </Link>
          <button
            onClick={handleAddToRequest}
            disabled={isAddingToRequest}
            className={`flex-1 btn text-center text-xs sm:text-sm py-1.5 sm:py-2 ${
              isProductInRequest 
                ? 'btn-success' 
                : 'btn-primary'
            }`}
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
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
