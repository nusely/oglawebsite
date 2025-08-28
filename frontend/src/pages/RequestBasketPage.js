import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useRequestBasket } from '../contexts/RequestBasketContext';

const RequestBasketPage = () => {
  const navigate = useNavigate();
  const {
    items,
    totalItems,
    totalAmount,
    removeFromRequest,
    updateQuantity,
    clearRequestBasket
  } = useRequestBasket();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromRequest(itemId);
  };

  const handleClearBasket = () => {
    if (window.confirm('Are you sure you want to clear your request basket?')) {
      clearRequestBasket();
    }
  };

  const handleSubmitRequest = () => {
    navigate('/request-form');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg p-12"
            >
              <FiShoppingBag className="text-6xl text-gray-300 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Your request basket is empty</h1>
              <p className="text-gray-600 mb-8">
                Looks like you haven't added any products to your request basket yet.
              </p>
              <div className="space-y-4">
                <Link
                  to="/products"
                  className="btn btn-primary inline-block"
                >
                  Browse Products
                </Link>
                <div>
                  <Link
                    to="/"
                    className="text-golden-600 hover:text-golden-700 font-medium"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            to="/products"
            className="inline-flex items-center text-golden-600 hover:text-golden-700 font-medium mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <FiArrowLeft className="mr-2" />
            Continue Browsing
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Request Basket</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your request basket
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Request Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              {/* Request Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Request Items</h2>
                  <button
                    onClick={handleClearBasket}
                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm font-medium"
                  >
                    Clear Basket
                  </button>
                </div>
              </div>

              {/* Request Items List */}
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500">{item.brandName}</p>
                      <p className="text-base sm:text-lg font-semibold text-golden-600 mt-1 sm:mt-2">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="p-1 sm:p-2 hover:bg-gray-100 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                        <span className="px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-lg font-medium text-gray-900 min-w-[2rem] sm:min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="p-1 sm:p-2 hover:bg-gray-100 transition-colors"
                        >
                          <FiPlus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right sm:text-right">
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item._id)}
                      className="p-2 hover:bg-red-100 rounded-full transition-colors text-red-500 self-end sm:self-auto"
                    >
                      <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Request Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-6 sticky top-8"
            >
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Request Summary</h2>
              
              {/* Summary Details */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between text-gray-600 text-sm sm:text-base">
                  <span>Total ({totalItems} items)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Submit Request Button */}
              <button
                onClick={handleSubmitRequest}
                className="w-full btn btn-primary py-2 sm:py-3 text-base sm:text-lg font-semibold"
              >
                Continue to Request Form
              </button>

              {/* Additional Info */}
              <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
                <p>• Secure request submission</p>
                <p>• Admin will contact you within 24 hours</p>
                <p>• Request confirmation will be sent via email</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestBasketPage;
