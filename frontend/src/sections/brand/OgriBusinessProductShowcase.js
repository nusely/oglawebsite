import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import BrandProductCard from '../../components/BrandProductCard';

const OgriBusinessProductShowcase = ({ products, brandColors }) => {
  // Filter OgriBusiness products (brandId: 3)
  const ogriBusinessProducts = products.filter(product => product.brandId == 3);

  if (ogriBusinessProducts.length === 0) {
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
            Our Agricultural Products
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our premium selection of agricultural products from Northern Ghana. From high-quality beans to bulk farm produce, we connect farmers to global markets with sustainable, export-ready products.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
          {ogriBusinessProducts.map((product, index) => (
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
            <span>View All Agricultural Products</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Agricultural Features */}
        <motion.div 
                      className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
            <p className="text-gray-600">Highest standards of agricultural products from Northern Ghana</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Export Ready</h3>
            <p className="text-gray-600">Products meet international standards for global markets</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sustainable Farming</h3>
            <p className="text-gray-600">Supporting local farmers with sustainable agricultural practices</p>
          </div>
        </motion.div>

        {/* Product Categories */}
        <motion.div 
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: brandColors?.primary }}>
            Our Product Categories
          </h3>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>B</span>
              </div>
              <h4 className="font-semibold text-gray-900">Beans</h4>
              <p className="text-sm text-gray-600">Premium white & black beans</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>G</span>
              </div>
              <h4 className="font-semibold text-gray-900">Grains</h4>
              <p className="text-sm text-gray-600">Quality cereal grains</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>N</span>
              </div>
              <h4 className="font-semibold text-gray-900">Nuts</h4>
              <p className="text-sm text-gray-600">Premium groundnuts & cashews</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>S</span>
              </div>
              <h4 className="font-semibold text-gray-900">Seeds</h4>
              <p className="text-sm text-gray-600">High-quality seed varieties</p>
            </div>
          </div>
        </motion.div>

        {/* Quality Assurance */}
        <motion.div 
          className="mt-16 bg-gradient-to-r rounded-2xl p-8 text-white"
          style={{ 
            background: `linear-gradient(135deg, ${brandColors?.primary}, ${brandColors?.secondary})`
          }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Quality Assurance</h3>
            <p className="text-lg opacity-90 mb-6">
              All our agricultural products undergo rigorous quality control processes to ensure they meet international standards.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="font-semibold mb-2">Certified Organic</h4>
                <p className="text-sm opacity-80">Naturally grown without harmful chemicals</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="font-semibold mb-2">Export Certified</h4>
                <p className="text-sm opacity-80">Meet international export standards</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <span className="text-xl font-bold">✓</span>
                </div>
                <h4 className="font-semibold mb-2">Bulk Available</h4>
                <p className="text-sm opacity-80">Large quantities for commercial buyers</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OgriBusinessProductShowcase;
