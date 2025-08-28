import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const CTASection = ({ 
  title, 
  description, 
  primaryButton, 
  secondaryButton, 
  background = 'primary',
  customBackground = null,
  className = ''
}) => {
  const backgroundClasses = {
    primary: 'bg-[#1e4735] text-white',
    secondary: 'bg-[#e8d77c] text-[#1e4735]',
    white: 'bg-white text-[#1e4735]',
    gradient: 'bg-gradient-to-r from-[#1e4735] to-[#2d5a47] text-white'
  };

  const sectionStyle = customBackground ? { background: customBackground } : {};

  return (
    <section 
      className={`py-24 ${!customBackground ? backgroundClasses[background] : 'text-white'} ${className}`}
      style={sectionStyle}
    >
      <div className="container text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 font-serif">
            {title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {primaryButton && (
              <Link 
                to={primaryButton.to} 
                className={`px-8 py-4 rounded-full transition-all duration-300 font-semibold ${
                  customBackground || background === 'primary' || background === 'gradient'
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-[#1e4735] text-white hover:bg-[#2d5a47]'
                }`}
              >
                {primaryButton.text}
                {primaryButton.icon && <FiArrowLeft className="ml-2 rotate-180" />}
              </Link>
            )}
            {secondaryButton && (
              <Link 
                to={secondaryButton.to} 
                className={`border-2 px-8 py-4 rounded-full transition-all duration-300 font-semibold ${
                  customBackground || background === 'primary' || background === 'gradient'
                    ? 'border-white text-white hover:bg-white hover:text-gray-900'
                    : 'border-[#1e4735] text-[#1e4735] hover:bg-[#1e4735] hover:text-white'
                }`}
              >
                {secondaryButton.text}
                {secondaryButton.icon && <FiArrowLeft className="ml-2 rotate-180" />}
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
