import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    brandId: '',
    categoryId: '',
    mainImage: null,
    mainImagePreview: '',
    removeMainImage: false,
    additionalImages: [null, null, null], // Multiple images for gallery
    additionalImagePreviews: ['', '', ''],
    removeAdditional: [false, false, false],
    specifications: {
      size: '',
      weight: '',
      origin: ''
    },
    pricing: {
      base: '',
      bulk: {
        '10': '',
        '50': '',
        '100': ''
      }
    },
    variants: [],
    isFeatured: false,
    isActive: true
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products from API...');
      const response = await api.get('/products');
      console.log('✅ API Response:', response.data);
      console.log('✅ Products count:', response.data.data.products?.length || 0);
      console.log('✅ Products data:', response.data.data.products);
      console.log('🔄 Setting products state...');
      setProducts(response.data.data.products || []);
      console.log('✅ Products state updated');
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      console.log('🔄 Falling back to mock data...');
      setProducts([
        {
          id: 1,
          name: '250ml Unrefined Shea Butter',
          description: 'Premium 250ml unrefined shea butter in convenient packaging for daily use.',
          shortDescription: 'Natural moisturizer for all skin types',
          pricing: { base: 25.00, bulk: { '10': 22.00, '50': 20.00, '100': 18.00 } },
          categoryName: 'Skincare',
          brandName: 'La Veeda',
          images: ['/images/sheabutter.jpg', '/images/sheabutter-2.jpg', '/images/sheabutter-3.jpg'],
          specifications: { size: '250ml', weight: '250g', origin: 'Ghana' },
          isFeatured: true,
          isActive: true
        },
        {
          id: 2,
          name: '500ml Virgin Coconut Oil',
          description: 'Cold-pressed virgin coconut oil for hair and skin care',
          shortDescription: 'Virgin coconut oil for natural care',
          pricing: { base: 35.00, bulk: { '10': 32.00, '50': 30.00, '100': 28.00 } },
          categoryName: 'Hair Care',
          brandName: 'Ogla Natural',
          images: ['/images/coconutoil.jpg', '/images/coconutoil-2.jpg', '/images/coconutoil-3.jpg'],
          specifications: { size: '500ml', weight: '500g', origin: 'Ghana' },
          isFeatured: false,
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data?.categories || []);
    } catch (error) {
      setCategories([
        { id: 1, name: 'Skincare' },
        { id: 2, name: 'Hair Care' },
        { id: 3, name: 'Body Care' }
      ]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await api.get('/brands');
      setBrands(response.data.data?.brands || []);
    } catch (error) {
      setBrands([
        { id: 1, name: 'Ogla Natural' },
        { id: 2, name: 'Pure Essentials' }
      ]);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      console.log('🚀 Starting product submission...');
      const submitData = new FormData();
      submitData.append('name', formData.name);
      // Slug will be auto-generated from name
      submitData.append('description', formData.description);
      submitData.append('shortDescription', formData.shortDescription);
      submitData.append('brandId', formData.brandId);
      submitData.append('categoryId', formData.categoryId);
      submitData.append('specifications', JSON.stringify(formData.specifications));
      submitData.append('pricing', JSON.stringify(formData.pricing));
      submitData.append('variants', JSON.stringify(formData.variants));
      submitData.append('isFeatured', formData.isFeatured ? '1' : '0');
      submitData.append('isActive', formData.isActive ? '1' : '0');
      
      if (formData.mainImage) {
        submitData.append('mainImage', formData.mainImage);
      }
      if (formData.removeMainImage) {
        submitData.append('removeMainImage', '1');
      }
      
      formData.additionalImages.forEach((image, index) => {
        if (image) {
          submitData.append(`additionalImages`, image);
        }
      });
      formData.removeAdditional.forEach((remove, index) => {
        if (remove) {
          submitData.append(`removeAdditional[]`, String(index));
        }
      });
      
      console.log('📤 Submitting form data:', {
        name: formData.name,
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
        hasMainImage: !!formData.mainImage,
        additionalImagesCount: formData.additionalImages.filter(img => img).length
      });
      
      if (showEditModal && selectedProduct) {
        console.log('🔄 Updating existing product...');
        const response = await api.put(`/products/${selectedProduct.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('✅ Product updated successfully:', response.data);
      } else {
        console.log('➕ Creating new product...');
        const response = await api.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log('✅ Product created successfully:', response.data);
        console.log('✅ Created product details:', response.data.data);
      }
      
      console.log('🔄 Refreshing products list...');
      await fetchProducts();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      console.log('✅ Product submission completed successfully!');
    } catch (error) {
      console.error('❌ Error saving product:', error);
      console.error('❌ Error details:', error.response?.data);
      alert('Error saving product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      await api.delete(`/products/${selectedProduct.id}`);
      fetchProducts();
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk operations
  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    try {
      setSubmitting(true);
      await api.post('/products/bulk/delete', { productIds: selectedProducts });
      setSelectedProducts([]);
      setShowBulkActions(false);
      fetchProducts();
    } catch (error) {
      console.error('Error bulk deleting products:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (selectedProducts.length === 0) return;
    
    try {
      setSubmitting(true);
      await api.post('/products/bulk/update-status', { 
        productIds: selectedProducts, 
        status: status ? 1 : 0 
      });
      setSelectedProducts([]);
      setShowBulkActions(false);
      fetchProducts();
    } catch (error) {
      console.error('Error bulk updating product status:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/products/export/csv', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting products:', error);
    }
  };

  const resetForm = () => {
          setFormData({
        name: '',
        description: '',
      shortDescription: '',
      brandId: '',
      categoryId: '',
      mainImage: null,
      mainImagePreview: '',
      removeMainImage: false,
      additionalImages: [null, null, null],
      additionalImagePreviews: ['', '', ''],
      removeAdditional: [false, false, false],
      specifications: {
        size: '',
        weight: '',
        origin: ''
      },
      pricing: {
        base: '',
        bulk: {
          '10': '',
          '50': '',
          '100': ''
        }
      },
      variants: [],
      isFeatured: false,
      isActive: true
    });
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        mainImage: file,
        mainImagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleAdditionalImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newAdditionalImages = [...formData.additionalImages];
      const newAdditionalImagePreviews = [...formData.additionalImagePreviews];
      
      newAdditionalImages[index] = file;
      newAdditionalImagePreviews[index] = URL.createObjectURL(file);
      
      setFormData({
        ...formData,
        additionalImages: newAdditionalImages,
        additionalImagePreviews: newAdditionalImagePreviews
      });
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      brandId: product.brandId || '',
      categoryId: product.categoryId || '',
      mainImage: null,
      mainImagePreview: product.images?.[0] || '',
      removeMainImage: false,
      additionalImages: [null, null, null],
      additionalImagePreviews: product.images?.slice(1) || ['', '', ''],
      removeAdditional: [false, false, false],
      specifications: product.specifications || {
        size: '',
        weight: '',
        origin: ''
      },
      pricing: product.pricing || {
        base: '',
        bulk: {
          '10': '',
          '50': '',
          '100': ''
        }
      },
      variants: product.variants || [],
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product(s) selected
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate(true)}
                disabled={submitting}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Activate All'}
              </button>
              <button
                onClick={() => handleBulkStatusUpdate(false)}
                disabled={submitting}
                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Deactivate All'}
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={submitting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.images?.[0] || 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'}
                            alt={product.name}
                            onError={(e) => { e.target.src = 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'; }}
                          />
                        </div>
                        <div className="ml-4">
                          <Link 
                            to={`/product/${product.slug}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                            target="_blank"
                          >
                            {product.name}
                          </Link>
                          <div className="text-sm text-gray-500">{product.shortDescription || product.description.substring(0, 50)}...</div>
                        </div>
                      </div>
                    </td>
                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.categoryName || '-'}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.brandName || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.specifications?.size || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">GH₵{product.pricing?.base || product.price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">-</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Product"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Product"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {showEditModal ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                   <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                   <input
                     type="text"
                     required
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                     placeholder="e.g., Unrefined Shea Butter 250ml"
                     className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                   <p className="mt-1 text-xs text-gray-500">Slug will be auto-generated from the product name</p>
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Base Price (GH₵) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.pricing.base}
                    onChange={(e) => setFormData({
                      ...formData, 
                      pricing: {...formData.pricing, base: e.target.value}
                    })}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand *</label>
                  <select
                    required
                    value={formData.brandId}
                    onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Size</label>
                  <input
                    type="text"
                    value={formData.specifications.size}
                    onChange={(e) => setFormData({
                      ...formData, 
                      specifications: {...formData.specifications, size: e.target.value}
                    })}
                    placeholder="e.g., 250ml, 500ml, 1L"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Weight</label>
                  <input
                    type="text"
                    value={formData.specifications.weight}
                    onChange={(e) => setFormData({
                      ...formData, 
                      specifications: {...formData.specifications, weight: e.target.value}
                    })}
                    placeholder="e.g., 250g, 500g"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Origin</label>
                  <input
                    type="text"
                    value={formData.specifications.origin}
                    onChange={(e) => setFormData({
                      ...formData, 
                      specifications: {...formData.specifications, origin: e.target.value}
                    })}
                    placeholder="e.g., Ghana, Nigeria"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Variants Section */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Variants</label>
                <div className="space-y-3">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          placeholder="Variant name (e.g., Size, Color, Pattern)"
                          value={variant.name || ''}
                          onChange={(e) => {
                            const newVariants = [...formData.variants];
                            newVariants[index] = { ...newVariants[index], name: e.target.value };
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          className="flex-1 mr-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newVariants = formData.variants.filter((_, i) => i !== index);
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-600">Options (comma-separated):</label>
                        <input
                          type="text"
                          placeholder="Small, Medium, Large"
                          value={variant.options ? variant.options.join(', ') : ''}
                          onChange={(e) => {
                            const options = e.target.value.split(',').map(opt => opt.trim()).filter(Boolean);
                            const newVariants = [...formData.variants];
                            newVariants[index] = { ...newVariants[index], options };
                            setFormData({ ...formData, variants: newVariants });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        variants: [...formData.variants, { name: '', options: [] }]
                      });
                    }}
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                  >
                    + Add Variant
                  </button>
                </div>
              </div>
              
              {/* Main Image */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Main Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMainImageChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formData.mainImagePreview && (
                  <div className="mt-2">
                    <div className="relative inline-block">
                      <img
                        src={formData.mainImagePreview}
                        alt="Main image preview"
                        className="h-32 w-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, mainImage: null, mainImagePreview: '', removeMainImage: true })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                        title="Remove main image"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (Gallery)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.additionalImagePreviews.map((image, index) => (
                    <div key={index}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAdditionalImageChange(index, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {image && (
                        <div className="mt-2 relative w-24 h-24 border border-gray-300 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'; }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = [...formData.additionalImagePreviews];
                              const newFiles = [...formData.additionalImages];
                              const newRemove = [...formData.removeAdditional];
                              newPreviews[index] = '';
                              newFiles[index] = null;
                              newRemove[index] = true;
                              setFormData({
                                ...formData,
                                additionalImagePreviews: newPreviews,
                                additionalImages: newFiles,
                                removeAdditional: newRemove
                              });
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                            title={`Remove image ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bulk Pricing */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulk Pricing (GH₵)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600">10+ units</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricing.bulk['10']}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {
                          ...formData.pricing,
                          bulk: {...formData.pricing.bulk, '10': e.target.value}
                        }
                      })}
                      placeholder="22.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">50+ units</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricing.bulk['50']}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {
                          ...formData.pricing,
                          bulk: {...formData.pricing.bulk, '50': e.target.value}
                        }
                      })}
                      placeholder="20.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">100+ units</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.pricing.bulk['100']}
                      onChange={(e) => setFormData({
                        ...formData, 
                        pricing: {
                          ...formData.pricing,
                          bulk: {...formData.pricing.bulk, '100': e.target.value}
                        }
                      })}
                      placeholder="18.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Product</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (showEditModal ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Product</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{selectedProduct?.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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

export default Products;
