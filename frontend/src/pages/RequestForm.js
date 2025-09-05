import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiFileText,
  FiCheck,
  FiAlertCircle,
} from "react-icons/fi";
import { useRequestBasket } from "../contexts/RequestBasketContext";
import { useAuth } from "../contexts/AuthContext";
import { generateProformaInvoice } from "../utils/invoiceGenerator";
import api from "../services/api";

const RequestForm = () => {
  const navigate = useNavigate();
  const {
    items: requestItems,
    totalAmount,
    clearRequestBasket: clearRequest,
  } = useRequestBasket();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    companyName: user?.companyName || "",
    companyType: user?.companyType || "",
    companyRole: user?.companyRole || "",
    companyAddress: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "Ghana",
    },
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState(null);

  // Redirect if no items in request basket
  useEffect(() => {
    if (!requestItems || requestItems.length === 0) {
      navigate("/request-basket");
    }
  }, [requestItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.companyType)
      newErrors.companyType = "Company type is required";
    if (!formData.companyRole)
      newErrors.companyRole = "Company role is required";

    // Company address validation (optional but if provided, validate)
    if (formData.companyAddress.street && !formData.companyAddress.city) {
      newErrors.companyAddressCity =
        "City is required if street address is provided";
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Check if user is authenticated
    if (!user || !user.email) {
      // Store the form data for later submission
      setPendingSubmission(formData);
      setShowAuthModal(true);
      return;
    }
    // User is authenticated, proceed with submission
    await submitRequest(formData);
  };

  const submitRequest = async (submissionData) => {
    setIsSubmitting(true);

    try {
      console.log("Starting request submission...");
      console.log("Submission data:", submissionData);
      console.log("Request items:", requestItems);
      console.log("Total amount:", totalAmount);

      // Submit request to backend API
      const requestPayload = {
        items: requestItems || [],
        totalAmount: totalAmount || 0,
        notes: submissionData.notes || "",
        customerData: submissionData,
      };

      console.log("Submitting to backend:", requestPayload);

      // Use longer timeout for request submission (PDF generation + email takes time)
      const response = await api.post("/requests", requestPayload, {
        timeout: 60000, // 60 seconds for request submission with PDF generation
      });
      const { requestNumber } = response.data.data;

      console.log(
        "Request submitted successfully, invoice number:",
        requestNumber
      );

      // No frontend PDF generation. Backend handles PDF and email for all users.
      // Just navigate to confirmation page after successful request.

      // Clear request basket
      clearRequest();

      // Navigate to confirmation page with appropriate state
      navigate("/request-confirmation", {
        state: {
          invoiceNumber: requestNumber,
          totalAmount: totalAmount || 0,
          isGuest: !user,
          customerEmail: submissionData.email,
        },
      });
    } catch (error) {
      console.error("Error submitting request:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        invoiceData: submissionData,
      });

      // Show more specific error message
      let errorMessage = "Failed to submit request. Please try again.";
      if (error.message.includes("Failed to fetch letterhead")) {
        errorMessage = "Unable to load invoice template. Please try again.";
      } else if (error.message.includes("PDF")) {
        errorMessage = "Unable to generate PDF. Please try again.";
      } else if (error.message.includes("email")) {
        errorMessage = "Request submitted but email notification failed.";
      } else if (error.message.includes("No items found")) {
        errorMessage =
          "No items found in request. Please add items to your request basket.";
      } else if (error.message.includes("missing required fields")) {
        errorMessage =
          "Some items are missing required information. Please check your request basket.";
      }

      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setShowAuthModal(false);
    if (pendingSubmission) {
      await submitRequest(pendingSubmission);
    }
  };

  const handleCreateAccount = () => {
    setShowAuthModal(false);
    // Navigate to register page with pre-filled data
    navigate("/register", {
      state: {
        prefillData: pendingSubmission,
      },
    });
  };

  const handleSignIn = () => {
    setShowAuthModal(false);
    // Navigate to login page
    navigate("/login", {
      state: {
        returnTo: "/request-form",
        prefillData: pendingSubmission,
      },
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(price);
  };

  if (!requestItems || requestItems.length === 0) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Submit Your Request
            </h1>
            <p className="text-xl text-gray-600">
              Complete your product request and receive a Proforma Invoice
            </p>
          </div>

          {/* Proforma Invoice Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <FiFileText className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Your Proforma Invoice is ready
                </h3>
                <p className="text-blue-800 mb-3">
                  Upon submission, a Proforma Invoice will be automatically
                  generated with:
                </p>
                <ul className="text-blue-700 space-y-1">
                  <li>• Your complete request details and pricing</li>
                  <li>• Email delivery to your registered address</li>
                  <li>• Ogla rep will get back to you shortly afterwards</li>
                  <li>
                    • You can also download the proforma invoice and print it
                    out
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Request Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information - Only show for guest users */}
                  {!user && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="h-5 w-5 mr-2 text-golden-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.firstName
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.lastName
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.lastName}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Info Display - Show for authenticated users */}
                  {user && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="h-5 w-5 mr-2 text-golden-600" />
                        Your Information
                      </h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-green-800">
                              Name:
                            </span>
                            <span className="ml-2 text-green-700">
                              {user.firstName} {user.lastName}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-green-800">
                              Email:
                            </span>
                            <span className="ml-2 text-green-700">
                              {user.email}
                            </span>
                          </div>
                          {user.phone && (
                            <div>
                              <span className="font-medium text-green-800">
                                Phone:
                              </span>
                              <span className="ml-2 text-green-700">
                                {user.phone}
                              </span>
                            </div>
                          )}
                          {user.companyName && (
                            <div>
                              <span className="font-medium text-green-800">
                                Company:
                              </span>
                              <span className="ml-2 text-green-700">
                                {user.companyName}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-green-600 text-xs mt-2">
                          ✓ Your information will be automatically used for this
                          request
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Contact Information - Only show for guest users */}
                  {!user && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FiMail className="h-5 w-5 mr-2 text-golden-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.email
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.email}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.phone
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Company Information - Only show for guest users */}
                  {!user && (
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <FiUser className="h-5 w-5 mr-2 text-golden-600" />
                        Company Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                          </label>
                          <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.companyName
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.companyName && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.companyName}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Type *
                          </label>
                          <select
                            name="companyType"
                            value={formData.companyType}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                              errors.companyType
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          >
                            <option value="">Select Type</option>
                            <option value="Agriculture & Farming">
                              Agriculture & Farming
                            </option>
                            <option value="Food & Beverage">
                              Food & Beverage
                            </option>
                            <option value="Cosmetics & Beauty">
                              Cosmetics & Beauty
                            </option>
                            <option value="Textiles & Fashion">
                              Textiles & Fashion
                            </option>
                            <option value="Healthcare & Pharmaceuticals">
                              Healthcare & Pharmaceuticals
                            </option>
                            <option value="Retail & Wholesale">
                              Retail & Wholesale
                            </option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Export/Import">Export/Import</option>
                            <option value="Other">Other</option>
                          </select>
                          {errors.companyType && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.companyType}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Role *
                        </label>
                        <select
                          name="companyRole"
                          value={formData.companyRole}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                            errors.companyRole
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Role</option>
                          <option value="Owner/CEO">Owner/CEO</option>
                          <option value="Manager/Director">
                            Manager/Director
                          </option>
                          <option value="Purchasing Manager">
                            Purchasing Manager
                          </option>
                          <option value="Procurement Officer">
                            Procurement Officer
                          </option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Marketing Manager">
                            Marketing Manager
                          </option>
                          <option value="Operations Manager">
                            Operations Manager
                          </option>
                          <option value="Business Development">
                            Business Development
                          </option>
                          <option value="Consultant">Consultant</option>
                          <option value="Employee">Employee</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.companyRole && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.companyRole}
                          </p>
                        )}
                      </div>

                      {/* Company Address */}
                      <div className="mt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <FiMapPin className="h-4 w-4 mr-2 text-golden-600" />
                          Company Address
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Street Address
                            </label>
                            <input
                              type="text"
                              name="companyAddress.street"
                              value={formData.companyAddress.street}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                              placeholder="Enter company street address"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              City
                            </label>
                            <input
                              type="text"
                              name="companyAddress.city"
                              value={formData.companyAddress.city}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500 ${
                                errors.companyAddressCity
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter city"
                            />
                            {errors.companyAddressCity && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors.companyAddressCity}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              State/Region
                            </label>
                            <input
                              type="text"
                              name="companyAddress.state"
                              value={formData.companyAddress.state}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                              placeholder="Enter state or region"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code
                            </label>
                            <input
                              type="text"
                              name="companyAddress.postalCode"
                              value={formData.companyAddress.postalCode}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                              placeholder="Enter postal code"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Country
                            </label>
                            <input
                              type="text"
                              name="companyAddress.country"
                              value={formData.companyAddress.country}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                              placeholder="Enter country"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <FiFileText className="h-5 w-5 mr-2 text-golden-600" />
                      Notes
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                      </label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-golden-500"
                        placeholder="Any additional notes, special requirements, or instructions for your request..."
                      />
                    </div>
                  </div>

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <FiAlertCircle className="h-5 w-5 text-red-600" />
                        <p className="text-red-800">{errors.submit}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => navigate("/request-basket")}
                      className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back to Basket
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Invoice...
                        </>
                      ) : (
                        <>
                          <FiCheck className="h-4 w-4 mr-2" />
                          Submit Request & Generate Invoice
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 sticky top-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Request Summary
                </h3>

                <div className="space-y-4 mb-6">
                  {requestItems &&
                    requestItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>Total Amount</span>
                    <span>{formatPrice(totalAmount || 0)}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    * Final pricing will be confirmed in your Proforma Invoice
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Proforma Invoice generated</li>
                    <li>• Email sent to your address</li>
                    <li>• Admin team reviews request</li>
                    <li>• You'll receive confirmation</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-golden-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="h-8 w-8 text-golden-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Create an Account
              </h3>
              <p className="text-gray-600">
                Get the most out of your experience with Ogla
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Benefits of having an account:
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Track all your requests and their status</li>
                  <li>• Faster future requests with pre-filled information</li>
                  <li>
                    • Access to exclusive deals and early product launches
                  </li>
                  <li>• Direct communication with our sales team</li>
                  <li>• Download invoices and manage your company profile</li>
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCreateAccount}
                className="w-full bg-golden-600 text-white py-3 px-4 rounded-lg hover:bg-golden-700 transition-colors font-semibold"
              >
                Create Account
              </button>

              <button
                onClick={handleSignIn}
                className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Sign In
              </button>

              <button
                onClick={handleContinueAsGuest}
                className="w-full text-gray-500 py-2 px-4 hover:text-gray-700 transition-colors text-sm"
              >
                Continue as Guest
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                You can always create an account later to access these features
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RequestForm;
