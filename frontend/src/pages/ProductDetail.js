import React from 'react';
import { useParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import Loading from '../components/Loading';

const ProductDetail = () => {
  const { productSlug } = useParams();
  const { getProductBySlug, getBrandBySlug } = useProducts();
  const { addToRequest, isInRequest } = useRequestBasket();
  
  const product = getProductBySlug(productSlug);
  const brand = product ? getBrandBySlug(product.brandId) : null;

  if (!product) {
    return <Loading message="Product not found" />;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: product.pricing.currency || 'GHS'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div>
              <img
                src={product.images[0] || '/images/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>

            {/* Product Info */}
            <div>
              {brand && (
                <div 
                  className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-4"
                  style={{ backgroundColor: brand.brandColors.primary }}
                >
                  {brand.name}
                </div>
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-6">{product.shortDescription}</p>
              
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(product.pricing.unitPrice)}
              </div>
              
              <p className="text-gray-700 mb-6">{product.description}</p>
              
              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Available Options</h3>
                  {product.variants.map((variant, index) => (
                    <div key={index} className="mb-3">
                      <p className="text-gray-600 mb-2">{variant.name}:</p>
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
              
                             <button 
                 className={`w-full text-lg py-3 font-semibold rounded-lg transition-all duration-300 ${
                   isInRequest(product._id)
                     ? 'bg-green-500 text-white hover:bg-green-600'
                     : 'btn btn-primary'
                 }`}
                 onClick={() => addToRequest(product)}
               >
                 {isInRequest(product._id) ? '✓ Added to Request' : 'Add to Request'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
