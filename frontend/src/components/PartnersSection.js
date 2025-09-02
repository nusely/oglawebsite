import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PartnersSection = ({ className = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const partners = [
    {
      id: 1,
      name: "Ghana Shea Alliance",
             logo: "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png",
      description: "Leading organization promoting sustainable shea butter production in Ghana"
    },
    {
      id: 2,
      name: "TWIS",
             logo: "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png",
      description: "International development organization supporting local communities"
    },
    {
      id: 3,
      name: "ABC Business Consult",
             logo: "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png",
      description: "Strategic business consulting and market development partners"
    },
    {
      id: 4,
      name: "Local Textile Association",
             logo: "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png",
      description: "Preserving and promoting traditional Ghanaian textile craftsmanship"
    }
  ];

  // Duplicate partners for infinite scroll effect
  const duplicatedPartners = [...partners, ...partners, ...partners];

  // Auto-scroll for mobile carousel (disabled for simple grid)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentIndex((prevIndex) => {
  //       const nextIndex = prevIndex + 1;
  //       return nextIndex >= partners.length ? 0 : nextIndex;
  //     });
  //   }, 5000); // Change every 5 seconds (slower)

  //   return () => clearInterval(interval);
  // }, [partners.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      return nextIndex >= partners.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const prevIndexValue = prevIndex - 1;
      return prevIndexValue < 0 ? partners.length - 1 : prevIndexValue;
    });
  };

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We collaborate with leading organizations to deliver the highest quality products and support sustainable development
          </p>
        </motion.div>

        {/* Desktop: Grid Layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
                             <div className="bg-gray-50 rounded-lg p-6 h-32 flex items-center justify-center hover:bg-gray-100 transition-colors">
                 <div className="text-center">
                   <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-3 mx-auto overflow-hidden">
                     <img
                       src={partner.logo}
                       alt={partner.name}
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <h3 className="text-sm font-semibold text-gray-900 mb-1">
                     {partner.name}
                   </h3>
                   <p className="text-xs text-gray-600 line-clamp-2">
                     {partner.description}
                   </p>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>

                 {/* Mobile: Simple Grid Layout */}
         <div className="md:hidden">
           <div className="grid grid-cols-2 gap-4">
             {partners.map((partner, index) => (
               <motion.div
                 key={partner.id}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.6, delay: index * 0.1 }}
                 viewport={{ once: true }}
                 className="group"
               >
                 <div className="bg-white border border-gray-200 rounded-xl p-4 h-32 flex flex-col items-center justify-center hover:shadow-md transition-all duration-300">
                   <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-3 overflow-hidden bg-gray-50">
                     <img
                       src={partner.logo}
                       alt={partner.name}
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <h3 className="text-sm font-semibold text-gray-900 text-center leading-tight">
                     {partner.name}
                   </h3>
                 </div>
               </motion.div>
             ))}
           </div>

           
         </div>

        {/* Partnership Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Why We Partner Together
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-golden-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-golden-600 text-xl font-bold">✓</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Quality Assurance
              </h4>
              <p className="text-gray-600">
                Working together to maintain the highest standards in product quality and safety
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-golden-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-golden-600 text-xl font-bold">🌱</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Sustainable Development
              </h4>
              <p className="text-gray-600">
                Promoting environmentally responsible practices and community development
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-golden-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-golden-600 text-xl font-bold">🤝</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Mutual Growth
              </h4>
              <p className="text-gray-600">
                Creating opportunities for shared success and market expansion
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PartnersSection;
