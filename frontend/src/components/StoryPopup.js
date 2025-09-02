import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBookOpen, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import api from '../services/api';

const StoryPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [hasBeenTapped, setHasBeenTapped] = useState(false);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Fetch stories from API
  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/stories/popup-stories');
      if (response.data.success) {
        setStories(response.data.data);
      } else {
        console.warn('Failed to fetch stories, using fallback');
        // Fallback to sample data if API fails
        setStories([
          {
            id: 1,
            title: "Welcome to Ogla Shea Butter",
            excerpt: "Discover our premium African products and read the latest company news.",
            slug: "welcome"
          }
        ]);
      }
    } catch (error) {
      console.warn('Error fetching stories:', error);
      // Fallback to sample data
      setStories([
        {
          id: 1,
          title: "Stay Updated with Our Latest News",
          excerpt: "Check out our stories section for company updates and product announcements.",
          slug: "latest-news"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get random story
  const getRandomStory = () => {
    if (stories.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * stories.length);
    return stories[randomIndex];
  };

  // Show popup with random story
  const showPopup = () => {
    if (loading || stories.length === 0) return;
    
    const randomStory = getRandomStory();
    if (randomStory) {
      setCurrentStory(randomStory);
      setIsVisible(true);
      setIsExpanded(true);
    }
  };

  // Hide popup
  const hidePopup = () => {
    setIsExpanded(false);
    setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  // Handle icon click
  const handleIconClick = () => {
    if (isExpanded) {
      // If expanded, navigate to stories page
      window.location.href = '/stories';
    } else {
      // If collapsed, show popup
      showPopup();
    }
    setHasBeenTapped(true);
  };

  // Handle popup click (navigate to specific story)
  const handlePopupClick = () => {
    if (currentStory) {
      window.location.href = `/story/${currentStory.slug}`;
    }
    setHasBeenTapped(true);
  };

  // Check scroll position
  const handleScroll = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      // Only hide if user has scrolled past 70% or if they've scrolled significantly fast
      if (scrollPercent > 70 && isExpanded) {
        hidePopup();
      }
    }, 200); // Increased debounce time
  };

  useEffect(() => {
    // Fetch stories from API
    fetchStories();

    // Check if user has ever tapped (stored in localStorage)
    const hasTapped = localStorage.getItem('storyPopupTapped');
    if (hasTapped) {
      setHasBeenTapped(true);
    }

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Setup auto-show timer after stories are loaded
  useEffect(() => {
    if (!loading && stories.length > 0) {
      const hasTapped = localStorage.getItem('storyPopupTapped');
      // Show popup after 15 seconds if never tapped and stories are loaded
      if (!hasTapped) {
        timeoutRef.current = setTimeout(() => {
          showPopup();
        }, 15000); // 15 seconds (increased from 10)
      }
    }
  }, [loading, stories]);

  // Auto-hide popup after 12 seconds (increased for better reading time)
  useEffect(() => {
    if (isExpanded) {
      const autoHideTimeout = setTimeout(() => {
        hidePopup();
      }, 12000);

      return () => clearTimeout(autoHideTimeout);
    }
  }, [isExpanded]);

  // Keep icon visible longer after user interaction
  useEffect(() => {
    if (hasBeenTapped && !isVisible) {
      const iconHideTimeout = setTimeout(() => {
        setHasBeenTapped(false);
        localStorage.removeItem('storyPopupTapped');
      }, 30000); // 30 seconds instead of 8

      return () => clearTimeout(iconHideTimeout);
    }
  }, [hasBeenTapped, isVisible]);

  // Store tap state in localStorage
  useEffect(() => {
    if (hasBeenTapped) {
      localStorage.setItem('storyPopupTapped', 'true');
    }
  }, [hasBeenTapped]);

                       if (!isVisible && hasBeenTapped) {
       return (
         <motion.div
           initial={{ x: 100, opacity: 0 }}
           animate={{ x: 0, opacity: 1 }}
           transition={{ duration: 0.3 }}
           style={{ 
             position: 'fixed', 
             top: '50vh', 
             right: '0px', 
             transform: 'translateY(-50%)',
             zIndex: 99999
           }}
         >
        <button
          onClick={handleIconClick}
          className="bg-golden-600 text-white p-3 shadow-lg hover:bg-golden-700 transition-colors duration-300"
        >
          <FiBookOpen size={20} />
        </button>
      </motion.div>
    );
  }

  return (
    <>
             {/* Floating Icon (when popup is not visible) */}
                                                               {!isVisible && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              style={{ 
                position: 'fixed', 
                top: '50vh', 
                right: '0px', 
                transform: 'translateY(-50%)',
                zIndex: 99999
              }}
            >
           <button
             onClick={handleIconClick}
             className="bg-golden-600 text-white p-3 shadow-lg hover:bg-golden-700 transition-colors duration-300"
           >
             <FiBookOpen size={20} />
           </button>
         </motion.div>
       )}

             {/* Popup Overlay */}
       <AnimatePresence>
         {isVisible && (
                       <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9998,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
              onClick={hidePopup}
            >
             {/* Popup Content */}
             <motion.div
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.8, opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="bg-white rounded-xl shadow-2xl max-w-xs w-full p-4 relative"
               onClick={(e) => e.stopPropagation()}
             >
              {/* Close Button */}
              <button
                onClick={hidePopup}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>

                             {/* Story Content */}
               {currentStory && (
                 <div className="text-center">
                   <div className="w-8 h-8 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-3">
                     <FiBookOpen className="text-golden-600" size={16} />
                   </div>
                   
                   <h3 className="text-sm font-bold text-gray-900 mb-2 leading-tight">
                     {currentStory.title}
                   </h3>
                   
                   <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                     {currentStory.excerpt}
                   </p>

                   <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-3">
                     <FiClock size={12} />
                     <span>Latest News</span>
                   </div>

                   <button
                     onClick={handlePopupClick}
                     className="bg-golden-600 text-white px-4 py-1.5 rounded text-xs font-semibold hover:bg-golden-700 transition-colors duration-300"
                   >
                     Read Full Story
                   </button>
                 </div>
               )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StoryPopup;
