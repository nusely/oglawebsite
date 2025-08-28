import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import ProductHeroSlider from '../components/ProductHeroSlider';
import SearchBar from '../components/SearchBar';
import FilterTags from '../components/FilterTags';
import SearchResults from '../components/SearchResults';

const Products = () => {
  const { products } = useProducts();
  const { addToRequest } = useRequestBasket();
  
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  // Extract unique brands and categories from products
  const brands = [...new Set(products.map(product => product.brandId))].sort();
  const categories = [...new Set(products.map(product => product.category))].sort();

  // Update filtered products when products change
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  // Handle search
  const handleSearch = (searchResults) => {
    setFilteredProducts(searchResults);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Apply filters to products
    let filtered = products;
    
         if (newFilters.searchTerm) {
       const searchLower = newFilters.searchTerm.toLowerCase();
       filtered = filtered.filter(product => 
         product.name.toLowerCase().includes(searchLower) ||
         product.shortDescription?.toLowerCase().includes(searchLower) ||
         product.brandId?.toLowerCase().includes(searchLower) ||
         product.category.toLowerCase().includes(searchLower)
       );
     }
     
     if (newFilters.brand) {
       filtered = filtered.filter(product => product.brandId === newFilters.brand);
     }
    
    if (newFilters.category) {
      filtered = filtered.filter(product => product.category === newFilters.category);
    }
    
         if (newFilters.priceRange?.min || newFilters.priceRange?.max) {
       filtered = filtered.filter(product => {
         const price = product.pricing?.unitPrice || product.price;
         const min = newFilters.priceRange.min ? parseFloat(newFilters.priceRange.min) : 0;
         const max = newFilters.priceRange.max ? parseFloat(newFilters.priceRange.max) : Infinity;
         return price >= min && price <= max;
       });
     }
    
    setFilteredProducts(filtered);
  };

  // Handle removing individual filters
  const handleRemoveFilter = (filterType, filterValue) => {
    const newFilters = { ...filters };
    
    switch (filterType) {
      case 'brand':
        delete newFilters.brand;
        break;
      case 'category':
        delete newFilters.category;
        break;
      case 'price':
        delete newFilters.priceRange;
        break;
      case 'search':
        delete newFilters.searchTerm;
        break;
    }
    
    setFilters(newFilters);
    handleFilterChange(newFilters);
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setFilters({});
    setFilteredProducts(products);
  };

  // Handle adding product to request basket
  const handleAddToRequest = (product) => {
    addToRequest(product);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <ProductHeroSlider />
      
      {/* Search and Filter Section */}
      <div className="py-12 bg-white border-b border-gray-200">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
            <p className="text-xl text-gray-600">
              Discover our complete collection of premium products
            </p>
          </div>
          
          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            products={products}
            brands={brands}
            categories={categories}
          />
        </div>
      </div>

      {/* Products Section */}
      <div className="py-12">
        <div className="container">
          {/* Filter Tags */}
          <FilterTags
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />

          {/* Search Results */}
          <SearchResults
            products={filteredProducts}
            searchTerm={filters.searchTerm || ''}
            filters={filters}
            onAddToRequest={handleAddToRequest}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
