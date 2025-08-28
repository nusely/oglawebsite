import React from 'react';
import Slider from 'react-slick';
import ProductCard from './ProductCard';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductCarousel = ({ products, title, subtitle, brandColors }) => {
  const settings = {
    dots: true,
    infinite: products.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ],
    nextArrow: <NextArrow brandColors={brandColors} />,
    prevArrow: <PrevArrow brandColors={brandColors} />
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="py-8">
      {/* Section Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ color: brandColors?.primary }}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-gray-600 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Carousel */}
      <div className="relative">
        <Slider {...settings}>
          {products.map((product) => (
            <div key={product._id} className="px-2">
              <ProductCard product={product} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

// Custom Arrow Components
const NextArrow = ({ onClick, brandColors }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-200"
    style={{ 
      border: `2px solid ${brandColors?.primary || '#8B4513'}`,
      color: brandColors?.primary || '#8B4513'
    }}
  >
    <FiChevronRight size={20} />
  </button>
);

const PrevArrow = ({ onClick, brandColors }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow duration-200"
    style={{ 
      border: `2px solid ${brandColors?.primary || '#8B4513'}`,
      color: brandColors?.primary || '#8B4513'
    }}
  >
    <FiChevronLeft size={20} />
  </button>
);

export default ProductCarousel;
