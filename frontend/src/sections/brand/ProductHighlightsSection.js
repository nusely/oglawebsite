import React from 'react';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import { useRequestBasket } from '../../contexts/RequestBasketContext';

const ProductHighlightsSection = ({ 
  products = [], 
  title = "Our Products, Your Glow",
  subtitle = "Discover our premium collection of shea butter products, crafted with care from the finest natural ingredients",
  maxProducts = 3,
  brandColors = { primary: '#1e4735', secondary: '#e8d77c' }
}) => {
  const displayProducts = products.slice(0, maxProducts);
  const { addToRequest, isInRequest } = useRequestBasket();

  return (
    <section className="relative py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-serif">
            {title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Rating Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className="text-yellow-400 text-sm fill-current" />
                    ))}
                    <span className="text-sm font-semibold text-gray-900 ml-1">4.9</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.shortDescription}</p>
                <div className="flex items-center justify-between mb-4">
                  <span 
                    className="text-2xl font-bold"
                    style={{ color: brandColors.primary }}
                  >
                    {new Intl.NumberFormat('en-GH', {
                      style: 'currency',
                      currency: 'GHS'
                    }).format(product.pricing.unitPrice)}
                  </span>
                  <span className="text-sm text-gray-500">1,234 reviews</span>
                </div>
                                 <button 
                   className={`w-full px-6 py-3 rounded-full transition-all duration-300 font-semibold ${
                     isInRequest(product._id)
                       ? 'bg-green-500 text-white hover:bg-green-600'
                       : ''
                   }`}
                   style={!isInRequest(product._id) ? {
                     backgroundColor: brandColors.primary,
                     color: 'white'
                   } : {}}
                   onMouseEnter={(e) => {
                     if (!isInRequest(product._id)) {
                       e.target.style.backgroundColor = brandColors.secondary;
                       e.target.style.color = brandColors.primary;
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!isInRequest(product._id)) {
                       e.target.style.backgroundColor = brandColors.primary;
                       e.target.style.color = 'white';
                     }
                   }}
                   onClick={() => addToRequest(product)}
                 >
                   {isInRequest(product._id) ? '✓ Added to Request' : 'Add to Request'}
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductHighlightsSection;
