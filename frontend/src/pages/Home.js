import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import BrandCard from '../components/BrandCard';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton, BrandCardSkeleton } from '../components/LoadingSkeleton';
import SEOHead from '../components/SEOHead';
import PartnersSection from '../components/PartnersSection';
import StoryPopup from '../components/StoryPopup';

const Home = () => {
  const { brands, getFeaturedProducts, loading } = useProducts();
  const featuredProducts = getFeaturedProducts();
  
  // Hero images array
  const heroImages = [
    {
      src: '/images/hero/Image_hero1.jpg',
      alt: 'Premium Shea Butter Products',
      title: 'Premium Products from',
      subtitle: 'Northern Ghana',
      description: 'Discover authentic Ghanaian craftsmanship through our three distinct brands: natural cosmetics, traditional clothing, and premium agricultural products.'
    },
    {
      src: '/images/hero/Image_hero2.webp',
      alt: 'Authentic Ghanaian Craftsmanship',
      title: 'Authentic Craftsmanship from',
      subtitle: 'Ghana',
      description: 'Experience the rich heritage of Lawra through our handcrafted products that celebrate traditional African beauty and excellence.'
    }
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate hero images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Auto-rotate testimonials every 5 seconds with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prevIndex) => {
        // Continue to next position, loop back to 0 when reaching the end
        return prevIndex === 4 ? 0 : prevIndex + 1;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen">
      <StoryPopup />
      <SEOHead 
        title="Premium African Products - Shea Butter, Textiles & Business Solutions"
        description="Discover premium shea butter products, authentic African textiles, and innovative business solutions from Ghana"
        keywords="shea butter, African textiles, B2B trading, La Veeda, AfriSmocks, OgriBusiness, Ghana, African products, wholesale, business solutions, premium quality"
        image="/images/ogla-hero.jpg"
        type="website"
      />
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image Carousel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
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

        {/* Content Overlay */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                      {heroImages[currentImageIndex].title}{' '}
                      <span className="text-golden-300">{heroImages[currentImageIndex].subtitle}</span>
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl">
                      {heroImages[currentImageIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Link 
                    to="/products" 
                    className="btn bg-golden-500 text-white hover:bg-golden-600 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 flex items-center justify-center"
                  >
                    Explore Products
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <Link 
                    to="/contact" 
                    className="btn border-2 border-white text-white hover:bg-white hover:text-gray-900 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
                  >
                    Contact Us
                  </Link>
                </div>
              </motion.div>
              
                            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative hidden lg:flex justify-end items-center"
              >
                                 {/* Testimonials Badge */}
                 <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-2xl max-w-xs">
                   <AnimatePresence mode="wait">
                     <motion.div
                       key={currentTestimonial}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: -20 }}
                       transition={{ duration: 0.5 }}
                     >
                       <div className="flex items-center space-x-1 mb-2">
                         {[...Array(5)].map((_, i) => (
                           <FiStar key={i} className="w-3 h-3 text-yellow-500 fill-current" />
                         ))}
                       </div>
                       <p className="text-xs text-gray-700 italic mb-2">
                         "{[
                           "Exceptional quality that tells our cultural story.",
                           "Transformed our agricultural exports completely.",
                           "Revolutionized my beauty routine naturally.",
                           "Elevated our menu with premium quality.",
                           "Perfect blend of tradition and modernity."
                         ][currentTestimonial]}"
                       </p>
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-gray-600 font-medium">
                           {[
                             "Amoureth Johnson",
                             "Kwame Asante", 
                             "Sarah Mensah",
                             "Michael Osei",
                             "Grace Addo"
                           ][currentTestimonial]}
                         </span>
                         <div className="w-5 h-5 rounded-full bg-golden-500 flex items-center justify-center">
                           <span className="text-white text-xs font-bold">O</span>
                         </div>
                       </div>
                     </motion.div>
                   </AnimatePresence>
                 </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Navigation Arrows */}
            <button
              onClick={prevImage}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200"
            >
              <FiChevronLeft size={20} className="sm:w-6 sm:h-6 text-white" />
            </button>
            
            {/* Image Indicators */}
            <div className="flex space-x-1 sm:space-x-2">
              {heroImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'bg-golden-400 scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextImage}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200"
            >
              <FiChevronRight size={20} className="sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Our Brands
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Each brand represents a unique aspect of Ghanaian heritage and craftsmanship, 
              from natural beauty products to traditional clothing and agricultural excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <BrandCardSkeleton />
                </motion.div>
              ))
            ) : (
              brands?.map((brand, index) => (
                <motion.div
                  key={brand._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <BrandCard brand={brand} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="container px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Products
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
              Discover our most popular and premium products across all brands
            </p>
          </motion.div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <ProductCardSkeleton />
                </motion.div>
              ))
            ) : (
              featuredProducts?.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </div>

          {/* View All Products Button */}
          {featuredProducts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-center mt-12"
            >
              <Link 
                to="/products" 
                className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 inline-flex items-center"
              >
                View All Products
                <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="/images/IMG_7717_jpg.webp"
                alt="Lawra, Northern Ghana"
                className="rounded-2xl shadow-lg"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Empowering Communities
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                More than just a brand, we're a beacon of empowerment and opportunity in the heart of Ghana. 
                Founded with a vision to uplift and support rural communities, especially women, 
                we've become a driving force for positive change.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
                Through our Shea Butter production, which engages over 300 dedicated women from local communities, 
                we not only create jobs but also empower these women to become financially independent and self-reliant.
              </p>
              <div className="flex items-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-golden-600">300+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Women Empowered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-golden-600">5</div>
                  <div className="text-xs sm:text-sm text-gray-600">Agribusiness Ventures</div>
                </div>
              </div>
              <Link 
                to="/about" 
                className="btn btn-primary text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 inline-flex items-center"
              >
                Learn More
                <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

              {/* Testimonials Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-48 sm:w-96 h-48 sm:h-96 bg-golden-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 bg-golden-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 sm:w-64 h-32 sm:h-64 bg-golden-500/5 rounded-full blur-2xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-golden-600/20 backdrop-blur-sm rounded-2xl mb-4 sm:mb-6">
              <FiStar className="w-6 h-6 sm:w-8 sm:h-8 text-golden-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-white font-serif mb-4 sm:mb-6">
              Stand Out from the Crowd
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto px-4">
              Discover what our customers say about the quality and impact of our products
            </p>
          </motion.div>

                                        {/* Testimonials Carousel */}
          <div className="max-w-7xl mx-auto w-full">
            <div className="relative w-full">
                                  {/* Desktop: Carousel with 3 testimonials showing, 1 sliding at a time */}
              <div className="hidden lg:block w-full">
                                      {/* Testimonials Container */}
                <div className="relative overflow-hidden mb-8 w-full">
                  <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 33.333}%)` }}>
                    {[
                      // Original testimonials
                      {
                        image: "/images/brands/afrismocks/Image_testimonial3.webp",
                        name: "Amoureth Johnson",
                        title: "Fashion Designer, Accra",
                        text: "The quality of AfriSmocks products is exceptional. Each piece tells a story of our rich cultural heritage while maintaining modern comfort and style."
                      },
                      {
                        image: "/images/brands/ogribusiness/Image_testimonial2.webp",
                        name: "Kwame Asante",
                        title: "Agricultural Exporter",
                        text: "OgriBusiness has transformed our agricultural exports. The premium quality beans and sustainable farming practices set new standards in the industry."
                      },
                      {
                        image: "/images/brands/afrismocks/Image_testimonial4.webp",
                        name: "Sarah Mensah",
                        title: "Beauty Entrepreneur",
                        text: "La Veeda's natural skincare products have revolutionized my beauty routine. The authentic Ghanaian ingredients deliver results beyond expectations."
                      },
                      {
                        image: "/images/brands/laveeda/Image_testimonial6.webp",
                        name: "Michael Osei",
                        title: "Restaurant Owner",
                        text: "The premium quality of OgriBusiness agricultural products has elevated our menu. Our customers can taste the difference in every dish."
                      },
                      {
                        image: "/images/brands/laveeda/Image_testimonial5.webp",
                        name: "Grace Addo",
                        title: "Cultural Ambassador",
                        text: "AfriSmocks represents the perfect blend of tradition and modernity. Each garment carries the spirit of Ghanaian culture with contemporary elegance."
                      }
                    ].map((testimonial, index) => (
                      <div key={index} className="w-1/3 flex-shrink-0 px-2 sm:px-4 min-w-0">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="group relative h-full"
                        >
                          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 h-full">
                            <div className="flex items-center mb-6">
                              <div className="relative">
                                <img
                                  src={testimonial.image}
                                  alt="Customer Testimonial"
                                  className="w-16 h-16 rounded-full object-cover border-2 border-golden-400"
                                />
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-golden-500 rounded-full flex items-center justify-center">
                                  <FiStar className="w-3 h-3 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                                <p className="text-golden-300 text-sm">{testimonial.title}</p>
                              </div>
                            </div>
                            <div className="flex mb-4">
                              {[...Array(5)].map((_, i) => (
                                <FiStar key={i} className="w-5 h-5 text-golden-400 fill-current" />
                              ))}
                            </div>
                            <p className="text-gray-300 leading-relaxed">
                              "{testimonial.text}"
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                </div>

                                      {/* Navigation Controls - Below the carousel */}
                <div className="flex items-center justify-center space-x-4">
                                              {/* Left Arrow */}
                  <button
                    onClick={() => setCurrentTestimonial(prev => prev === 0 ? 4 : prev - 1)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
                  >
                    <FiChevronLeft size={24} className="text-white" />
                  </button>

                  {/* Navigation Dots */}
                  <div className="flex space-x-2">
                    {[...Array(5)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentTestimonial 
                            ? 'bg-golden-400 scale-125' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Right Arrow */}
                  <button
                    onClick={() => setCurrentTestimonial(prev => prev === 4 ? 0 : prev + 1)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-all duration-200"
                  >
                    <FiChevronRight size={24} className="text-white" />
                  </button>
                </div>
              </div>

            {/* Mobile: Carousel with single testimonial */}
            <div className="lg:hidden w-full">
              <div className="relative overflow-hidden w-full">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}>
                  {[
                    {
                      image: "/images/brands/afrismocks/Image_testimonial1.webp",
                      name: "Amoureth Johnson",
                      title: "Fashion Designer, Accra",
                      text: "The quality of AfriSmocks products is exceptional. Each piece tells a story of our rich cultural heritage while maintaining modern comfort and style."
                    },
                    {
                      image: "/images/brands/ogribusiness/Image_testimonial2.webp",
                      name: "Kwame Asante",
                      title: "Agricultural Exporter",
                      text: "OgriBusiness has transformed our agricultural exports. The premium quality beans and sustainable farming practices set new standards in the industry."
                    },
                    {
                      image: "/images/brands/afrismocks/Image_testimonial3.webp",
                      name: "Sarah Mensah",
                      title: "Beauty Entrepreneur",
                      text: "La Veeda's natural skincare products have revolutionized my beauty routine. The authentic Ghanaian ingredients deliver results beyond expectations."
                    },
                    {
                      image: "/images/brands/ogribusiness/Image_testimonial4.webp",
                      name: "Michael Osei",
                      title: "Restaurant Owner",
                      text: "The premium quality of OgriBusiness agricultural products has elevated our menu. Our customers can taste the difference in every dish."
                    },
                    {
                      image: "/images/brands/afrismocks/Image_testimonial5.webp",
                      name: "Grace Addo",
                      title: "Cultural Ambassador",
                      text: "AfriSmocks represents the perfect blend of tradition and modernity. Each garment carries the spirit of Ghanaian culture with contemporary elegance."
                    }
                  ].map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2 sm:px-4 min-w-0">
                      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500">
                        <div className="flex items-center mb-6">
                          <div className="relative">
                            <img
                              src={testimonial.image}
                              alt="Customer Testimonial"
                              className="w-16 h-16 rounded-full object-cover border-2 border-golden-400"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-golden-500 rounded-full flex items-center justify-center">
                              <FiStar className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-bold text-white">{testimonial.name}</h4>
                            <p className="text-golden-300 text-sm">{testimonial.title}</p>
                          </div>
                        </div>
                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <FiStar key={i} className="w-5 h-5 text-golden-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                          "{testimonial.text}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Navigation Controls */}
                <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                  {[...Array(5)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 ${
                        index === currentTestimonial 
                          ? 'bg-golden-400 scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>

                {/* Mobile Arrow Controls */}
                <button
                  onClick={() => setCurrentTestimonial(prev => prev === 0 ? 4 : prev - 1)}
                  className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200"
                >
                  <FiChevronLeft size={16} className="sm:w-5 sm:h-5 text-white" />
                </button>
                <button
                  onClick={() => setCurrentTestimonial(prev => prev === 4 ? 0 : prev + 1)}
                  className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 sm:p-3 rounded-full transition-all duration-200"
                >
                  <FiChevronRight size={16} className="sm:w-5 sm:h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Floating Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-golden-400 mb-1 sm:mb-2">98%</div>
            <div className="text-gray-400 text-xs sm:text-sm">Customer Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-golden-400 mb-1 sm:mb-2">500+</div>
            <div className="text-gray-400 text-xs sm:text-sm">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-golden-400 mb-1 sm:mb-2">4.9★</div>
            <div className="text-gray-400 text-xs sm:text-sm">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-golden-400 mb-1 sm:mb-2">24/7</div>
            <div className="text-gray-400 text-xs sm:text-sm">Support Available</div>
          </div>
        </motion.div>
      </section>

      {/* Partners Section */}
      <PartnersSection />

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-golden-600 to-golden-700">
        <div className="container px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4">
              Ready to Experience Quality?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-golden-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Browse our complete collection of premium products and discover 
              the authentic taste of Ghanaian craftsmanship.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link 
                to="/products" 
                className="btn bg-white text-golden-600 hover:bg-gray-100 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
              >
                Shop Now
              </Link>
              <Link 
                to="/contact" 
                className="btn border-2 border-white text-white hover:bg-white hover:text-golden-600 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3"
              >
                Get in Touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;