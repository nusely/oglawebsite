import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/quill-custom.css';
import api from '../../services/api';

// Client-side content sanitization function
const sanitizeContent = (content) => {
  if (!content) return content;
  
  let sanitized = content;
  
  // Remove data attributes and unwanted attributes
  sanitized = sanitized.replace(/data-[^=]+="[^"]*"/g, '');
  sanitized = sanitized.replace(/class="[^"]*"/g, '');
  sanitized = sanitized.replace(/style="[^"]*"/g, '');
  sanitized = sanitized.replace(/id="[^"]*"/g, '');
  
  // Remove empty paragraphs and elements
  sanitized = sanitized.replace(/<p[^>]*>\s*<\/p>/g, '');
  sanitized = sanitized.replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/g, '');
  sanitized = sanitized.replace(/<p[^>]*>\s*&nbsp;\s*<\/p>/g, '');
  
  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ');
  sanitized = sanitized.trim();
  
  return sanitized;
};

// Convert HTML to plain text function
const htmlToPlainText = (html) => {
  if (!html) return html;
  
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get text content and clean it up
  let text = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ');
  text = text.trim();
  
  // Add paragraph breaks for readability
  text = text.replace(/\n\s*\n/g, '\n\n');
  
  return text;
};

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: null,
    imagePreview: '',
    removeImage: false,
    isFeatured: false,
    isActive: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [convertToPlainText, setConvertToPlainText] = useState(false);

  const fetchStories = async () => {
    try {
      setLoading(true);
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await api.get(`/stories/admin/all?t=${timestamp}`);
      setStories(response.data.data?.stories || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setStories([
        {
          id: 1,
          title: 'The Journey of Shea Butter',
          slug: 'journey-of-shea-butter',
          excerpt: 'Discover the traditional process of making pure shea butter in Ghana',
          content: 'Shea butter has been a cornerstone of Ghanaian beauty and wellness for centuries...',
          image_url: '/images/stories/shea-butter-story.jpg',
          author: 'Admin User',
          readTime: 5,
          isFeatured: true,
          isActive: true,
          publishedAt: '2024-01-15',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          title: 'Sustainable Farming Practices',
          slug: 'sustainable-farming-practices',
          excerpt: 'How we maintain ecological balance while producing quality products',
          content: 'Our commitment to sustainable farming goes beyond just organic certification...',
          image_url: '/images/stories/sustainable-farming.jpg',
          author: 'Admin User',
          readTime: 8,
          isFeatured: false,
          isActive: true,
          publishedAt: '2024-01-10',
          createdAt: '2024-01-10'
        },
        {
          id: 3,
          title: 'Empowering Local Communities',
          slug: 'empowering-local-communities',
          excerpt: 'Supporting women entrepreneurs in rural Ghana',
          content: 'Through our partnerships with local communities, we create opportunities...',
          image_url: '/images/stories/community-empowerment.jpg',
          author: 'Admin User',
          readTime: 6,
          isFeatured: true,
          isActive: true,
          publishedAt: '2024-01-05',
          createdAt: '2024-01-05'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (story.author && story.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Debug logging for stories state
  useEffect(() => {
    console.log('📚 Stories state updated:', {
      totalStories: stories.length,
      activeStories: stories.filter(s => s.isActive !== 0).length,
      deletedStories: stories.filter(s => s.isActive === 0).length,
      stories: stories.map(s => ({ id: s.id, title: s.title, isActive: s.isActive }))
    });
  }, [stories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend validation
    if (!formData.title.trim()) {
      alert('Story title is required');
      return;
    }
    
    if (formData.title.trim().length < 5) {
      alert('Story title must be at least 5 characters');
      return;
    }
    
    if (formData.excerpt.trim() && formData.excerpt.trim().length < 10) {
      alert('Excerpt must be at least 10 characters if provided');
      return;
    }
    
    if (!formData.content.trim() || formData.content.trim().length < 50) {
      alert('Story content must be at least 50 characters');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Client-side content sanitization before sending to backend
      let finalContent = formData.content.trim();
      
      if (convertToPlainText) {
        // Convert HTML to plain text
        finalContent = htmlToPlainText(finalContent);
        console.log('📝 Converting to plain text:', {
          original: formData.content.substring(0, 100) + '...',
          plainText: finalContent.substring(0, 100) + '...'
        });
      } else {
        // Sanitize HTML content
        finalContent = sanitizeContent(finalContent);
        console.log('🧹 Client-side sanitization:', {
          original: formData.content.substring(0, 100) + '...',
          sanitized: finalContent.substring(0, 100) + '...'
        });
      }
      
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('excerpt', formData.excerpt.trim() || '');
      submitData.append('content', finalContent);
      submitData.append('isFeatured', formData.isFeatured);
      submitData.append('isActive', formData.isActive);
      if (formData.removeImage) submitData.append('removeImage', '1');
      
      if (formData.image) {
        submitData.append('image', formData.image);
      }
      
      if (showEditModal && selectedStory) {
        await api.put(`/stories/${selectedStory.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/stories', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      const response = await api.get(`/stories/admin/all?t=${timestamp}`);
      setStories(response.data.data?.stories || []);
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving story:', error);
      
      // Show specific error message from backend
      let errorMessage = 'Error saving story. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorDetails = error.response.data.errors.map(err => err.msg).join(', ');
        errorMessage = `Validation errors: ${errorDetails}`;
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      console.log('🗑️ Before delete - Stories count:', stories.length);
      console.log('🗑️ Deleting story ID:', selectedStory.id);
      
      const deleteResponse = await api.delete(`/stories/${selectedStory.id}`);
      console.log('🗑️ Delete response:', deleteResponse.data);
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      console.log('🗑️ Fetching updated stories with timestamp:', timestamp);
      
      const response = await api.get(`/stories/admin/all?t=${timestamp}`);
      console.log('🗑️ Fetch response data:', response.data);
      
      const updatedStories = response.data.data?.stories || [];
      console.log('🗑️ Updated stories count:', updatedStories.length);
      console.log('🗑️ Stories after update:', updatedStories.map(s => ({ id: s.id, title: s.title, isActive: s.isActive })));
      
      setStories(updatedStories);
      setShowDeleteModal(false);
      setSelectedStory(null);
      
      console.log('🗑️ State updated, stories count now:', updatedStories.length);
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Error deleting story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async (story) => {
    setSubmitting(true);
    try {
      await api.put(`/stories/${story.id}`, {
        ...story,
        isActive: true
      });
      
      // Force refresh with cache busting
      const timestamp = Date.now();
      const response = await api.get(`/stories/admin/all?t=${timestamp}`);
      setStories(response.data.data?.stories || []);
    } catch (error) {
      console.error('Error restoring story:', error);
      alert('Error restoring story. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: null,
      imagePreview: '',
      removeImage: false,
      isFeatured: false,
      isActive: true
    });
    setShowPreview(false);
    setConvertToPlainText(false);
  };

  const openEditModal = (story) => {
    setSelectedStory(story);
    setFormData({
      title: story.title || '',
      excerpt: story.excerpt || '',
      content: story.content || '',
      image: null,
      imagePreview: story.image_url || '',
      removeImage: false,
      isFeatured: story.isFeatured || false,
      isActive: story.isActive !== 0
    });
    setShowEditModal(true);
    setShowPreview(false);
    setConvertToPlainText(false);
  };

  const openDeleteModal = (story) => {
    setSelectedStory(story);
    setShowDeleteModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stories Management</h1>
          <p className="text-gray-600">Manage your blog stories and articles</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Story</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Stories Summary */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span className="text-gray-700">
              Active: {stories.filter(s => s.isActive !== 0).length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
            <span className="text-gray-700">
              Deleted: {stories.filter(s => s.isActive === 0).length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-700">
              Featured: {stories.filter(s => s.isFeatured).length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-gray-700">
              Total: {stories.length}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stories...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Story</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Read Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-16 flex-shrink-0">
                          <img
                            className="h-12 w-16 rounded-lg object-cover"
                            src={story.image_url || 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'}
                            alt={story.title}
                            onError={(e) => { e.target.src = 'https://res.cloudinary.com/dpznya3mz/image/upload/v1756651314/ogla/static/imageplaceholder.webp/imageplaceholder.png'; }}
                          />
                        </div>
                        <div className="ml-4">
                                                  <div className={`text-sm font-medium ${story.isActive !== 0 ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                          {story.title}
                          {story.isActive === 0 && (
                            <span className="ml-2 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                              DELETED
                            </span>
                          )}
                        </div>
                        <div className={`text-sm max-w-xs truncate ${story.isActive !== 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                          {story.excerpt}
                        </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{story.author || 'Admin'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {story.readTime ? `${story.readTime} min read` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(story.publishedAt || story.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.isActive !== 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {story.isActive !== 0 ? 'Active' : 'Deleted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        story.isFeatured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {story.isFeatured ? 'Featured' : 'Regular'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {story.isActive !== 0 ? (
                          <>
                            <button
                              onClick={() => openEditModal(story)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Story"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(story)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Story"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestore(story)}
                              disabled={submitting}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              title="Restore Story"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </button>
                            <span className="text-gray-400 text-xs">Deleted</span>
                          </>
                        )}
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
              {showEditModal ? 'Edit Story' : 'Add New Story'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Story Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter story title..."
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">Slug will be auto-generated from the title</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Story Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.imagePreview && (
                    <div className="mt-2">
                      <div className="relative inline-block">
                        <img
                          src={formData.imagePreview}
                          alt="Image preview"
                          className="h-32 w-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imagePreview: '', image: null, removeImage: true })}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                <input
                  type="text"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  placeholder="Brief description of the story..."
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Content *</label>
                
                {/* React Quill Rich Text Editor */}
                <div className="mt-1">
                  <ReactQuill
                    value={formData.content}
                    onChange={(content) => {
                      // Real-time sanitization as user types
                      const sanitized = sanitizeContent(content);
                      setFormData({...formData, content: sanitized});
                    }}
                    placeholder="Write your story content here..."
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'align': [] }],
                        ['link', 'blockquote'],
                        ['clean']
                      ],
                      clipboard: {
                        matchVisual: false,
                      }
                    }}
                    formats={[
                      'header',
                      'bold', 'italic', 'underline', 'strike',
                      'list', 'bullet',
                      'color', 'background',
                      'align',
                      'link', 'blockquote'
                    ]}
                    style={{ height: '300px' }}
                    className="border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Character count, word count, and preview toggle */}
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-500 flex space-x-4">
                    <span>
                      Characters: {formData.content.replace(/<[^>]*>/g, '').length}
                    </span>
                    <span>
                      Words: {formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <label className="flex items-center space-x-1 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={convertToPlainText}
                        onChange={(e) => setConvertToPlainText(e.target.checked)}
                        className="w-3 h-3 text-blue-600"
                      />
                      <span>Convert to Plain Text</span>
                    </label>
                    <button
                      type="button"
                      onClick={(event) => {
                        const cleaned = sanitizeContent(formData.content);
                        setFormData({...formData, content: cleaned});
                        // Show a brief success message
                        const button = event.target;
                        const originalText = button.textContent;
                        button.textContent = 'Cleaned!';
                        button.className = 'text-xs text-green-800 font-medium';
                        setTimeout(() => {
                          button.textContent = originalText;
                          button.className = 'text-xs text-green-600 hover:text-green-800 underline';
                        }, 1000);
                      }}
                      className="text-xs text-green-600 hover:text-green-800 underline"
                      title="Clean up HTML content"
                    >
                      Clean Content
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  </div>
                </div>
                
                {/* Content Preview */}
                {showPreview && (
                  <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Content Preview ({convertToPlainText ? 'Plain Text' : 'HTML'}):
                    </h4>
                    {convertToPlainText ? (
                      <div className="whitespace-pre-wrap text-sm text-gray-800">
                        {htmlToPlainText(formData.content)}
                      </div>
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    )}
                    
                    {/* Content Statistics */}
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <strong>HTML Tags:</strong> {(formData.content.match(/<[^>]*>/g) || []).length}
                        </div>
                        <div>
                          <strong>Data Attributes:</strong> {(formData.content.match(/data-[^=]+="[^"]*"/g) || []).length}
                        </div>
                        <div>
                          <strong>Empty Elements:</strong> {(formData.content.match(/<[^>]*>\s*<\/[^>]*>/g) || []).length}
                        </div>
                        <div>
                          <strong>Non-breaking Spaces:</strong> {(formData.content.match(/&nbsp;/g) || []).length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured Story</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
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
                  {submitting ? 'Saving...' : (showEditModal ? 'Update Story' : 'Add Story')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Story</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "<strong>{selectedStory?.title}</strong>"? This action cannot be undone.
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

export default Stories;
