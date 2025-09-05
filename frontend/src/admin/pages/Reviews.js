import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiEye, FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiFilter, FiSearch } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const Reviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    search: ''
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Check if user is authenticated and is admin
    if (!user) {
      setError('Please log in to access this page');
      setLoading(false);
      return;
    }
    
    if (user.role !== 'admin') {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('ogla-token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      console.log('Fetching admin reviews with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('/api/reviews/admin/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Failed to fetch reviews (${response.status})`);
        }
      }

      const data = await response.json();
      console.log('Reviews data received:', data);
      setReviews(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (reviewId, currentStatus) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ogla-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle review status');
      }

      const result = await response.json();
      
      // Update the review in the list
      setReviews(prevReviews => 
        prevReviews.map(review => 
          review.id === reviewId 
            ? { ...review, isActive: result.isActive }
            : review
        )
      );

      // Show success message
      alert(result.message);
    } catch (err) {
      alert('Error toggling review status: ' + err.message);
      console.error('Error toggling review status:', err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('ogla-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      // Remove the review from the list
      setReviews(prevReviews => prevReviews.filter(review => review.id !== reviewId));
      alert('Review deleted successfully');
    } catch (err) {
      alert('Error deleting review: ' + err.message);
      console.error('Error deleting review:', err);
    }
  };

  const openReviewModal = (review) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReview(null);
  };

  const StarRating = ({ rating, size = 'md' }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star) => (
          <FiStar
            key={star}
            className={`${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            } ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    // Status filter
    if (filters.status !== 'all' && 
        ((filters.status === 'active' && !review.isActive) || 
         (filters.status === 'inactive' && review.isActive))) {
      return false;
    }

    // Rating filter
    if (filters.rating !== 'all' && review.rating !== parseInt(filters.rating)) {
      return false;
    }

    // Search filter
    if (filters.search && !review.comment.toLowerCase().includes(filters.search.toLowerCase()) &&
        !review.title?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !review.productName?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Pagination logic
  const totalItems = filteredReviews.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const getStatusBadge = (isActive) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  // Show error if not authenticated
  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Show error if not admin
  if (user.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
          <p className="text-gray-600">Manage and moderate customer reviews</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {reviews.length} reviews
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ status: 'all', rating: 'all', search: '' })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No reviews found matching your filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentReviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Review Header */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} size="sm" />
                        <span className="text-sm text-gray-600">({review.rating}/5)</span>
                      </div>
                      {getStatusBadge(review.isActive)}
                    </div>

                    {/* Product Info */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-900">
                        {review.productName || 'Unknown Product'}
                      </h3>
                      {review.title && (
                        <p className="text-gray-700 font-medium">{review.title}</p>
                      )}
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-700 mb-3 line-clamp-2">{review.comment}</p>

                    {/* Review Meta */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        By: {review.firstName && review.lastName 
                          ? `${review.firstName} ${review.lastName}` 
                          : review.email || 'Anonymous'}
                      </span>
                      <span>•</span>
                      <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.updatedAt !== review.createdAt && (
                        <>
                          <span>•</span>
                          <span>Updated: {new Date(review.updatedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openReviewModal(review)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200"
                      title="View Details"
                    >
                      <FiEye className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(review.id, review.isActive)}
                      className={`p-2 rounded-md transition-colors duration-200 ${
                        review.isActive 
                          ? 'text-green-400 hover:text-green-600 hover:bg-green-50' 
                          : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                      }`}
                      title={review.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {review.isActive ? <FiToggleRight className="w-4 h-4" /> : <FiToggleLeft className="w-4 h-4" />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                      title="Delete Review"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-700">Show:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-700">per page</span>
                </div>
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> results
                </div>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show current page, first page, last page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 3 ||
                      page === currentPage + 3
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Review Details</h2>
                <button
                  onClick={closeReviewModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Product</h3>
                  <p className="text-gray-700">{selectedReview.productName || 'Unknown Product'}</p>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Rating</h3>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={selectedReview.rating} size="lg" />
                    <span className="text-lg font-medium text-gray-900">({selectedReview.rating}/5)</span>
                  </div>
                </div>

                {/* Title */}
                {selectedReview.title && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Title</h3>
                    <p className="text-gray-700">{selectedReview.title}</p>
                  </div>
                )}

                {/* Comment */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Review</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedReview.comment}</p>
                </div>

                {/* Reviewer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Reviewer Information</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span> {selectedReview.firstName && selectedReview.lastName 
                        ? `${selectedReview.firstName} ${selectedReview.lastName}` 
                        : selectedReview.email || 'Anonymous'}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedReview.email || 'Not provided'}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> {getStatusBadge(selectedReview.isActive)}
                    </p>
                    <p>
                      <span className="font-medium">Created:</span> {new Date(selectedReview.createdAt).toLocaleString()}
                    </p>
                    {selectedReview.updatedAt !== selectedReview.createdAt && (
                      <p>
                        <span className="font-medium">Last Updated:</span> {new Date(selectedReview.updatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleToggleStatus(selectedReview.id, selectedReview.isActive)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                    selectedReview.isActive 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {selectedReview.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => {
                    handleDeleteReview(selectedReview.id);
                    closeReviewModal();
                  }}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md font-medium hover:bg-red-200 transition-colors duration-200"
                >
                  Delete Review
                </button>
                <button
                  onClick={closeReviewModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
