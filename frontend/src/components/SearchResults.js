import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiChevronDown, FiSearch } from 'react-icons/fi';
import ProductCard from './ProductCard';
import { useAuth } from '../contexts/AuthContext';

const SearchResults = ({ 
  products, 
  searchTerm, 
  filters, 
  onAddToRequest,
  viewMode = 'grid',
  onViewModeChange 
}) => {
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'brand':
        aValue = a.brand.toLowerCase();
        bValue = b.brand.toLowerCase();
        break;
      case 'category':
        aValue = a.category.toLowerCase();
        bValue = b.category.toLowerCase();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = sortedProducts.slice(startIndex, endIndex);

  const handleSortChange = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.brand || filters.category || filters.priceRange?.min || filters.priceRange?.max;

  return (
    <div className="w-full">
      {/* Results Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Results Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? `Search Results for "${searchTerm}"` : 'All Products'}
            </h2>
            <p className="text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
              {hasActiveFilters && ' with applied filters'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                  setCurrentPage(1);
                }}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
                <option value="brand-asc">Brand A-Z</option>
                <option value="category-asc">Category A-Z</option>
              </select>
              <FiChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-golden-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-golden-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FiList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <AnimatePresence mode="wait">
        {currentProducts.length > 0 ? (
          <motion.div
            key={`${viewMode}-${currentPage}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToRequest={onAddToRequest}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {currentProducts.map((product) => (
                  <motion.div
                    key={product._id || product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                  >
                    {/* Desktop: Horizontal Layout */}
                    <div className="hidden sm:flex items-center gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={product.images?.[0] || product.image || '/images/product-placeholder.png'}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {product.shortDescription || product.description || 'Natural product for all types'}
                        </p>
                        
                        {/* Available Sizes/Variants */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mb-2">
                            <div className="flex flex-wrap gap-1">
                              {product.variants[0].options.slice(0, 3).map((option, index) => (
                                <span 
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                >
                                  {option}
                                </span>
                              ))}
                              {product.variants[0].options.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.variants[0].options.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Price and Action */}
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {new Intl.NumberFormat('en-GH', {
                            style: 'currency',
                            currency: 'GHS'
                          }).format(product.pricing?.unitPrice || product.price || 0)}
                        </p>
                        {(product.pricing?.bulkPricing && product.pricing.bulkPricing.length > 0) || product.bulkPricing && (
                          <p className="text-xs text-gray-500 mb-2">
                            Bulk pricing available
                          </p>
                        )}
                        {/* Add to Request Button - Hidden for admins */}
                        {(!user || (user.role !== 'admin' && user.role !== 'super_admin')) && (
                          <button
                            onClick={() => onAddToRequest(product)}
                            className="bg-golden-600 text-white px-4 py-2 rounded-lg hover:bg-golden-700 transition-colors font-medium"
                          >
                            Add to Request
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile: Vertical Layout */}
                    <div className="sm:hidden">
                      {/* Product Image - Top */}
                      <div className="relative mb-4">
                        <img
                          src={product.images?.[0] || product.image || '/images/product-placeholder.png'}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="absolute top-3 left-3">
                            <span className="bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div>
                        {/* Product Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {product.name}
                        </h3>
                        
                        {/* Product Description */}
                        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                          {product.shortDescription || product.description || 'Natural product for all types'}
                        </p>
                        
                        {/* Available Sizes/Variants */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {product.variants[0].options.slice(0, 3).map((option, index) => (
                                <span 
                                  key={index}
                                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                                >
                                  {option}
                                </span>
                              ))}
                              {product.variants[0].options.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{product.variants[0].options.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Bottom Section with Semi-transparent Bar */}
                        <div className="bg-gray-50 bg-opacity-50 -mx-4 px-4 py-3 mt-4">
                          <div className="flex items-center justify-between">
                            {/* Price Tag - Simple text, not a button */}
                            <div className="text-lg font-bold text-gray-900">
                              {new Intl.NumberFormat('en-GH', {
                                style: 'currency',
                                currency: 'GHS'
                              }).format(product.pricing?.unitPrice || product.price || 0)}
                            </div>
                            
                            {/* Add to Request Button */}
                            {/* Add to Request Button - Hidden for admins */}
                            {(!user || (user.role !== 'admin' && user.role !== 'super_admin')) && (
                              <button
                                onClick={() => onAddToRequest(product)}
                                className="bg-golden-600 text-white px-6 py-2 rounded-lg hover:bg-golden-700 transition-colors font-medium"
                              >
                                Add to Request
                              </button>
                            )}
                          </div>
                          
                          {/* Bulk Pricing Info */}
                          {(product.pricing?.bulkPricing && product.pricing.bulkPricing.length > 0) || product.bulkPricing && (
                            <p className="text-xs text-gray-600 mt-2 text-center">
                              Bulk pricing available
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiSearch className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? `No products match your search for "${searchTerm}"`
                  : 'No products match your current filters'
                }
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-golden-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
