import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top with multiple methods
    const forceScrollToTop = () => {
      // Method 1: Window scroll
      window.scrollTo(0, 0);
      
      // Method 2: Document elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Method 3: Main element
      const mainElement = document.querySelector('main');
      if (mainElement) {
        mainElement.scrollTop = 0;
        mainElement.scrollLeft = 0;
      }
      
      // Method 4: Force layout recalculation
      document.body.style.scrollBehavior = 'auto';
      window.scrollTo(0, 0);
      document.body.style.scrollBehavior = '';
    };

    // Execute immediately
    forceScrollToTop();
    
    // Execute after a short delay to handle any async rendering
    const immediateTimer = setTimeout(forceScrollToTop, 10);
    
    // Execute after page transitions
    const transitionTimer = setTimeout(forceScrollToTop, 300);
    
    // Execute after all animations complete
    const animationTimer = setTimeout(forceScrollToTop, 800);

    return () => {
      clearTimeout(immediateTimer);
      clearTimeout(transitionTimer);
      clearTimeout(animationTimer);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
