import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiStar } from 'react-icons/fi';
import BrandProductCard from '../../components/BrandProductCard';

const AfriSmocksProductShowcase = ({ products, brandColors }) => {
  // Filter AfriSmocks products (brandId: 2)
  const afriSmocksProducts = products.filter(product => product.brandId == 2);

  if (afriSmocksProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-white">
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
            Our Fashion Collections
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Discover our authentic collection of Ghanaian fashion, from traditional handwoven smocks to contemporary African prints. Each piece celebrates the rich cultural heritage of Ghana with modern elegance.
          </motion.p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
          {afriSmocksProducts.map((product, index) => (
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
            <span>View All AfriSmocks Collections</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Fashion Features */}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Handcrafted Excellence</h3>
            <p className="text-gray-600">Traditional weaving techniques passed down through generations</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentic Kente</h3>
            <p className="text-gray-600">Genuine Kente patterns with deep cultural significance</p>
          </div>
          
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: `${brandColors?.primary}20` }}
            >
              <FiStar className="w-8 h-8" style={{ color: brandColors?.primary }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Heritage</h3>
            <p className="text-gray-600">Celebrating Ghanaian traditions with contemporary style</p>
          </div>
        </motion.div>

        {/* Fashion Categories Preview */}
        <motion.div 
          className="mt-16 bg-white rounded-2xl shadow-lg p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-center mb-8" style={{ color: brandColors?.primary }}>
            Explore Our Collections
          </h3>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>S</span>
              </div>
              <h4 className="font-semibold text-gray-900">Traditional Smocks</h4>
              <p className="text-sm text-gray-600">Handwoven cotton smocks</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>K</span>
              </div>
              <h4 className="font-semibold text-gray-900">Kente Cloth</h4>
              <p className="text-sm text-gray-600">Authentic royal fabric</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>A</span>
              </div>
              <h4 className="font-semibold text-gray-900">African Prints</h4>
              <p className="text-sm text-gray-600">Vibrant contemporary designs</p>
            </div>
            <div className="text-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: `${brandColors?.primary}20` }}>
                <span className="text-lg font-bold" style={{ color: brandColors?.primary }}>C</span>
              </div>
              <h4 className="font-semibold text-gray-900">Cultural Wear</h4>
              <p className="text-sm text-gray-600">Traditional ceremonial attire</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AfriSmocksProductShowcase;
