import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdvancedSEO from '../components/AdvancedSEO';
import api from '../services/api';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

  // Fetch stories from API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await api.get('/stories');
        
        if (response.data.success) {
          setStories(response.data.data.stories || []);
        } else {
          setError('Failed to load stories');
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Auto-rotate featured stories every 5 seconds
  useEffect(() => {
    const featuredStories = stories.filter(story => story.isFeatured);
    if (featuredStories.length > 1) {
      const interval = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          (prevIndex + 1) % featuredStories.length
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [stories]);

  // Navigation functions for featured stories carousel
  const goToNextFeatured = () => {
    const featuredStories = stories.filter(story => story.isFeatured);
    setCurrentFeaturedIndex((prevIndex) => 
      (prevIndex + 1) % featuredStories.length
    );
  };

  const goToPrevFeatured = () => {
    const featuredStories = stories.filter(story => story.isFeatured);
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === 0 ? featuredStories.length - 1 : prevIndex - 1
    );
  };

  const goToFeatured = (index) => {
    setCurrentFeaturedIndex(index);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unable to Load Stories</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdvancedSEO 
        title="Stories & News - Ogla Shea Butter & General Trading"
        description="Read the latest news and stories from Ogla Shea Butter. Discover our journey, partnerships, and commitment to quality African products."
        keywords="Ogla news, shea butter stories, Ghana business, African products, company updates"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-golden-600 to-golden-700 text-white py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Our Stories
              </h1>
              <p className="text-xl text-golden-100 leading-relaxed">
                Discover the journey behind Ogla Shea Butter & General Trading. Read about our partnerships, 
                achievements, and commitment to authentic African products.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Stories Section */}
        <div className="container py-16">
          {stories.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">No Stories Available</h2>
              <p className="text-gray-600">Check back soon for new updates and stories!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured Stories Carousel */}
              {(() => {
                const featuredStories = stories.filter(story => story.isFeatured);
                if (featuredStories.length === 0) return null;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-16"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <span className="bg-golden-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Featured Stories
                      </span>
                      <div className="h-px bg-golden-200 flex-1"></div>
                    </div>
                    
                    <div className="relative">
                      {/* Featured Stories Container */}
                      <div className="overflow-hidden">
                        <div 
                          className="flex transition-transform duration-500 ease-in-out"
                          style={{ transform: `translateX(-${currentFeaturedIndex * 100}%)` }}
                        >
                          {featuredStories.map((featuredStory, index) => (
                            <div key={featuredStory.id} className="w-full flex-shrink-0">
                              <article className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                                <div className="lg:flex">
                                  {/* Featured Story Image */}
                                  <div className="lg:w-1/2 relative h-64 lg:h-96 overflow-hidden">
                                    <img
                                      src={featuredStory.image_url || "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp"}
                                      alt={featuredStory.title}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-6 left-6">
                                      <span className="bg-golden-600 text-white px-3 py-2 rounded-full text-sm font-semibold shadow-lg">
                                        {featuredStory.category || 'Company News'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Featured Story Content */}
                                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                                      {featuredStory.title}
                                    </h2>
                                    
                                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                                      {featuredStory.excerpt}
                                    </p>

                                    {/* Featured Story Meta */}
                                    <div className="flex items-center gap-6 text-gray-500 mb-8">
                                      <div className="flex items-center gap-2">
                                        <FiUser className="w-5 h-5" />
                                        <span className="font-medium">{featuredStory.author || 'Admin'}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <FiCalendar className="w-5 h-5" />
                                        <span>
                                          {new Date(featuredStory.publishedAt || featuredStory.createdAt).toLocaleDateString('en-US', { 
                                            year: 'numeric',
                                            month: 'long', 
                                            day: 'numeric' 
                                          })}
                                        </span>
                                      </div>
                                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                          {featuredStory.readTime ? `${featuredStory.readTime} min read` : '2 min read'}
                                      </span>
                                    </div>

                                    {/* Featured Story CTA */}
                                    <Link
                                      to={`/story/${featuredStory.slug}`}
                                      className="inline-flex items-center bg-golden-600 text-white px-8 py-4 rounded-xl hover:bg-golden-700 transition-colors font-semibold text-lg shadow-lg"
                                    >
                                      Read Full Story
                                      <FiArrowRight className="ml-3 w-5 h-5" />
                                    </Link>
                                  </div>
                                </div>
                              </article>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Navigation Arrows - Only show if multiple featured stories */}
                      {featuredStories.length > 1 && (
                        <>
                          {/* Previous Arrow */}
                          <button
                            onClick={goToPrevFeatured}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                            aria-label="Previous featured story"
                          >
                            <FiChevronLeft className="w-6 h-6" />
                          </button>

                          {/* Next Arrow */}
                          <button
                            onClick={goToNextFeatured}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-10"
                            aria-label="Next featured story"
                          >
                            <FiChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}

                      {/* Dots Navigation - Only show if multiple featured stories */}
                      {featuredStories.length > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                          {featuredStories.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToFeatured(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                                index === currentFeaturedIndex 
                                  ? 'bg-golden-600 scale-125' 
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Go to featured story ${index + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Regular Stories Grid */}
              <div>
                <div className="flex items-center gap-2 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Latest Stories</h2>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stories
                    .filter(story => !story.isFeatured)
                    .map((story, index) => (
                      <motion.article
                        key={story.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        {/* Story Image */}
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={story.image_url || "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp"}
                            alt={story.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                              {story.category || 'Company News'}
                            </span>
                          </div>
                        </div>

                        {/* Story Content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {story.title}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-3">
                            {story.excerpt}
                          </p>

                          {/* Story Meta */}
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <FiUser className="w-4 h-4" />
                                <span>{story.author || 'Admin'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FiCalendar className="w-4 h-4" />
                                <span>
                                  {new Date(story.publishedAt || story.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              </div>
                            </div>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {story.readTime ? `${story.readTime} min read` : '2 min read'}
                            </span>
                          </div>

                          {/* Read More Link */}
                          <Link
                            to={`/story/${story.slug}`}
                            className="inline-flex items-center text-golden-600 hover:text-golden-700 font-semibold transition-colors"
                          >
                            Read More
                            <FiArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </div>
                      </motion.article>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-gray-100 py-16">
          <div className="container text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Stay Updated
              </h2>
              <p className="text-gray-600 mb-8">
                Be the first to know about our latest products, partnerships, and company news. 
                Follow our journey as we continue to bring authentic African products to the world.
              </p>
              <Link
                to="/contact"
                className="bg-golden-600 text-white px-8 py-3 rounded-lg hover:bg-golden-700 transition-colors font-semibold"
              >
                Get in Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Stories;