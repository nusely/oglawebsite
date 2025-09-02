import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin } from 'react-icons/fi';

const BrandStorySection = ({ 
  title = "From Lawra, Northern Ghana",
  description = "Every La Veeda product is sourced from the heart of Northern Ghana, specifically from the region of Lawra. This area is known for its rich cultural heritage and traditional craftsmanship that has been passed down through generations.",
  location = "Lawra, Upper West Region, Ghana",
  image = "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651291/ogla/static/brands/laveeda/story_radiate.jpg/story_radiate.jpg",
  ctaButton = {
    text: "Explore Our Story",
    to: "/products",
    showIcon: true
  },
  brandColors = { primary: '#1e4735', secondary: '#e8d77c' }
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
                    e.target.style.color = brandColors.primary;
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

export default BrandStorySection;
