import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import api from '../services/api';

const StoryDetail = () => {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch story from API
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/stories/${slug}`);
        
        if (response.data.success) {
          setStory(response.data.data);
        } else {
          setError('Story not found');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchStory();
    }
  }, [slug]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  // Error state or story not found
  if (error || !story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The story you're looking for doesn't exist."}</p>
          <Link to="/stories" className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors">
            Back to Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={`${story.title} - Ogla Shea Butter & General Trading`}
        description={story.excerpt}
        keywords={`${story.category || 'Company News'}, Ogla news, shea butter, Ghana business`}
        image={story.image_url}
        type="article"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Back Button */}
        <div className="bg-white border-b border-gray-200">
          <div className="container py-4">
            <Link 
              to="/stories" 
              className="inline-flex items-center text-golden-600 hover:text-golden-700 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Back to Stories
            </Link>
          </div>
        </div>

        {/* Story Content */}
        <div className="container py-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            {/* Story Header */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
              <div className="relative h-64 md:h-80">
                <img
                  src={story.image_url || "https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp"}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="bg-golden-600 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3 inline-block">
                    {story.category || 'Company News'}
                  </span>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                    {story.title}
                  </h1>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <FiUser className="w-4 h-4" />
                      <span>By {story.author || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      <span>{new Date(story.publishedAt || story.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4" />
                      <span>{story.readTime ? `${story.readTime} min read` : '2 min read'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Story Body */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="prose prose-lg max-w-none">
                {story.content.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-6">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Story Footer */}
              <div className="border-t border-gray-200 mt-8 pt-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">Share this story:</span>
                    <div className="flex gap-2">
                      <button className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <span className="text-xs font-bold">f</span>
                      </button>
                      <button className="w-8 h-8 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                        <span className="text-xs font-bold">t</span>
                      </button>
                      <button className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors">
                        <span className="text-xs font-bold">w</span>
                      </button>
                    </div>
                  </div>
                  <Link 
                    to="/stories" 
                    className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors"
                  >
                    More Stories
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default StoryDetail;