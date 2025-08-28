import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiUsers, FiHeart } from 'react-icons/fi';
import { useRequestBasket } from '../../contexts/RequestBasketContext';

const AfriSmocksCollectionSection = ({ 
  title = "The Ultimate Fashion Collection",
  description = "Experience the vibrant culture of Ghana through our handcrafted traditional smocks and contemporary African fashion. Each piece tells a story of heritage, craftsmanship, and modern style.",
  featuredProduct = null,
  customerStats = { count: "500+", label: "Happy Customers" },
     brandColors = { primary: '#1E40AF', secondary: '#3B82F6', accent: '#FFFFFF' }
}) => {
  const { addToRequest, isInRequest } = useRequestBasket();
  return (
         <section className="relative py-24 bg-[#1E40AF] text-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-4xl lg:text-5xl font-bold font-serif">
              {title}
            </h2>
            <p className="text-xl opacity-90 leading-relaxed">
              {description}
            </p>
            <div className="flex items-center space-x-4">
                             <div className="flex items-center space-x-2">
                 <FiUsers className="text-[#FFFFFF]" />
                 <span className="text-sm">{customerStats.count} {customerStats.label}</span>
               </div>
               <div className="flex items-center space-x-2">
                 <FiHeart className="text-[#FFFFFF]" />
                 <span className="text-sm">Handcrafted</span>
               </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              {featuredProduct ? (
                <>
                  <div className="relative h-80 overflow-hidden rounded-xl mb-6">
                    <img
                      src={featuredProduct.image}
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{featuredProduct.name}</h3>
                  <p className="text-white/80 mb-4">{featuredProduct.description}</p>
                  <div className="flex items-center justify-between mb-4">
                                         <span className="text-3xl font-bold text-[#FFFFFF]">{featuredProduct.price}</span>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className="text-yellow-400 text-sm fill-current" />
                      ))}
                    </div>
                  </div>
                                                                           <button 
                     className={`w-full px-6 py-3 rounded-full transition-all duration-300 font-semibold ${
                       isInRequest(featuredProduct._id || `featured_${featuredProduct.name.replace(/\s+/g, '_').toLowerCase()}`)
                         ? 'bg-green-500 text-white hover:bg-green-600'
                         : 'bg-[#FFFFFF] text-[#1E40AF] hover:bg-blue-50'
                     }`}
                     onClick={() => addToRequest(featuredProduct)}
                   >
                     {isInRequest(featuredProduct._id || `featured_${featuredProduct.name.replace(/\s+/g, '_').toLowerCase()}`) ? '✓ Added to Request' : 'Add to Request'}
                   </button>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-white/60">Featured product coming soon...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AfriSmocksCollectionSection;
