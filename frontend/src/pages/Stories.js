import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

const Stories = () => {
  const stories = [
    {
      id: 1,
      title: "Ogla Shea Butter Expands to International Markets",
      excerpt: "We're excited to announce our expansion into European markets, bringing authentic Ghanaian shea butter to new customers worldwide.",
      content: "Our journey to international markets has been a remarkable one. Starting from our local roots in Ghana, we've built strong partnerships with European distributors who share our commitment to quality and sustainability. This expansion represents not just business growth, but the global recognition of Ghanaian craftsmanship and natural products.",
      author: "Elizabeth Simons",
      date: "August 28, 2024",
      category: "Business Growth",
             image: "/images/stories/IMG-20250829-WA0035.jpg",
       slug: "international-expansion",
       featured: true
    },
    {
      id: 2,
      title: "New Partnership with Ghana Shea Alliance",
      excerpt: "Strategic collaboration with Ghana Shea Alliance to enhance quality standards and support local shea butter producers.",
      content: "This partnership represents a significant milestone in our commitment to supporting local communities and maintaining the highest quality standards. Through this collaboration, we're working together to improve production techniques, ensure fair trade practices, and create sustainable economic opportunities for shea butter producers across Ghana.",
      author: "Marketing Team",
      date: "August 25, 2024",
             category: "Partnerships",
       image: "/images/stories/IMG-20250829-WA0036.jpg",
       slug: "ghana-shea-alliance-partnership"
    },
    {
      id: 3,
      title: "Sustainable Farming Practices in Our Supply Chain",
      excerpt: "Discover how we're implementing eco-friendly farming methods to protect the environment while maintaining product quality.",
      content: "Sustainability is at the heart of everything we do. Our commitment to eco-friendly farming practices ensures that we not only produce high-quality products but also protect the environment for future generations. From organic farming methods to waste reduction initiatives, we're constantly innovating to minimize our environmental impact.",
      author: "Sustainability Team",
      date: "August 22, 2024",
             category: "Sustainability",
       image: "/images/stories/sustainable-Farm-Africa.jpg",
       slug: "sustainable-farming-practices"
    },
    {
      id: 4,
      title: "AfriSmocks Collection Launch Success",
      excerpt: "Our latest AfriSmocks collection has received overwhelming positive feedback from customers and fashion enthusiasts.",
      content: "The launch of our new AfriSmocks collection has been a tremendous success, showcasing the rich cultural heritage of Ghana through contemporary fashion. The collection features traditional patterns reimagined for modern wear, creating pieces that are both culturally significant and fashion-forward.",
      author: "Design Team",
      date: "August 20, 2024",
             category: "Product Launch",
       image: "/images/stories/image-907-754x424.png",
       slug: "afrismocks-launch-success"
    },
    {
      id: 5,
      title: "Supporting Local Artisans Through OgriBusiness",
      excerpt: "How our OgriBusiness initiative is creating economic opportunities for local artisans and craftspeople.",
      content: "Through our OgriBusiness initiative, we're proud to support local artisans and craftspeople, providing them with fair compensation and market access. This program not only helps preserve traditional crafts but also creates sustainable economic opportunities in rural communities.",
      author: "Community Relations",
      date: "August 18, 2024",
             category: "Community",
       image: "/images/stories/bolgatanga-smocks-fugu.jpg",
       slug: "supporting-local-artisans"
    },
    {
      id: 6,
      title: "Quality Assurance: Behind the Scenes",
      excerpt: "Take a look at our rigorous quality control processes that ensure every product meets our high standards.",
      content: "Quality is non-negotiable at Ogla Shea Butter. Our comprehensive quality assurance process involves multiple stages of testing and verification, from raw material inspection to final product evaluation. This commitment to excellence ensures that our customers receive only the best products.",
      author: "Quality Control Team",
      date: "August 15, 2024",
             category: "Quality",
       image: "/images/stories/nut-processing.jpg",
       slug: "quality-assurance-behind-scenes"
    }
  ];

  return (
    <>
      <SEOHead 
        title="Stories & News - Ogla Shea Butter & General Trading"
        description="Stay updated with the latest news, achievements, and stories from Ogla Shea Butter. Discover our journey, partnerships, and commitment to quality and sustainability."
        keywords="Ogla news, shea butter stories, Ghana business news, sustainable farming, partnerships, community development, quality assurance"
        image="/images/stories-hero.jpg"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-golden-600 to-golden-800 text-white py-16 sm:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Stories & News
              </h1>
              <p className="text-xl sm:text-2xl text-golden-100 max-w-3xl mx-auto">
                Discover our journey, achievements, and the stories behind our commitment to quality and sustainability
              </p>
            </motion.div>
          </div>
        </section>

        {/* Featured Story */}
        <section className="py-16">
          <div className="container">
            {stories.filter(story => story.featured).map((story) => (
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-full">
                    <img
                      src={story.image || '/images/stories/placeholder.jpg'}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-golden-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured Story
                      </span>
                    </div>
                  </div>
                  <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="bg-golden-100 text-golden-700 px-3 py-1 rounded-full">
                        {story.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4" />
                        {story.date}
                      </div>
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                      {story.title}
                    </h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiUser className="w-4 h-4" />
                        By {story.author}
                      </div>
                                             <Link 
                         to={`/stories/${story.slug}`}
                         className="flex items-center gap-2 text-golden-600 hover:text-golden-700 font-semibold transition-colors"
                       >
                         Read Full Story
                         <FiArrowRight className="w-4 h-4" />
                       </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* All Stories Grid */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Latest Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Stay updated with our latest news, achievements, and community initiatives
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.filter(story => !story.featured).map((story, index) => (
                <motion.article
                  key={story.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="relative h-48">
                    <img
                      src={story.image || '/images/stories/placeholder.jpg'}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-golden-600 text-white px-2 py-1 rounded text-xs font-semibold">
                        {story.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <FiCalendar className="w-4 h-4" />
                      {story.date}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {story.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FiUser className="w-4 h-4" />
                        {story.author}
                      </div>
                                             <Link 
                         to={`/stories/${story.slug}`}
                         className="flex items-center gap-1 text-golden-600 hover:text-golden-700 font-semibold text-sm transition-colors"
                       >
                         Read More
                         <FiArrowRight className="w-3 h-3" />
                       </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-golden-50">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Stay Updated
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Subscribe to our newsletter for the latest stories, product updates, and exclusive offers
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                />
                <button className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors font-semibold">
                  Subscribe
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Stories;
