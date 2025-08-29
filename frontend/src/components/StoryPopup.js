import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiBookOpen, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StoryPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStory, setCurrentStory] = useState(null);
  const [hasBeenTapped, setHasBeenTapped] = useState(false);
  const timeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Sample stories data (this would come from your stories page)
  const stories = [
    {
      id: 1,
      title: "Ogla Shea Butter Expands to International Markets",
      excerpt: "We're excited to announce our expansion into European markets, bringing authentic Ghanaian shea butter to new customers worldwide.",
      slug: "international-expansion"
    },
    {
      id: 2,
      title: "New Partnership with Ghana Shea Alliance",
      excerpt: "Strategic collaboration with Ghana Shea Alliance to enhance quality standards and support local shea butter producers.",
      slug: "ghana-shea-alliance-partnership"
    },
    {
      id: 3,
      title: "Sustainable Farming Practices in Our Supply Chain",
      excerpt: "Discover how we're implementing eco-friendly farming methods to protect the environment while maintaining product quality.",
      slug: "sustainable-farming-practices"
    },
    {
      id: 4,
      title: "AfriSmocks Collection Launch Success",
      excerpt: "Our latest AfriSmocks collection has received overwhelming positive feedback from customers and fashion enthusiasts.",
      slug: "afrismocks-launch-success"
    },
    {
      id: 5,
      title: "Supporting Local Artisans Through OgriBusiness",
      excerpt: "How our OgriBusiness initiative is creating economic opportunities for local artisans and craftspeople.",
      slug: "supporting-local-artisans"
    },
    {
      id: 6,
      title: "Quality Assurance: Behind the Scenes",
      excerpt: "Take a look at our rigorous quality control processes that ensure every product meets our high standards.",
      slug: "quality-assurance-behind-scenes"
    }
  ];

  // Get random story
  const getRandomStory = () => {
    const randomIndex = Math.floor(Math.random() * stories.length);
    return stories[randomIndex];
  };

  // Show popup with random story
  const showPopup = () => {
    setCurrentStory(getRandomStory());
    setIsVisible(true);
    setIsExpanded(true);
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
      window.location.href = `/stories/${currentStory.slug}`;
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
      if (scrollPercent > 50 && isExpanded) {
        hidePopup();
      }
    }, 100);
  };

  useEffect(() => {
    // Check if user has ever tapped (stored in localStorage)
    const hasTapped = localStorage.getItem('storyPopupTapped');
    if (hasTapped) {
      setHasBeenTapped(true);
    }

    // Show popup after 10 seconds if never tapped
    if (!hasTapped) {
      timeoutRef.current = setTimeout(() => {
        showPopup();
      }, 10000); // 10 seconds
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

  // Auto-hide popup after 8 seconds
  useEffect(() => {
    if (isExpanded) {
      const autoHideTimeout = setTimeout(() => {
        hidePopup();
      }, 8000);

      return () => clearTimeout(autoHideTimeout);
    }
  }, [isExpanded]);

  // Auto-hide icon after 8 seconds if user has tapped
  useEffect(() => {
    if (hasBeenTapped && !isVisible) {
      const iconHideTimeout = setTimeout(() => {
        setHasBeenTapped(false);
        localStorage.removeItem('storyPopupTapped');
      }, 8000);

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
        className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50"
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
           className="fixed right-0 top-1/2 transform -translate-y-1/2 z-50"
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
             className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
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
