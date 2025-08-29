import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiShoppingBag } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-9xl font-bold text-golden-600 mb-4">404</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700"
          >
            <FiHome className="w-5 h-5" />
            Go Home
          </Link>
          
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-lg border border-gray-300 hover:border-golden-600"
          >
            <FiShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
