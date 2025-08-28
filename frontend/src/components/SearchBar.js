import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';

const SearchBar = ({ onSearch, onFilterChange, products, brands, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedBrand, selectedCategory, priceRange]);

  const performSearch = () => {
    setIsSearching(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const filtered = products.filter(product => {
                 const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.brandId?.toLowerCase().includes(searchTerm.toLowerCase());
         
         const matchesBrand = !selectedBrand || product.brandId === selectedBrand;
         const matchesCategory = !selectedCategory || product.category === selectedCategory;
         
         const productPrice = product.pricing?.unitPrice || product.price;
         const matchesPrice = (!priceRange.min || productPrice >= parseFloat(priceRange.min)) &&
                            (!priceRange.max || productPrice <= parseFloat(priceRange.max));
        
        return matchesSearch && matchesBrand && matchesCategory && matchesPrice;
      });
      
      setSearchResults(filtered);
      setIsSearching(false);
      
      // Call parent callback
      onSearch && onSearch(filtered);
    }, 200);
  };

  const handleFilterChange = () => {
    const filters = {
      brand: selectedBrand,
      category: selectedCategory,
      priceRange,
      searchTerm
    };
    onFilterChange && onFilterChange(filters);
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSearchTerm('');
    setSearchResults([]);
    onSearch && onSearch(products);
    onFilterChange && onFilterChange({});
  };

  const hasActiveFilters = selectedBrand || selectedCategory || priceRange.min || priceRange.max;

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Search Icon */}
          <div className="pl-4 pr-3">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search products, brands, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="flex-1 py-4 px-3 text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
          />
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-4 transition-colors duration-200 ${
              hasActiveFilters 
                ? 'bg-golden-100 text-golden-700' 
                : 'text-gray-500 hover:text-golden-600'
            }`}
          >
            <FiFilter className="h-5 w-5" />
          </button>
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                  >
                    <option value="">All Brands</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                    />
                    <span className="flex items-center text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {hasActiveFilters && (
                    <span>Active filters applied</span>
                  )}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isExpanded && searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {isSearching ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-golden-600 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : (
              <div className="py-2">
                {searchResults.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                                             <div className="flex-1">
                         <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                         <p className="text-xs text-gray-500">{product.brandId} • {product.category}</p>
                         <p className="text-sm font-semibold text-golden-600">${product.pricing?.unitPrice || product.price}</p>
                       </div>
                    </div>
                  </div>
                ))}
                {searchResults.length > 5 && (
                  <div className="px-4 py-3 text-sm text-golden-600 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
                    View all {searchResults.length} results
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default SearchBar;
