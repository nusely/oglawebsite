import React, { useState, useEffect } from 'react';
import { FiFilter } from 'react-icons/fi';
import SEOHead from '../components/SEOHead';
import SearchBar from '../components/SearchBar';
import FilterTags from '../components/FilterTags';
import SearchResults from '../components/SearchResults';
import ProductSidebar from '../components/ProductSidebar';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import { SearchResultsSkeleton } from '../components/LoadingSkeleton';

const Products = () => {
  const { products, loading, searchProducts } = useProducts();
  const { addToRequest } = useRequestBasket();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    brand: '',
    category: '',
    priceRange: { min: 0, max: 10000 },
    inStock: false,
    featured: false
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Reset pagination when search or filters change
  useEffect(() => {
    // This will trigger the SearchResults component to reset to page 1
  }, [searchQuery, filters]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleRemoveFilter = (filterType, filterValue) => {
    const newFilters = { ...filters };
    
    if (filterType === 'brand') {
      newFilters.brand = '';
    } else if (filterType === 'category') {
      newFilters.category = '';
    } else if (filterType === 'price') {
      newFilters.priceRange = { min: 0, max: 10000 };
    }
    
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      brand: '',
      category: '',
      priceRange: { min: 0, max: 10000 },
      inStock: false,
      featured: false
    });
  };

  // Filter products based on search and filters
  const filteredProducts = searchProducts(searchQuery, {
    brandId: filters.brand,
    category: filters.category,
    priceRange: filters.priceRange,
    inStock: filters.inStock,
    featured: filters.featured
  });

  if (loading) {
    return (
      <>
        <SEOHead 
          title="All Products - Shea Butter, Textiles & Business Solutions"
          description="Browse our complete collection of premium shea butter products, authentic African textiles, and innovative business solutions. Find the perfect products for your business needs."
          keywords="shea butter products, African textiles, business solutions, wholesale products, La Veeda, AfriSmocks, OgriBusiness, Ghana products, B2B trading"
          image="/images/products-hero.jpg"
          type="website"
        />
        
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="container">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
              <p className="text-xl text-gray-600">
                Discover our complete collection of premium African products
              </p>
            </div>
            <SearchResultsSkeleton count={12} />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead 
        title="All Products - Shea Butter, Textiles & Business Solutions"
        description="Browse our complete collection of premium shea butter products, authentic African textiles, and innovative business solutions. Find the perfect products for your business needs."
        keywords="shea butter products, African textiles, business solutions, wholesale products, La Veeda, AfriSmocks, OgriBusiness, Ghana products, B2B trading"
        image="/images/products-hero.jpg"
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h1>
            <p className="text-xl text-gray-600">
              Discover our complete collection of premium African products
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-golden-500 transition-colors"
            >
              <FiFilter className="h-5 w-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Show Filters</span>
            </button>
          </div>

          {/* Main Content with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <ProductSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
              className="lg:w-80 flex-shrink-0"
            />

            {/* Main Content */}
            <div className="flex-1">
              {/* Search Bar */}
              <div className="mb-6">
                <SearchBar 
                  onSearch={handleSearch}
                />
              </div>

              {/* Active Filters */}
              {(filters.brand || filters.category || filters.priceRange.min > 0 || filters.priceRange.max < 10000 || filters.inStock || filters.featured) && (
                <div className="mb-6">
                  <FilterTags 
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                    onClearAll={handleClearFilters}
                  />
                </div>
              )}

              {/* Search Results with Enhanced Pagination */}
              <SearchResults 
                products={filteredProducts}
                searchTerm={searchQuery}
                filters={filters}
                onAddToRequest={addToRequest}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
