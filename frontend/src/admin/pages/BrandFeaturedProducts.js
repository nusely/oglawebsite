import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  StarIcon,
  TagIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const BrandFeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);

  const [formData, setFormData] = useState({
    brandId: '',
    productId: '',
    name: '',
    description: '',
    price: '',
    image: '',
    isActive: true
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchFeaturedProducts();
    fetchBrands();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/brand-featured-products');
      setFeaturedProducts(response.data.data.featuredProducts || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data?.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const fetchAvailableProducts = async (brandId) => {
    if (!brandId) return;
    
    try {
      console.log('Fetching products for brand ID:', brandId);
      const response = await api.get(`/brand-featured-products/available-products/${brandId}`);
      console.log('Products response:', response.data);
      setAvailableProducts(response.data.data.products || []);
      setFilteredProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching available products:', error);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(availableProducts);
    } else {
      const filtered = availableProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, availableProducts]);

  // Handle image file selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: '' })); // Clear URL if file is selected
    }
  };

  // Handle image URL input
  const handleImageUrlChange = (url) => {
    setFormData(prev => ({ ...prev, image: url }));
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const handleBrandChange = (brandId) => {
    setFormData(prev => ({ ...prev, brandId, productId: '' }));
    if (brandId) {
      fetchAvailableProducts(brandId);
    }
  };

  const handleProductSelect = (product) => {
    setFormData(prev => ({
      ...prev,
      productId: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      image: product.mainImage || ''
    }));
    setShowProductSelector(false);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      submitData.append('brandId', formData.brandId);
      submitData.append('productId', formData.productId || '');
      submitData.append('name', formData.name);
      submitData.append('description', formData.description || '');
      submitData.append('price', formData.price);
      submitData.append('isActive', formData.isActive);
      
      if (selectedImageFile) {
        submitData.append('image', selectedImageFile);
      } else if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      if (selectedProduct) {
        // Update existing
        await api.put(`/brand-featured-products/${selectedProduct.id}`, submitData);
      } else {
        // Create new
        await api.post('/brand-featured-products', submitData);
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      setSelectedProduct(null);
      resetForm();
      fetchFeaturedProducts();
    } catch (error) {
      console.error('Error saving featured product:', error);
      alert('Error saving featured product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      setSubmitting(true);
      await api.delete(`/brand-featured-products/${selectedProduct.id}`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchFeaturedProducts();
    } catch (error) {
      console.error('Error deleting featured product:', error);
      alert('Error deleting featured product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      brandId: '',
      productId: '',
      name: '',
      description: '',
      price: '',
      image: '',
      isActive: true
    });
    setSearchTerm('');
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      brandId: product.brandId,
      productId: product.productId || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      image: product.image,
      isActive: product.isActive !== false
    });
    setImagePreview(product.image);
    setSelectedImageFile(null);
    if (product.brandId) {
      fetchAvailableProducts(product.brandId);
    }
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown Brand';
  };

  const getBrandSlug = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.slug : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
                 <div>
           <h1 className="text-3xl font-bold text-gray-900">Featured Products</h1>
           <p className="text-gray-600 mt-2">Manage featured products for each brand</p>
         </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Featured Product</span>
        </button>
      </div>

      {/* Featured Products List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Current Featured Products ({featuredProducts.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {featuredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-lg overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png';
                      }}
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
                                         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                       product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                       {product.isActive ? 'Active' : 'Inactive'}
                     </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <BuildingStorefrontIcon className="w-4 h-4" />
                      <span>{getBrandName(product.brandId)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <TagIcon className="w-4 h-4" />
                      <span className="font-semibold text-green-600">{product.price}</span>
                    </div>
                    {product.productId && (
                      <div className="flex items-center space-x-1">
                        <StarIcon className="w-4 h-4" />
                        <span>Linked to Product</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit Featured Product"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(product)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete Featured Product"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {featuredProducts.length === 0 && (
            <div className="px-6 py-12 text-center">
              <TagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No featured products yet</p>
              <p className="text-gray-400 text-sm">Add your first featured product to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProduct ? 'Edit Featured Product' : 'Add Featured Product'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedProduct(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              {/* Brand Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand *
                </label>
                <select
                  value={formData.brandId}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a brand</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Selection */}
              {formData.brandId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link to Existing Product (Optional)
                  </label>
                  
                  {/* Search Input */}
                  <div className="relative mb-3">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                  
                  {/* Product Dropdown */}
                  <select
                    value={formData.productId}
                    onChange={(e) => {
                      const product = filteredProducts.find(p => p.id == e.target.value);
                      if (product) {
                        handleProductSelect(product);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select from existing products</option>
                    {filteredProducts.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.categoryName}
                      </option>
                    ))}
                  </select>
                  
                  {filteredProducts.length === 0 && searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">No products found matching "{searchTerm}"</p>
                  )}
                </div>
              )}

              {/* Product Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    required
                    placeholder="₵0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image *
                </label>
                
                {/* File Upload */}
                <div className="mb-3">
                  <label className="block text-sm text-gray-600 mb-2">
                    Upload from device:
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md cursor-pointer hover:bg-blue-100"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      <span>Choose Image</span>
                    </label>
                    {selectedImageFile && (
                      <span className="text-sm text-green-600">
                        ✓ {selectedImageFile.name}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Image Preview */}
                {(imagePreview || selectedImageFile) && (
                  <div className="mb-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {/* URL Input (Alternative) */}
                <div>
                  <label className="block text-sm text-gray-600 mb-2">
                    Or provide image URL:
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {/* Validation Message */}
                {!selectedImageFile && !formData.image && (
                  <p className="text-sm text-red-500 mt-1">
                    Please either upload an image file or provide an image URL
                  </p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedProduct(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (selectedProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Featured Product</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandFeaturedProducts;
