import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import BrandProductCard from '../../components/BrandProductCard';

const LaVeedaProductShowcase = ({ products, brandColors }) => {
  // Filter La Veeda products (brandId: '1')
  const laVeedaProducts = products.filter(product => product.brandId === '1');

  if (laVeedaProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-white">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2 
            className="text-4xl font-bold mb-4"
            style={{ color: brandColors?.primary }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Our Products, Your Glow
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our premium collection of natural skincare products, crafted with the finest shea butter from Lawra, Northern Ghana. Each product is designed to nourish, protect, and enhance your natural beauty.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {laVeedaProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <BrandProductCard product={product} brandColors={brandColors} />
            </motion.div>
          ))}
        </div>

        {/* View All Products CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
            style={{ 
              backgroundColor: brandColors?.primary,
              boxShadow: `0 4px 14px 0 ${brandColors?.primary}40`
            }}
          >
            <span>View All La Veeda Products</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Product Benefits */}
        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Natural Ingredients</h3>
            <p className="text-gray-600">100% pure, unrefined shea butter sourced directly from Northern Ghana</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Traditional Formulations</h3>
            <p className="text-gray-600">Ancient beauty wisdom combined with modern cosmetic science</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Sourcing</h3>
            <p className="text-gray-600">Supporting local communities while preserving traditional methods</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LaVeedaProductShowcase;
