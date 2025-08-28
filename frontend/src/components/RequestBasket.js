import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useRequestBasket } from '../contexts/RequestBasketContext';

const RequestBasket = () => {
  const {
    items,
    totalItems,
    totalAmount,
    isOpen,
    toggleRequestBasket,
    removeFromRequest,
    updateQuantity,
    clearRequestBasket
  } = useRequestBasket();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleRequestBasket}
          />

          {/* Request Basket Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Request Basket Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <FiShoppingBag className="text-xl sm:text-2xl text-golden-500" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Request Basket</h2>
                {totalItems > 0 && (
                  <span className="bg-golden-500 text-white text-xs px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={toggleRequestBasket}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="text-lg sm:text-xl text-gray-600" />
              </button>
            </div>

            {/* Request Basket Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
                  <FiShoppingBag className="text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                    Your request basket is empty
                  </h3>
                  <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                    Add some products to get started
                  </p>
                  <button
                    onClick={toggleRequestBasket}
                    className="btn btn-primary text-sm sm:text-base px-4 sm:px-6 py-2 sm:py-3"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-md"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs text-gray-500">{item.brandName}</p>
                        <p className="text-xs sm:text-sm font-semibold text-golden-600">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus className="w-3 h-3 text-gray-600" />
                        </button>
                        <span className="text-xs sm:text-sm font-medium text-gray-900 min-w-[1.5rem] sm:min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <FiPlus className="w-3 h-3 text-gray-600" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="p-1 sm:p-2 hover:bg-red-100 rounded-full transition-colors text-red-500"
                      >
                        <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Basket Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Request Summary */}
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-golden-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to="/request-basket"
                    onClick={toggleRequestBasket}
                    className="w-full btn btn-primary py-2 sm:py-3 text-center text-sm sm:text-base"
                  >
                    View Request Basket ({totalItems} items)
                  </Link>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleClearBasket}
                      className="flex-1 btn btn-outline py-2 text-xs sm:text-sm"
                    >
                      Clear Basket
                    </button>
                    <button
                      onClick={toggleRequestBasket}
                      className="flex-1 btn btn-secondary py-2 text-xs sm:text-sm"
                    >
                      Continue Browsing
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RequestBasket;
