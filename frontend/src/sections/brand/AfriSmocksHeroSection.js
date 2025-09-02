import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiStar } from 'react-icons/fi';
import TestimonialsOverlay from '../shared/TestimonialsOverlay';

const AfriSmocksHeroSection = ({ 
  brand, 
  brandInfo, 
  scaleTransform, 
  testimonials = [],
  showTestimonials = true,
  customBackground = null,
  customLogo = null
}) => {
  const backgroundImage = customBackground || 
    `linear-gradient(rgba(30, 64, 175, 0.4), rgba(59, 130, 246, 0.4)), url('https://res.cloudinary.com/dpznya3mz/image/upload/v1756651258/ogla/static/afrismocks_card.webp/afrismocks_card.jpg')`;

  return (
    <section className="relative h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: scaleTransform
        }}
      />
      
      <div className="relative z-10 h-full flex items-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            {/* Back Button */}
            <div className="flex justify-start mb-6">
                             <Link 
                 to="/"
                 className="inline-flex items-center text-white hover:text-blue-200 transition-colors backdrop-blur-sm bg-white/10 px-3 py-2 rounded-full text-sm"
               >
                <FiArrowLeft className="mr-2" />
                Back to Home
              </Link>
            </div>

            {/* Brand Logo */}
            <div className="mb-6">
              <img
                src={customLogo || brand.logo}
                alt={`${brand.name} Logo`}
                className="w-24 h-24 mx-auto bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-2xl"
              />
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-4 font-serif">
              {brand.name}
            </h1>
            <p className="text-xl lg:text-2xl mb-6 opacity-90 font-light">
              {brandInfo.subtitle}
            </p>
            
            <p className="text-base max-w-2xl mx-auto opacity-90 leading-relaxed mb-8">
              {brandInfo.description}
            </p>

            {/* CTA Button */}
                         <Link 
               to="/products" 
               className="inline-flex items-center bg-[#1E40AF] text-white px-10 py-4 rounded-full hover:bg-[#3B82F6] transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105"
             >
              Explore Collection
              <FiArrowLeft className="ml-3 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Overlay */}
      {showTestimonials && testimonials.length > 0 && (
        <TestimonialsOverlay testimonials={testimonials} brandSlug="afrismocks" />
      )}
    </section>
  );
};

export default AfriSmocksHeroSection;
