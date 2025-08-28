import React from 'react';
import { motion } from 'framer-motion';
import ProductCarousel from '../../components/ProductCarousel';

const ProductGridSection = ({ 
  products = [],
  title = "Complete Collection",
  subtitle = "Explore our full range of premium shea butter products",
  brandColors = { primary: '#1e4735', secondary: '#e8d77c' },
  background = 'gray-50'
}) => {
  const backgroundClasses = {
    'gray-50': 'bg-gray-50',
    'white': 'bg-white',
    'gradient': 'bg-gradient-to-b from-gray-50 to-white'
  };

  return (
    <section className={`py-24 ${backgroundClasses[background]}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 font-serif">
            {title}
          </h2>
          <p className="text-xl text-gray-600">
            {subtitle}
          </p>
        </motion.div>

        <ProductCarousel
          products={products}
          brandColors={brandColors}
        />
      </div>
    </section>
  );
};

export default ProductGridSection;
