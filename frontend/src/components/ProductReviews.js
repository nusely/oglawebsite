import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiUser, FiCalendar, FiThumbsUp } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const ProductReviews = ({ productId, onAddReview }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
    name: user ? '' : ''
  });

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching reviews for productId:', productId);
      const url = `/api/reviews/product/${productId}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No reviews found for this product');
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later');
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

  // Fetch reviews when component mounts or productId changes
  useEffect(() => {
    if (productId && productId > 0) {
      console.log('Valid productId, fetching reviews...');
      fetchReviews();
    } else {
      console.log('Invalid productId:', productId);
      setError('Invalid product ID');
      setLoading(false);
    }
  }, [productId]);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const ratingCounts = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const reviewData = {
        productId: parseInt(productId),
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        ...(user ? {} : { name: newReview.name })
      };

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { 'Authorization': `Bearer ${localStorage.getItem('ogla-token')}` })
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        let errorMessage = 'Failed to submit review';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          if (response.status === 400) {
            errorMessage = 'Invalid review data - please check your input';
          } else if (response.status === 401) {
            errorMessage = 'Please log in to submit a review';
          } else if (response.status >= 500) {
            errorMessage = 'Server error - please try again later';
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success) {
        // Reset form and close
        setNewReview({ rating: 5, title: '', comment: '', name: user ? '' : '' });
        setShowReviewForm(false);
        
        // Refresh the reviews list to show the new review
        fetchReviews();
        
        // Show success message
        alert('Review submitted successfully!');
      }
      
    } catch (err) {
      setError(err.message);
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ rating, size = 'md', interactive = false, onRatingChange }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : 'div'}
            onClick={interactive ? () => onRatingChange(star) : undefined}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
            }`}
          >
            <FiStar
              className={`w-full h-full ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Reviews Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Customer Reviews</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <span className="text-lg font-semibold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-gray-600">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => setShowReviewForm(true)}
          className="btn btn-primary"
        >
          Write a Review
        </button>
      </div>

      {/* Rating Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Rating Breakdown</h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingCounts[rating];
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Write Your Review</h4>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={newReview.rating}
                interactive={true}
                onRatingChange={(rating) => setNewReview({ ...newReview, rating })}
              />
            </div>
            
            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                  required
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-golden-500"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border-b border-gray-200 pb-6 last:border-b-0"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <FiUser className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{review.name}</h5>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <StarRating rating={review.rating} size="sm" />
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <FiCalendar className="w-3 h-3" />
                        <span>{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {review.title && (
                <h6 className="font-semibold text-gray-900 mb-2">{review.title}</h6>
              )}
              
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
              
              <div className="flex items-center space-x-4 mt-3">
                <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
                  <FiThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful || 0})</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
