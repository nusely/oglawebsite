import React, { Suspense } from 'react';

const LazyLoad = ({ children, fallback = null }) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default LazyLoad;
