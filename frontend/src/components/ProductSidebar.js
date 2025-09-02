import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiSliders } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';

const ProductSidebar = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  isOpen, 
  onToggle,
  className = "" 
}) => {
  const { brands, products } = useProducts();
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    category: true,
    price: true,
    availability: true
  });

  // Get unique categories from products
  const categories = [...new Set(products.map(product => product.categoryName || product.category))].filter(Boolean);

  // Get price range from products
  const prices = products.map(product => {
    return product.price || product.pricing?.base || product.pricing?.unitPrice || 0;
  }).filter(price => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };
    
    if (filterType === 'priceRange') {
      newFilters.priceRange = { ...newFilters.priceRange, ...value };
    } else {
      newFilters[filterType] = value;
    }
    
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    onClearFilters();
  };

  const hasActiveFilters = filters.brand || filters.category || 
    filters.priceRange.min > minPrice || filters.priceRange.max < maxPrice;

  // Mobile overlay component
  const MobileOverlay = () => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Filters</h2>
                <button
                  onClick={onToggle}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Sidebar content component (reusable for both mobile and desktop)
  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-golden-50 border border-golden-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-golden-800">Active Filters</span>
            <button
              onClick={handleClearFilters}
              className="text-xs text-golden-600 hover:text-golden-800 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="text-xs text-golden-700">
            {filters.brand && <div>Brand: {filters.brand}</div>}
            {filters.category && <div>Category: {filters.category}</div>}
            {(filters.priceRange.min > minPrice || filters.priceRange.max < maxPrice) && (
              <div>Price: GHS {filters.priceRange.min} - GHS {filters.priceRange.max}</div>
            )}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      <FilterSection
        title="Brand"
        isExpanded={expandedSections.brand}
        onToggle={() => toggleSection('brand')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="brand"
              value=""
              checked={filters.brand === ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="mr-3 text-golden-600 focus:ring-golden-500"
            />
            <span className="text-sm text-gray-700">All Brands</span>
          </label>
          {brands.map((brand) => (
            <label key={brand._id || brand.id} className="flex items-center">
              <input
                type="radio"
                name="brand"
                value={brand._id || brand.id}
                checked={filters.brand == (brand._id || brand.id)}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="mr-3 text-golden-600 focus:ring-golden-500"
              />
              <span className="text-sm text-gray-700">{brand.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Category Filter */}
      <FilterSection
        title="Category"
        isExpanded={expandedSections.category}
        onToggle={() => toggleSection('category')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="category"
              value=""
              checked={filters.category === ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="mr-3 text-golden-600 focus:ring-golden-500"
            />
            <span className="text-sm text-gray-700">All Categories</span>
          </label>
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="mr-3 text-golden-600 focus:ring-golden-500"
              />
              <span className="text-sm text-gray-700 capitalize">{category.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range Filter */}
      <FilterSection
        title="Price Range"
        isExpanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Min (GHS)</label>
              <input
                type="number"
                placeholder={minPrice.toString()}
                value={filters.priceRange.min === minPrice ? '' : filters.priceRange.min}
                onChange={(e) => handleFilterChange('priceRange', { 
                  min: parseFloat(e.target.value) || minPrice 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Max (GHS)</label>
              <input
                type="number"
                placeholder={maxPrice.toString()}
                value={filters.priceRange.max === maxPrice ? '' : filters.priceRange.max}
                onChange={(e) => handleFilterChange('priceRange', { 
                  max: parseFloat(e.target.value) || maxPrice 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
              />
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Range: GHS {minPrice} - GHS {maxPrice}
          </div>
        </div>
      </FilterSection>

      {/* Availability Filter */}
      <FilterSection
        title="Availability"
        isExpanded={expandedSections.availability}
        onToggle={() => toggleSection('availability')}
      >
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="mr-3 text-golden-600 focus:ring-golden-500 rounded"
            />
            <span className="text-sm text-gray-700">In Stock Only</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.checked)}
              className="mr-3 text-golden-600 focus:ring-golden-500 rounded"
            />
            <span className="text-sm text-gray-700">Featured Products</span>
          </label>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <MobileOverlay />
      
      {/* Desktop Sidebar */}
      <div className={`hidden lg:block ${className}`}>
        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            <FiSliders className="h-5 w-5 text-gray-400" />
          </div>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

// Filter Section Component
const FilterSection = ({ title, children, isExpanded, onToggle }) => (
  <div className="border-b border-gray-200 pb-4 last:border-b-0">
    <button
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left mb-3"
    >
      <h3 className="font-medium text-gray-900">{title}</h3>
      {isExpanded ? (
        <FiChevronUp className="h-4 w-4 text-gray-400" />
      ) : (
        <FiChevronDown className="h-4 w-4 text-gray-400" />
      )}
    </button>
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ProductSidebar;
