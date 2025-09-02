import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, EyeIcon, CheckIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { generateProformaInvoice } from '../../utils/invoiceGenerator';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all');
  const [guestFilter, setGuestFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/requests/admin/all');
      setRequests(response.data.data?.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
      // Show user-friendly error message instead of falling back to mock data
      alert('Failed to load requests. Please ensure the backend is running and try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    // Search filter
    const searchMatch = 
      (request.id?.toString() || '').includes(searchTerm) ||
      (request.requestNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.status || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!searchMatch) return false;
    
    // Status filter
    if (statusFilter !== 'all' && request.status !== statusFilter) return false;
    
    // Guest filter
    if (guestFilter !== 'all') {
      const isGuest = request.isGuest || (request.userId && typeof request.userId === 'string' && request.userId.startsWith('guest_'));
      if (guestFilter === 'guest' && !isGuest) return false;
      if (guestFilter === 'registered' && isGuest) return false;
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const requestDate = new Date(request.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      switch (dateFilter) {
        case 'today':
          if (requestDate.toDateString() !== today.toDateString()) return false;
          break;
        case 'yesterday':
          if (requestDate.toDateString() !== yesterday.toDateString()) return false;
          break;
        case 'lastWeek':
          if (requestDate < lastWeek) return false;
          break;
        case 'lastMonth':
          if (requestDate < lastMonth) return false;
          break;
        case 'custom':
          if (startDate && requestDate < new Date(startDate)) return false;
          if (endDate && requestDate > new Date(endDate + 'T23:59:59')) return false;
          break;
      }
    }
    
    return true;
  });

  const handleStatusUpdate = async (requestId, newStatus) => {
    setSubmitting(true);
    try {
      await api.put(`/requests/${requestId}/status`, { status: newStatus });
      
      // Send email notification
      try {
        await api.post(`/requests/${requestId}/notify`, { 
          status: newStatus,
          action: newStatus === 'approved' ? 'approval' : 'rejection'
        });
      } catch (emailError) {
        console.error('Email notification failed:', emailError);
        // Don't fail the whole operation if email fails
      }
      
      fetchRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      alert('Error updating request status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async (request) => {
    const requestNumber = request.requestNumber || request.id;
    if (!requestNumber) {
      alert('Cannot download PDF: Request number not found');
      return;
    }
    
    setDownloadingPdf(requestNumber);
    try {
      // Get admin-stamped invoice data from backend
      const response = await api.post(`/requests/${requestNumber}/admin-pdf`);
      const adminInvoiceData = response.data.data;
      
      // Generate and download PDF with admin stamp
      await generateProformaInvoice(adminInvoiceData, true);
      
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setDownloadingPdf(null);
    }
  };

  const openViewModal = (request) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
                 <div>
           <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
           <p className="text-gray-600">Manage customer proforma invoices and quotes</p>
         </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search invoices, customers, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          {/* Guest Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select
              value={guestFilter}
              onChange={(e) => setGuestFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              <option value="guest">Guest Users</option>
              <option value="registered">Registered Users</option>
            </select>
          </div>
          
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="lastWeek">Last 7 Days</option>
              <option value="lastMonth">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {/* Custom Date Range */}
          {dateFilter === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
        
        {/* Clear Filters Button */}
        {(statusFilter !== 'all' || guestFilter !== 'all' || dateFilter !== 'all' || searchTerm) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setStatusFilter('all');
                setGuestFilter('all');
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
                setSearchTerm('');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
                 {loading ? (
           <div className="p-8 text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
             <p className="mt-4 text-gray-600">Loading invoices...</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                                         <td className="px-6 py-4 whitespace-nowrap">
                       <button
                         onClick={() => openViewModal(request)}
                         className="text-left hover:text-blue-600 transition-colors"
                       >
                                                 <div className="text-sm font-medium text-gray-900">{request.requestNumber || request.id}</div>
                        <div className="text-sm text-gray-500">
                          {request.items?.length || 0} item{(request.items?.length || 0) !== 1 ? 's' : ''}
                        </div>
                       </button>
                     </td>
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="text-sm font-medium text-gray-900">
                         {request.customerName}
                         {(request.isGuest || (request.userId && typeof request.userId === 'string' && request.userId.startsWith('guest_'))) && (
                           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                             Guest
                           </span>
                         )}
                       </div>
                       <div className="text-sm text-gray-500">{request.customerEmail}</div>
                     </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {(request.items || []).map((item, index) => (
                          <div key={index} className="mb-1">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(request.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openViewModal(request)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Request"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(request)}
                          disabled={downloadingPdf === (request.requestNumber || request.id)}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                          title="Download PDF Invoice"
                        >
                          {downloadingPdf === (request.requestNumber || request.id) ? (
                            <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                          ) : (
                            <ArrowDownTrayIcon className="w-4 h-4" />
                          )}
                        </button>
                        {request.status === 'pending' && (
                          <>
                                                         <button
                               onClick={() => handleStatusUpdate(request.id, 'approved')}
                               disabled={submitting}
                               className="text-green-600 hover:text-green-900 disabled:opacity-50"
                               title="Approve Invoice"
                             >
                               <CheckIcon className="w-4 h-4" />
                             </button>
                             <button
                               onClick={() => handleStatusUpdate(request.id, 'rejected')}
                               disabled={submitting}
                               className="text-red-600 hover:text-red-900 disabled:opacity-50"
                               title="Reject Invoice"
                             >
                               <XMarkIcon className="w-4 h-4" />
                             </button>
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

      {/* View Request Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                         <h2 className="text-xl font-bold mb-4">Proforma Invoice Details</h2>
            <div className="space-y-6">
                             {/* Request Header */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                   <p className="mt-1 text-sm text-gray-900 font-medium">{selectedRequest.requestNumber || selectedRequest.id}</p>
                 </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedRequest.customerEmail}</p>
                  </div>
                </div>
              </div>

                             {/* Items */}
               <div>
                 <h3 className="text-lg font-medium text-gray-900 mb-3">Invoice Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Product</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Quantity</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Unit Price</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedRequest.items || []).map((item, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="py-2 text-sm text-gray-900 font-medium">
                            {formatCurrency(item.quantity * item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-300">
                        <td colSpan="3" className="py-2 text-sm font-medium text-gray-900 text-right">Total:</td>
                        <td className="py-2 text-sm font-bold text-gray-900">
                          {formatCurrency(selectedRequest.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

                             {/* Notes */}
               {selectedRequest.notes && (
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Customer Notes</label>
                   <div className="bg-gray-50 rounded-lg p-4">
                     <p className="text-sm text-gray-900">{selectedRequest.notes}</p>
                   </div>
                 </div>
               )}

               {/* Email Notification Status */}
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                 <div className="flex items-center">
                   <div className="flex-shrink-0">
                     <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                     </svg>
                   </div>
                   <div className="ml-3">
                     <p className="text-sm text-blue-700">
                       <strong>Email Notification:</strong> When you approve or reject this invoice, an email will be automatically sent to the customer.
                     </p>
                   </div>
                 </div>
               </div>

              {/* Status Actions */}
              {selectedRequest.status === 'pending' && (
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                     <button
                     onClick={() => {
                       handleStatusUpdate(selectedRequest.id, 'approved');
                       setShowViewModal(false);
                     }}
                     disabled={submitting}
                     className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                   >
                     <CheckIcon className="w-4 h-4" />
                     <span>Approve Invoice</span>
                   </button>
                   <button
                     onClick={() => {
                       handleStatusUpdate(selectedRequest.id, 'rejected');
                       setShowViewModal(false);
                     }}
                     disabled={submitting}
                     className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                   >
                     <XMarkIcon className="w-4 h-4" />
                     <span>Reject Invoice</span>
                   </button>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-4">
              <button
                onClick={() => handleDownloadPdf(selectedRequest)}
                disabled={downloadingPdf === selectedRequest.requestNumber}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {downloadingPdf === selectedRequest.requestNumber ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
