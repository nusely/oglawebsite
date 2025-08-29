import React, { useState, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder.png',
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    let observer;
    let currentImageRef;

    if (imageRef) {
      if (IntersectionObserver) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                setIsInView(true);
                observer.unobserve(entry.target);
              }
            });
          },
          {
            threshold,
            rootMargin
          }
        );
        observer.observe(imageRef);
        currentImageRef = imageRef;
      } else {
        // Fallback for older browsers
        setIsInView(true);
      }
    }

    return () => {
      if (observer && currentImageRef) {
        observer.unobserve(currentImageRef);
      }
    };
  }, [imageRef, threshold, rootMargin]);

  useEffect(() => {
    if (isInView) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setImageSrc(placeholder);
    setIsLoaded(true);
  };

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default LazyImage;
