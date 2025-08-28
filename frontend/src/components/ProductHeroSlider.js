import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ProductHeroSlider = () => {
  // Generate array of hero images from product_hero1.webp to product_hero5.webp
  const heroImages = Array.from({ length: 5 }, (_, i) => ({
    src: `/images/hero/product_hero${i + 1}.webp`,
    alt: `Product Hero ${i + 1}`
  }));

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 10000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index) => {
    setCurrentImageIndex(index);
  };

  return (
         <section className="relative h-96 lg:h-[500px] overflow-hidden bg-gray-600 w-full">
             {/* Background Image Carousel */}
       <AnimatePresence>
         <motion.div
           key={currentImageIndex}
           className="absolute inset-0"
           initial={{ x: '100%' }}
           animate={{ x: 0 }}
           exit={{ x: '-100%' }}
           transition={{ duration: 0.5, ease: 'easeInOut' }}
         >
           <img
             src={heroImages[currentImageIndex].src}
             alt={heroImages[currentImageIndex].alt}
             className="w-full h-full object-cover"
           />
           {/* Dark overlay for better text readability */}
           <div className="absolute inset-0 bg-black/40"></div>
         </motion.div>
               </AnimatePresence>

       {/* Static Text Overlay */}
       <div className="absolute inset-0 z-10 flex items-center justify-center">
         <div className="text-center">
           <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 font-serif">
             Explore our Products
           </h1>
         </div>
       </div>

       {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center space-x-4">
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
          >
            <FiChevronLeft size={24} className="text-white" />
          </button>
          
          {/* Image Indicators */}
          <div className="flex space-x-2">
            {heroImages.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-golden-400 scale-125' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextImage}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
          >
            <FiChevronRight size={24} className="text-white" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductHeroSlider;
