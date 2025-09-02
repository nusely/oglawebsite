import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';

const FilterTags = ({ filters, onRemoveFilter, onClearAll }) => {
  const { brands } = useProducts();
  const activeFilters = [];

  // Extract active filters from the filters object
  if (filters.brand) {
    // Find brand name from ID
    const brand = brands.find(b => (b._id || b.id) == filters.brand);
    const brandName = brand ? brand.name : `Brand ${filters.brand}`;
    activeFilters.push({ type: 'brand', label: brandName, value: filters.brand });
  }
  if (filters.category) {
    activeFilters.push({ type: 'category', label: filters.category, value: filters.category });
  }
  if (filters.priceRange?.min || filters.priceRange?.max) {
    const min = filters.priceRange.min || '0';
    const max = filters.priceRange.max || '∞';
    activeFilters.push({ 
      type: 'price', 
      label: `GHS ${min} - GHS ${max}`, 
      value: { min, max } 
    });
  }
  if (filters.searchTerm) {
    activeFilters.push({ type: 'search', label: `"${filters.searchTerm}"`, value: filters.searchTerm });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Active Filters ({activeFilters.length})
        </h3>
        {activeFilters.length > 1 && (
          <button
            onClick={onClearAll}
            className="text-sm text-golden-600 hover:text-golden-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {activeFilters.map((filter, index) => (
            <motion.div
              key={`${filter.type}-${filter.value}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="inline-flex items-center bg-golden-50 text-golden-700 px-3 py-1.5 rounded-full text-sm font-medium border border-golden-200"
            >
              <span className="capitalize mr-1">{filter.type}:</span>
              <span>{filter.label}</span>
              <button
                onClick={() => onRemoveFilter(filter.type, filter.value)}
                className="ml-2 p-0.5 hover:bg-golden-200 rounded-full transition-colors"
              >
                <FiX className="h-3 w-3" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilterTags;
