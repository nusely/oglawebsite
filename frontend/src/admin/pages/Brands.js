import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null,
    logoPreview: '',
    website_url: '',
    brandColors: {
      primary: '#1b4332',
      secondary: '#2d6a4f',
      accent: '#40916c'
    },
    isActive: true
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      console.log('🔄 Fetching brands with timestamp:', timestamp);
      const response = await api.get(`/brands/admin/all?t=${timestamp}&nocache=${Math.random()}`);
      console.log('🔄 Brands response:', response.data);
      setBrands(response.data.data?.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.website_url.trim()) {
      alert('Website URL is required. Please enter a valid website URL.');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(formData.website_url);
    } catch (error) {
      alert('Please enter a valid website URL (e.g., https://example.com)');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      // Slug will be auto-generated from name
      submitData.append('description', formData.description);
      submitData.append('website_url', formData.website_url);
      submitData.append('brandColors', JSON.stringify(formData.brandColors));
      submitData.append('isActive', formData.isActive);
      
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }
      
      if (showEditModal && selectedBrand) {
        await api.put(`/brands/${selectedBrand.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/brands', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      const response = await api.get(`/brands/admin/all?t=${timestamp}`);
      setBrands(response.data.data?.brands || []);
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      alert(showEditModal ? 'Brand updated successfully!' : 'Brand created successfully!');
    } catch (error) {
      console.error('Error saving brand:', error);
      const errorMessage = error.response?.data?.message || 'Error saving brand. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      console.log('🗑️ Attempting to delete brand:', selectedBrand);
      console.log('🗑️ Brand ID being sent:', selectedBrand.id);
      
      const response = await api.delete(`/brands/${selectedBrand.id}`);
      console.log('🗑️ Delete response:', response.data);
      
      if (response.data.success) {
        // Force refresh with cache busting
        const timestamp = Date.now();
        console.log('🔄 Refreshing brands list...');
        const refreshResponse = await api.get(`/brands/admin/all?t=${timestamp}&nocache=${Math.random()}`);
        console.log('🔄 Refresh response:', refreshResponse.data);
        setBrands(refreshResponse.data.data?.brands || []);
        setShowDeleteModal(false);
        setSelectedBrand(null);
        alert('Brand deleted successfully!');
      }
    } catch (error) {
      console.error('❌ Error deleting brand:', error);
      console.error('❌ Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error deleting brand. Please try again.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo: null,
      logoPreview: '',
      website_url: '',
      brandColors: {
        primary: '#1b4332',
        secondary: '#2d6a4f',
        accent: '#40916c'
      },
      isActive: true
    });
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name || '',
      description: brand.description || '',
      logo: null,
      logoPreview: brand.logo || '',
      website_url: brand.website_url || '',
      brandColors: brand.brandColors || {
        primary: '#1b4332',
        secondary: '#2d6a4f',
        accent: '#40916c'
      },
      isActive: brand.isActive !== false
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (brand) => {
    console.log('🔍 Brand object for deletion:', brand);
    console.log('🔍 Brand ID:', brand.id);
    console.log('🔍 Brand _id:', brand._id);
    setSelectedBrand(brand);
    setShowDeleteModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      });
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands Management</h1>
          <p className="text-gray-600">Manage your product brands</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Brand</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading brands...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={brand.logo_url || 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'}
                            alt={brand.name}
                            onError={(e) => { e.target.src = 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'; }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{brand.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.website_url ? (
                        <a 
                          href={brand.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Visit Site
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        brand.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {brand.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(brand)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Brand"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(brand)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Brand"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {showEditModal ? 'Edit Brand' : 'Add New Brand'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="La Veeda, AfriSmocks, Ogribusiness"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Slug will be auto-generated from the brand name</p>
                </div>

              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Brand Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.logoPreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={formData.logoPreview}
                        alt="Logo preview"
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            logo: null,
                            logoPreview: '',
                            removeLogo: true
                          });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        title="Remove logo"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={formData.website_url}
                    onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                    placeholder="https://brand-website.com"
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Colors</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600">Primary Color</label>
                    <input
                      type="color"
                      value={formData.brandColors.primary}
                      onChange={(e) => setFormData({
                        ...formData, 
                        brandColors: {...formData.brandColors, primary: e.target.value}
                      })}
                      className="mt-1 w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Secondary Color</label>
                    <input
                      type="color"
                      value={formData.brandColors.secondary}
                      onChange={(e) => setFormData({
                        ...formData, 
                        brandColors: {...formData.brandColors, secondary: e.target.value}
                      })}
                      className="mt-1 w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Accent Color</label>
                    <input
                      type="color"
                      value={formData.brandColors.accent}
                      onChange={(e) => setFormData({
                        ...formData, 
                        brandColors: {...formData.brandColors, accent: e.target.value}
                      })}
                      className="mt-1 w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-4">
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
                  {submitting ? 'Saving...' : (showEditModal ? 'Update Brand' : 'Add Brand')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Brand</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{selectedBrand?.name}</strong>"? This action cannot be undone.
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

export default Brands;
