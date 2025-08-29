import { useEffect } from 'react';
import { measureWebVitals, getMemoryUsage, clearExpiredCache } from '../utils/performance';

const PerformanceMonitor = () => {
  useEffect(() => {
    // Initialize performance monitoring
    measureWebVitals();
    
    // Clear expired cache periodically
    const cacheInterval = setInterval(clearExpiredCache, 5 * 60 * 1000); // Every 5 minutes
    
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development') {
      const memoryInterval = setInterval(() => {
        const memory = getMemoryUsage();
        if (memory) {
          const usedMB = Math.round(memory.used / 1024 / 1024);
          const totalMB = Math.round(memory.total / 1024 / 1024);
          const limitMB = Math.round(memory.limit / 1024 / 1024);
          
          console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`);
          
          // Warn if memory usage is high
          if (memory.used / memory.limit > 0.8) {
            console.warn('High memory usage detected!');
          }
        }
      }, 30 * 1000); // Every 30 seconds
      
      return () => {
        clearInterval(cacheInterval);
        clearInterval(memoryInterval);
      };
    }
    
    return () => {
      clearInterval(cacheInterval);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
