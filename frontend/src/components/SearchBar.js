import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced search function
  const debouncedSearch = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  const debouncedSearchHandler = debouncedSearch((term) => {
    onSearch(term);
  }, 300);

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearchHandler(value);
  };



  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
        />
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
