import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiStar, FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProductCarousel from '../../components/ProductCarousel';

const LegacyBrandPage = ({ brand, brandInfo, brandProducts, brandSlug }) => {
  // Safety checks for required props
  if (!brand) {
    return <div className="min-h-screen flex items-center justify-center">Brand not found</div>;
  }

  if (!brandInfo) {
    return <div className="min-h-screen flex items-center justify-center">Brand information not available</div>;
  }
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

  return (
    <div className={`min-h-screen ${getBrandClass(brandSlug)}`}>
      {/* Hero Section */}
      <section 
        className="relative py-20 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${brand.bannerImage})`
        }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            {/* Back Button */}
            <div className="flex justify-start mb-8">
              <Link 
                to="/"
                className="inline-flex items-center text-white hover:text-golden-300 transition-colors"
              >
                <FiArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Brand Logo */}
            <div className="mb-6">
              <img
                src={brand.logo}
                alt={`${brand.name} Logo`}
                className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-2xl p-4"
              />
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold mb-4">{brand.name}</h1>
            <p className="text-xl lg:text-2xl mb-6 opacity-90">{brandInfo.subtitle || ''}</p>
            
            {/* Brand Colors */}
            <div className="flex justify-center space-x-3 mb-8">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: brand.brandColors?.primary || '#1b4332' }}
              />
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: brand.brandColors?.secondary || '#e8d77c' }}
              />
              <div 
                className="w-6 h-6 rounded-full border-2 border-white"
                style={{ backgroundColor: brand.brandColors?.accent || '#ffffff' }}
              />
            </div>

            <p className="text-lg max-w-3xl mx-auto opacity-90">
              {brandInfo.description || ''}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose {brand.name}?
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {(brandInfo.features || []).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  className="text-center"
                >
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: (brand.brandColors?.primary || '#1b4332') + '20' }}
                  >
                    <FiStar 
                      size={24}
                      style={{ color: brand.brandColors?.primary || '#1b4332' }}
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature}</h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: brand.brandColors?.primary || '#1b4332' }}
            >
              Featured {brand.name} Products
            </h2>
            <p className="text-xl text-gray-600">
              Discover our most popular products from {brand.name}
            </p>
          </motion.div>

          <ProductCarousel
            products={brandProducts.filter(p => p.isFeatured)}
            brandColors={brand.brandColors}
          />
        </div>
      </section>

      {/* All Products */}
      <section className="py-16 bg-white">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center mb-12"
          >
            <h2 
              className="text-3xl font-bold mb-4"
              style={{ color: brand.brandColors?.primary || '#1b4332' }}
            >
              All {brand.name} Products
            </h2>
            <p className="text-xl text-gray-600">
              Complete collection of {brand.name} products
            </p>
          </motion.div>

          <ProductCarousel
            products={brandProducts}
            brandColors={brand.brandColors}
          />
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <img
                src="/images/lawra-ghana.jpg"
                alt="Lawra, Northern Ghana"
                className="rounded-2xl shadow-lg"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <h2 
                className="text-3xl font-bold mb-6"
                style={{ color: brand.brandColors?.primary || '#1b4332' }}
              >
                From Lawra, Northern Ghana
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Every {brand.name} product is sourced from the heart of Northern Ghana, 
                specifically from the region of Lawra. This area is known for its rich 
                cultural heritage and traditional craftsmanship that has been passed down 
                through generations.
              </p>
              <div className="flex items-center text-gray-600">
                <FiMapPin className="mr-2" />
                <span>Lawra, Upper West Region, Ghana</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-16 text-center text-white"
        style={{ backgroundColor: brand.brandColors?.primary || '#1b4332' }}
      >
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              Experience {brand.name} Quality
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Ready to discover authentic Ghanaian craftsmanship?
            </p>
            <Link 
              to="/products" 
              className="btn bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Shop All Products
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LegacyBrandPage;
