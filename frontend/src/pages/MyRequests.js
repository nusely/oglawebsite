import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiFileText, FiDownload, FiEye, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', { 
        state: { 
          returnTo: '/my-requests',
          message: 'Please sign in to view your requests'
        } 
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Only load requests if authenticated
    if (!isAuthenticated) return;
    
    // Load requests from localStorage (in real app, this would be from API)
    const loadRequests = () => {
      try {
        const storedRequests = JSON.parse(localStorage.getItem('ogla_requests') || '[]');
        // Filter requests for current user (in real app, this would be done by API)
        const userRequests = storedRequests.filter(request => 
          request.customer?.email === user?.email
        );
        setRequests(userRequests.reverse()); // Show newest first
      } catch (error) {
        console.error('Error loading requests:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [isAuthenticated, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="h-4 w-4" />;
      case 'approved':
        return <FiCheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <FiXCircle className="h-4 w-4" />;
      case 'processing':
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleDownloadInvoice = (invoiceNumber) => {
    // In a real implementation, this would download the PDF
    console.log('Downloading invoice:', invoiceNumber);
    alert(`Downloading Proforma Invoice ${invoiceNumber}`);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  // Show loading while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your requests...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">My Requests</h1>
            <p className="text-xl text-gray-600">
              Track the status of your product requests and download invoices
            </p>
          </div>

          {requests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any product requests yet.
              </p>
              <button
                onClick={() => window.location.href = '/products'}
                className="px-6 py-3 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
              >
                Browse Products
              </button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {requests.map((request, index) => (
                <motion.div
                  key={request.invoiceNumber}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-golden-100 rounded-lg flex items-center justify-center">
                        <FiFileText className="h-6 w-6 text-golden-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.invoiceNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Submitted on {formatDate(request.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPrice(request.totalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Items</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {request.items.length} product{request.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {request.customer.firstName} {request.customer.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Company:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {request.customer.companyName}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(request)}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        <FiEye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(request.invoiceNumber)}
                        className="flex items-center space-x-2 px-4 py-2 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
                      >
                        <FiDownload className="h-4 w-4" />
                        <span>Download Invoice</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showDetails && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Request Details - {selectedRequest.invoiceNumber}
                  </h2>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiXCircle className="h-6 w-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">
                          {selectedRequest.customer.firstName} {selectedRequest.customer.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Company</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Company Type</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.companyType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Role</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.companyRole}</p>
                      </div>
                    </div>
                  </div>

                  {/* Request Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">Invoice Number</p>
                        <p className="font-medium text-gray-900">{selectedRequest.invoiceNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                          {getStatusIcon(selectedRequest.status)}
                          <span className="ml-1 capitalize">{selectedRequest.status}</span>
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="font-medium text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-gray-900">{formatPrice(selectedRequest.totalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Terms</p>
                        <p className="font-medium text-gray-900">{selectedRequest.customer.paymentTerms}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Requested Items</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-4">
                      {selectedRequest.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded-lg">
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.shortDescription}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="font-medium text-gray-900">
                              {formatPrice(item.pricing.unitPrice * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                {(selectedRequest.customer.specialInstructions || selectedRequest.customer.deliveryPreferences) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      {selectedRequest.customer.specialInstructions && (
                        <div>
                          <p className="text-sm text-gray-600">Special Instructions</p>
                          <p className="font-medium text-gray-900">{selectedRequest.customer.specialInstructions}</p>
                        </div>
                      )}
                      {selectedRequest.customer.deliveryPreferences && (
                        <div>
                          <p className="text-sm text-gray-600">Delivery Preferences</p>
                          <p className="font-medium text-gray-900">{selectedRequest.customer.deliveryPreferences}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCloseDetails}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDownloadInvoice(selectedRequest.invoiceNumber)}
                    className="px-6 py-3 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
                  >
                    Download Invoice
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyRequests;
