import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiFeather, FiHeart, FiAward } from 'react-icons/fi';

const TestimonialsOverlay = ({ testimonials = [], position = 'bottom-right', brandSlug = null }) => {
  const positionClasses = {
    'bottom-right': 'absolute bottom-8 right-8',
    'bottom-left': 'absolute bottom-8 left-8',
    'top-right': 'absolute top-8 right-8',
    'top-left': 'absolute top-8 left-8'
  };

  // Brand-specific badge configuration
  const getBadgeConfig = (brandSlug) => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          icon: FiFeather,
          iconBgColor: '#1e4735',
          title: '100% Natural',
          subtitle: 'Pure ingredients'
        };
      case 'afrismocks':
        return {
          icon: FiHeart,
          iconBgColor: '#1E40AF',
          title: 'Handcrafted',
          subtitle: 'Authentic Ghanaian'
        };
      case 'ogribusiness':
        return {
          icon: FiAward,
          iconBgColor: '#2E7D32',
          title: 'Premium Quality',
          subtitle: 'Export Standard'
        };
      default:
        return {
          icon: FiFeather,
          iconBgColor: '#1e4735',
          title: '100% Natural',
          subtitle: 'Pure ingredients'
        };
    }
  };

  const badgeConfig = getBadgeConfig(brandSlug);
  const IconComponent = badgeConfig.icon;

  return (
    <div className={`${positionClasses[position]} z-20 space-y-4 hidden md:block`}>
      {/* Brand-Specific Badge */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: badgeConfig.iconBgColor }}
          >
            <IconComponent className="text-white text-lg" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{badgeConfig.title}</p>
            <p className="text-sm text-gray-600">{badgeConfig.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Product Reviews */}
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.id || index}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 + (index * 0.2) }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <img
              src={testimonial.customerImage}
              alt={testimonial.customerName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-1 mb-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className="text-yellow-400 text-sm fill-current" />
                ))}
              </div>
              <p className="text-sm font-semibold text-gray-900">{testimonial.reviewCount} Reviews</p>
              <p className="text-xs text-gray-600">{testimonial.productName}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TestimonialsOverlay;
