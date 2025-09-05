import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiDownload,
  FiMail,
  FiFileText,
  FiArrowRight,
  FiHome,
  FiLogIn,
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import invoiceGenerator from "../utils/invoiceGenerator";

const RequestConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { invoiceNumber, totalAmount, isGuest, customerEmail } =
    location.state || {};

  // Redirect if no invoice data
  if (!invoiceNumber) {
    navigate("/");
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  const handleDownloadInvoice = async () => {
    if (isAuthenticated) {
      // Authenticated user - get request data and use frontend generator
      try {
        const response = await api.get(`/requests/${invoiceNumber}/data`);
        const requestData = response.data.data;

        // Prepare invoice data for frontend generator
        const invoiceData = {
          invoiceNumber: requestData.requestNumber,
          customer: requestData.customerData || {
            firstName: requestData.customerName?.split(' ')[0] || 'Unknown',
            lastName: requestData.customerName?.split(' ').slice(1).join(' ') || 'User',
            email: requestData.customerEmail || 'Not provided',
            phone: 'Not provided',
            companyName: 'Not provided',
            companyType: 'Not specified',
            companyRole: 'Not specified'
          },
          items: (requestData.items || []).map(item => ({
            name: item.name || `Product ${item.productId}`,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount: requestData.totalAmount,
          submittedAt: requestData.createdAt,
          status: requestData.status
        };

        // Use frontend invoice generator
        await invoiceGenerator.generateProformaInvoice(invoiceData, false);
        
      } catch (error) {
        console.error("Failed to download invoice PDF:", error);
        alert("Failed to download invoice PDF. Please try again.");
      }
    } else {
      // Guest user - require email verification
      const email = prompt(
        "To download your invoice, please enter the email address you used when placing the request:"
      );

      if (email) {
        try {
          const response = await api.post(
            `/requests/${invoiceNumber}/public-pdf`,
            { email },
            { responseType: "blob" }
          );
          const blob = new Blob([response.data], { type: "application/pdf" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `Proforma_Invoice_${invoiceNumber}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error("Failed to download invoice PDF:", error);
          if (error.response?.status === 403) {
            alert("The email address does not match our records. Please check and try again.");
          } else {
            alert("Failed to download invoice PDF. Please try again or check your email for the PDF.");
          }
        }
      }
    }
  };

  const handleViewRequests = () => {
    if (isAuthenticated) {
      navigate("/my-requests");
    } else {
      // Redirect to login with return path
      navigate("/login", {
        state: {
          returnTo: "/my-requests",
          message: "Please sign in to view your requests",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiCheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Request Submitted Successfully!
            </h1>
            <p className="text-xl text-gray-600">
              Proforma Invoice sent to your email.
            </p>
          </motion.div>

          {/* Invoice Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="text-center mb-6">
              <FiFileText className="h-12 w-12 text-golden-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Proforma Invoice Generated
              </h2>
              <p className="text-gray-600">
                Invoice Number:{" "}
                <span className="font-semibold text-golden-600">
                  {invoiceNumber}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Total Amount
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPrice(totalAmount)}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Status
                </h3>
                <p className="text-lg font-semibold text-blue-600">
                  Pending Review
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">
                      1
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Email Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      Check your email for the Proforma Invoice PDF
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">
                      2
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Admin Review
                    </p>
                    <p className="text-sm text-gray-600">
                      Our team will review your request within 24-48 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">
                      3
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Final Confirmation
                    </p>
                    <p className="text-sm text-gray-600">
                      You'll receive a final confirmation and payment details
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guest User Notice */}
          {isGuest && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
            >
              <div className="flex items-start space-x-3">
                <FiMail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Guest User - Invoice Sent to Email
                  </h3>
                  <p className="text-blue-800 mb-3">
                    Since you submitted this request as a guest, your Proforma
                    Invoice has been sent to <strong>{customerEmail}</strong>.
                  </p>
                  <p className="text-blue-700">
                    To download invoices instantly and track your requests in
                    the future, consider creating an account.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="flex flex-col">
              <button
                onClick={handleDownloadInvoice}
                className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  isAuthenticated
                    ? "bg-golden-600 text-white hover:bg-golden-700"
                    : "bg-gray-400 text-white hover:bg-gray-500 cursor-not-allowed"
                }`}
              >
                <FiDownload className="h-5 w-5" />
                <span>
                  {isAuthenticated ? "Download Invoice" : "Sign In to Download"}
                </span>
              </button>
              {!isAuthenticated && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {isGuest
                    ? `Invoice sent to ${customerEmail}`
                    : "Check your email for the PDF"}
                </p>
              )}
            </div>

            <button
              onClick={handleViewRequests}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isAuthenticated ? (
                <>
                  <FiFileText className="h-5 w-5" />
                  <span>View My Requests</span>
                </>
              ) : (
                <>
                  <FiLogIn className="h-5 w-5" />
                  <span>Sign In to View Requests</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiHome className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </motion.div>

          {/* Additional Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <FiMail className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Need Help?
                </h3>
                <p className="text-blue-800 mb-3">
                  If you haven't received your Proforma Invoice or have any
                  questions:
                </p>
                <div className="space-y-2 text-blue-700">
                  <p>• Check your spam/junk folder</p>
                  <p>
                    • Contact us at{" "}
                    <span className="font-semibold">oglatrade@gmail.com</span>
                  </p>
                  <p>
                    • Call us at{" "}
                    <span className="font-semibold">+233 54 152 8841</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Request Tracking Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <FiArrowRight className="h-5 w-5 mr-2 text-golden-600" />
              Track Your Request
            </h3>
            <p className="text-gray-600 mb-4">
              You can track the status of your request and view all your
              previous requests in your account dashboard.
            </p>
            <button
              onClick={handleViewRequests}
              className="inline-flex items-center space-x-2 text-golden-600 hover:text-golden-700 font-medium"
            >
              <span>
                {isAuthenticated
                  ? "Go to My Requests"
                  : "Sign In to View Requests"}
              </span>
              <FiArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RequestConfirmation;
