import React from 'react';
import { Link } from 'react-router-dom';

const BrandCard = ({ brand }) => {
  // Safety check for brand object
  if (!brand || !brand.slug) {
    return (
      <div className="group relative overflow-hidden rounded-2xl shadow-lg bg-gray-200 h-64 flex items-center justify-center">
        <p className="text-gray-500">Brand not available</p>
      </div>
    );
  }

  // Get brand-specific images, icons, and colors
  const getBrandAssets = (brandSlug) => {
    switch (brandSlug) {
      case 'la-veeda':
        return {
          backgroundImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651322/ogla/static/la-veeda-card.webp/la-veeda-card.png',
          icon: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651327/ogla/static/la-veeda-icon.png/la-veeda-icon.png',
          overlayColor: '#1b4332', // Dark green for La Veeda
          brandColors: {
            primary: '#1b4332',    // Dark green
            secondary: '#e8d77c',  // Gold
            accent: '#ffffff'      // White
          }
        };
      case 'afrismocks':
        return {
          backgroundImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651258/ogla/static/afrismocks_card.webp/afrismocks_card.jpg',
          icon: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651255/ogla/static/afrismocks-icon.png/afrismocks-icon.png',
          overlayColor: '#0623ad', // Blue for AfriSmocks
          brandColors: {
            primary: '#0623ad',    // Blue
            secondary: '#ffffff',  // White
            accent: '#f8f9fa'      // Light white variation
          }
        };
      case 'ogribusiness':
        return {
          backgroundImage: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651338/ogla/static/ogribusiness_card.webp/ogribusiness_card.png',
          icon: 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651337/ogla/static/ogribusiness-icon.png/ogribusiness-icon.png',
          overlayColor: '#005e57', // Teal for OgriBusiness
          brandColors: {
            primary: '#005e57',    // Teal
            secondary: '#ffffff',  // White
            accent: '#f8f9fa'      // Light white variation
          }
        };
      default:
        return {
          backgroundImage: brand.bannerImage || '/images/laveeda-truck-Branding.webp',
          icon: brand.logo || '/images/brand-logo-placeholder.png',
          overlayColor: brand.brandColors?.primary || '#1b4332',
          brandColors: brand.brandColors || {
            primary: '#1b4332',
            secondary: '#e8d77c',
            accent: '#ffffff'
          }
        };
    }
  };

  const brandAssets = getBrandAssets(brand.slug);

  return (
    <Link 
      to={`/brand/${brand.slug}`}
      className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 block"
    >
      {/* Background Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={brandAssets.backgroundImage}
          alt={brand.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Overlay with brand-specific color */}
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"
          style={{ 
            background: `linear-gradient(to top, ${brandAssets.overlayColor}CC, ${brandAssets.overlayColor}76, transparent)` 
          }}
        />
        
        {/* Brand Icon - 50% smaller */}
        <div className="absolute top-4 left-4 z-10">
          <img
            src={brandAssets.icon}
            alt={`${brand.name} Icon`}
            className="w-8 h-8 object-contain bg-white/90 rounded-lg p-1"
          />
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
        <h3 className="text-2xl font-bold mb-2">{brand.name}</h3>
        <p className="text-sm mb-4 line-clamp-2 opacity-90">
          {brand.description}
        </p>
        
        {/* Brand Colors */}
        <div className="flex space-x-2 mb-4">
          <div 
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: brandAssets.brandColors?.primary || '#1b4332' }}
          />
          <div 
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: brandAssets.brandColors?.secondary || '#e8d77c' }}
          />
          <div 
            className="w-4 h-4 rounded-full border-2 border-white"
            style={{ backgroundColor: brandAssets.brandColors?.accent || '#ffffff' }}
          />
        </div>

        {/* CTA Button */}
        <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/30 transition-colors duration-200 border border-white/30">
          Explore {brand.name}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </Link>
  );
};

export default BrandCard;
