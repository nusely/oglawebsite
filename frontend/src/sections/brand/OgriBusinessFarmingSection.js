import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiTrendingUp } from 'react-icons/fi';

const OgriBusinessFarmingSection = ({ 
  title = "Sustainable Farming Excellence",
  description = "Every OgriBusiness product is sourced from local farmers in Northern Ghana who practice sustainable farming methods. We connect these hardworking farmers to global markets, ensuring fair prices and quality standards.",
  location = "Northern Ghana Farmlands",
  image = "/images/brands/ogribusiness/a1-woman-farm-ghana.jpg",
  ctaButton = {
    text: "Learn About Our Farmers",
    to: "/products",
    showIcon: true
  },
  brandColors = { primary: '#2E7D32', secondary: '#4CAF50', accent: '#8BC34A' }
}) => {
  return (
    <section className="py-24 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={image}
                alt={title}
                className="w-full h-96 object-cover"
              />
              <div 
                className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"
                style={{ backgroundColor: `${brandColors.primary}30` }}
              ></div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif">
              {title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
            <div className="flex items-center text-gray-600">
              <FiMapPin 
                className="mr-2"
                style={{ color: brandColors.primary }}
              />
              <span>{location}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiTrendingUp 
                className="mr-2"
                style={{ color: brandColors.primary }}
              />
              <span>Export-Ready Quality Standards</span>
            </div>
            {ctaButton && (
              <div className="pt-4">
                <Link 
                  to={ctaButton.to} 
                  className="inline-flex items-center px-8 py-3 rounded-full transition-all duration-300 font-semibold"
                  style={{
                    backgroundColor: brandColors.primary,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = brandColors.secondary;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = brandColors.primary;
                    e.target.style.color = 'white';
                  }}
                >
                  {ctaButton.text}
                  {ctaButton.showIcon && <FiArrowLeft className="ml-2 rotate-180" />}
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OgriBusinessFarmingSection;
