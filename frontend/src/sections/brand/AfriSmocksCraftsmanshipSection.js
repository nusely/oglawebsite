import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiAward } from 'react-icons/fi';

const AfriSmocksCraftsmanshipSection = ({ 
  title = "Traditional Weaving Excellence",
  description = "Every AfriSmocks piece is crafted using traditional weaving techniques passed down through generations. Our artisans in Northern Ghana create authentic Kente patterns and traditional smocks that celebrate Ghanaian cultural heritage.",
  location = "Northern Ghana Weaving Centers",
  image = "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651265/ogla/static/brands/afrismocks/image-907-754x424.png/image-907-754x424.jpg",

     brandColors = { primary: '#1E40AF', secondary: '#3B82F6', accent: '#FFFFFF' }
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
               <FiAward 
                 className="mr-2"
                 style={{ color: brandColors.primary }}
               />
               <span>Traditional Weaving Techniques</span>
             </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AfriSmocksCraftsmanshipSection;
