import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUsers, FiHeart, FiFeather, FiTarget, FiAward, FiTrendingUp, FiArrowRight, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

const About = () => {
  const missionAreas = [
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Community Empowerment",
      description: "At the core of our mission lies a steadfast commitment to empowering rural women. Through our Shea Butter production, which engages over 300 dedicated women from local communities, we not only create jobs but also empower these women to become financially independent and self-reliant."
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Agribusiness Ventures",
      description: "From pepper farming to soybeans, groundnuts, maize farming, and cashew nut picking, we collaborate closely with local farmers to cultivate high-quality produce while creating avenues for economic growth and food security."
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Skills Development",
      description: "We invest in education and training programs that empower individuals to succeed in various industries. Through initiatives such as garment and textile production, soap making, Shea butter processing, and hand-weaving, we nurture talent and foster a culture of innovation and creativity."
    },
    {
      icon: <FiFeather className="w-8 h-8" />,
      title: "Sustainable Practices",
      description: "We are committed to sustainable and ethical business practices that prioritize environmental conservation and community well-being. From responsibly sourcing natural ingredients to promoting fair trade principles, we strive to minimize our ecological footprint while maximizing the positive impact on local communities."
    }
  ];

  const stats = [
    { number: "300+", label: "Women Empowered", icon: <FiUsers className="w-6 h-6" /> },
    { number: "5", label: "Agribusiness Ventures", icon: <FiTrendingUp className="w-6 h-6" /> },
    { number: "100%", label: "Natural Ingredients", icon: <FiFeather className="w-6 h-6" /> },
    { number: "24/7", label: "Community Support", icon: <FiHeart className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Truck Image */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero/laveeda -truck-Branding.webp"
            alt="La Veeda Truck Branding"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-5xl lg:text-7xl font-bold text-white font-serif mb-6 leading-tight">
                  About Ogla Shea Butter & Trading
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl leading-relaxed">
                  More than just a brand; we're a beacon of empowerment and opportunity in the heart of Ghana. 
                  Founded with a vision to uplift and support rural communities, especially women.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    to="/products" 
                    className="bg-golden-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-golden-700 transition-colors duration-300 inline-flex items-center justify-center text-lg"
                  >
                    Explore Our Products
                    <FiArrowRight className="ml-2" />
                  </Link>
                  <Link 
                    to="/contact" 
                    className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300 inline-flex items-center justify-center text-lg"
                  >
                    Get in Touch
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-golden-100 rounded-full mb-8">
              <FiHeart className="w-10 h-10 text-golden-600" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif mb-8">
              Our Mission
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
              Through strategic partnerships with donors and supporters who share our vision, 
              we continue to expand our reach and impact, creating opportunities for growth 
              and prosperity in the communities we serve. Together, we are building a brighter 
              future for Ghana, one empowered woman and one thriving community at a time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-golden-600 to-golden-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl hover:bg-white/20 transition-all duration-300">
                  <div className="flex justify-center mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-white/30 transition-colors duration-300">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-golden-100 font-medium text-sm lg:text-base">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Areas */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif mb-6">
              Our Core Focus Areas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We foster economic development and social progress through sustainable business practices and community initiatives.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {missionAreas.map((area, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white p-8 lg:p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-start mb-6">
                  <div className="p-4 rounded-2xl bg-golden-100 text-golden-600 mr-6 flex-shrink-0">
                    {area.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{area.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{area.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 font-serif mb-6">
                Our Values
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide our mission and drive our commitment to community development.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-center group"
              >
                <div className="w-24 h-24 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-golden-200 transition-colors duration-300">
                  <FiHeart className="w-12 h-12 text-golden-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Empowerment</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Supporting women and communities to achieve financial independence and self-reliance through sustainable economic opportunities.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center group"
              >
                <div className="w-24 h-24 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-golden-200 transition-colors duration-300">
                  <FiFeather className="w-12 h-12 text-golden-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sustainability</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Environmental conservation and ethical business practices that prioritize long-term community well-being and ecological balance.</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-center group"
              >
                <div className="w-24 h-24 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-golden-200 transition-colors duration-300">
                  <FiTarget className="w-12 h-12 text-golden-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Innovation</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Fostering creativity and continuous improvement through education, training, and modern approaches to traditional practices.</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

             {/* Impact & Future Section */}
       <section className="py-24 bg-gradient-to-br from-golden-600 to-golden-700">
         <div className="container mx-auto px-4">
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             className="text-center max-w-5xl mx-auto"
           >
             <h2 className="text-4xl lg:text-5xl font-bold text-white font-serif mb-8">
               Building a Brighter Future Together
             </h2>
             <p className="text-xl text-golden-100 mb-12 max-w-4xl mx-auto leading-relaxed">
               Every product you choose from Ogla Shea Butter & Trading directly supports our mission 
               of empowering rural communities and preserving Ghanaian heritage. Together, we're creating 
               sustainable economic opportunities that benefit generations to come.
             </p>
             
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12">
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.1 }}
                 className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl"
               >
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiHeart className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Community Impact</h3>
                 <p className="text-golden-100 text-sm">
                   Your support directly empowers 300+ women and their families in Northern Ghana
                 </p>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.2 }}
                 className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl"
               >
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiFeather className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Sustainable Growth</h3>
                 <p className="text-golden-100 text-sm">
                   Promoting environmental conservation and ethical business practices
                 </p>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.8, delay: 0.3 }}
                 className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl"
               >
                 <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <FiTarget className="w-8 h-8 text-white" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Cultural Preservation</h3>
                 <p className="text-golden-100 text-sm">
                   Keeping traditional Ghanaian craftsmanship alive for future generations
                 </p>
               </motion.div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link 
                 to="/products" 
                 className="bg-white text-golden-600 px-8 py-4 rounded-full font-semibold hover:bg-golden-50 transition-colors duration-300 inline-flex items-center justify-center text-lg"
               >
                 Explore Our Products
                 <FiArrowRight className="ml-2" />
               </Link>
               <Link 
                 to="/contact" 
                 className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-golden-600 transition-colors duration-300 inline-flex items-center justify-center text-lg"
               >
                 Contact Us
               </Link>
             </div>
           </motion.div>
         </div>
       </section>
    </div>
  );
};

export default About;
