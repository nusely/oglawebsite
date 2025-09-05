import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiDownload,
  FiEye,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import invoiceGenerator from "../utils/invoiceGenerator";

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate("/login", {
        state: {
          returnTo: "/my-requests",
          message: "Please sign in to view your requests",
        },
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Only load requests if authenticated
    if (!isAuthenticated) return;

    const loadRequests = async () => {
      try {
        setLoading(true);
        const response = await api.get("/requests/my-requests");
        if (response.data.success) {
          setRequests(response.data.data || []);
        } else {
          console.error("Failed to load requests:", response.data.message);
          setRequests([]);
        }
      } catch (error) {
        console.error("Error loading requests:", error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [isAuthenticated]);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiClock className="h-4 w-4" />;
      case "approved":
        return <FiCheckCircle className="h-4 w-4" />;
      case "rejected":
        return <FiXCircle className="h-4 w-4" />;
      case "processing":
        return <FiAlertCircle className="h-4 w-4" />;
      default:
        return <FiClock className="h-4 w-4" />;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleDownloadInvoice = async (invoiceNumber) => {
    try {
      // Find the request data for this invoice number
      const request = requests.find(r => r.requestNumber === invoiceNumber);
      if (!request) {
        alert("Request data not found. Please refresh the page and try again.");
        return;
      }

      // Get request data (already parsed by backend)
      const items = request.items || [];
      const customerData = request.customerData || null;

      // Prepare invoice data for frontend generator
      const invoiceData = {
        invoiceNumber: request.requestNumber,
        customer: customerData || {
          firstName: request.customerName?.split(' ')[0] || 'Unknown',
          lastName: request.customerName?.split(' ').slice(1).join(' ') || 'User',
          email: request.customerEmail || 'Not provided',
          phone: request.customerPhone || 'Not provided',
          companyName: request.companyName || 'Not provided',
          companyType: 'Not specified',
          companyRole: 'Not specified'
        },
        items: items.map(item => ({
          name: item.name || `Product ${item.productId}`,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: request.totalAmount,
        submittedAt: request.createdAt,
        status: request.status
      };

      // Use frontend invoice generator
      await invoiceGenerator.generateProformaInvoice(invoiceData, false);
      
    } catch (error) {
      console.error("Failed to download invoice PDF:", error);
      alert("Failed to download invoice PDF. Please try again.");
    }
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Requests
            </h1>
            <p className="text-lg text-gray-600">
              Track your product requests and invoices
            </p>
          </div>

          {/* Requests List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center">
                <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No requests yet
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't submitted any product requests yet.
                </p>
                <button
                  onClick={() => navigate("/request-basket")}
                  className="bg-golden-600 text-white px-6 py-3 rounded-lg hover:bg-golden-700 transition-colors"
                >
                  Submit Your First Request
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <motion.tr
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {request.requestNumber || `Request #${request.id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.customerName || "Customer"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {Array.isArray(request.items)
                              ? request.items.length
                              : 0}{" "}
                            items
                          </div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(request.items) &&
                            request.items.length > 0
                              ? request.items[0].name
                              : "No items"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatPrice(request.totalAmount || 0)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                              request.status || "pending"
                            )}`}
                          >
                            {getStatusIcon(request.status || "pending")}
                            <span className="ml-1.5 capitalize">
                              {request.status || "pending"}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt || new Date())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FiEye className="h-4 w-4 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadInvoice(request.requestNumber)
                              }
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <FiDownload className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Details Modal */}
      <AnimatePresence>
        {showDetails && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseDetails}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Request Details
                    </h2>
                    <p className="text-gray-600">
                      {selectedRequest.requestNumber ||
                        `Request #${selectedRequest.id}`}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiXCircle className="h-6 w-6" />
                  </button>
                </div>

                {/* Request Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Request Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            selectedRequest.status || "pending"
                          )}`}
                        >
                          {getStatusIcon(selectedRequest.status || "pending")}
                          <span className="ml-1.5 capitalize">
                            {selectedRequest.status || "pending"}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">
                          {formatDate(selectedRequest.createdAt || new Date())}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="text-gray-900 font-medium">
                          {formatPrice(selectedRequest.totalAmount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Customer Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="text-gray-900">
                          {selectedRequest.customerName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="text-gray-900">
                          {selectedRequest.customerEmail || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="text-gray-900">
                          {selectedRequest.customerPhone || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Company:</span>
                        <span className="text-gray-900">
                          {selectedRequest.companyName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Requested Items
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {Array.isArray(selectedRequest.items) &&
                    selectedRequest.items.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRequest.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                Quantity: {item.quantity} ×{" "}
                                {formatPrice(item.price)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No items found</p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {selectedRequest.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">
                      Notes
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedRequest.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  {selectedRequest.pdfMetadata?.generated && (
                    <button
                      onClick={() =>
                        handleDownloadInvoice(selectedRequest.requestNumber)
                      }
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Download Invoice
                    </button>
                  )}
                  <button
                    onClick={handleCloseDetails}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Close
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
