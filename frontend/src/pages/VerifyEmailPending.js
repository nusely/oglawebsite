import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FiMail, FiRefreshCw, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import AdvancedSEO from '../components/AdvancedSEO';

const VerifyEmailPending = () => {
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  
  // Get email from location state (passed from registration)
  const userEmail = location.state?.email || '';
  const fromRegistration = location.state?.fromRegistration || false;

  const handleResendVerification = async () => {
    if (!userEmail) {
      setResendError('Email not provided. Please register again.');
      return;
    }

    try {
      setResending(true);
      setResendError('');
      setResendMessage('');

      const response = await api.post('/auth/resend-verification', {
        email: userEmail
      });

      if (response.data.success) {
        setResendMessage('Verification email sent! Please check your inbox and spam folder.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      setResendError(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (!userEmail && !fromRegistration) {
    // If no email provided and not from registration, redirect to register
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <FiAlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Invalid Access
            </h2>
            <p className="mt-2 text-gray-600">
              Please register for an account first.
            </p>
            <Link
              to="/register"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Register Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdvancedSEO 
        title="Verify Your Email - Ogla Shea Butter"
        description="Please check your email to verify your account."
        type="website"
        noindex={true}
      />
      
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-8"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6"
              >
                <FiMail className="h-8 w-8 text-green-600" />
              </motion.div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              
              {fromRegistration ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600 mb-4">
                    <FiCheckCircle className="h-5 w-5" />
                    <span className="font-medium">Account Created Successfully!</span>
                  </div>
                  <p className="text-gray-600">
                    We've sent a verification email to:
                  </p>
                </div>
              ) : (
                <p className="text-gray-600">
                  Please verify your email address:
                </p>
              )}
              
              <p className="text-lg font-medium text-gray-900 mt-2 break-all">
                {userEmail}
              </p>
            </div>

            {/* Instructions */}
            <div className="mt-8 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  What to do next:
                </h3>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox for a verification message</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to log in to your account</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-2">
                  Can't find the email?
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>• Wait a few minutes for delivery</li>
                  <li>• Try resending the verification email</li>
                </ul>
              </div>
            </div>

            {/* Resend Section */}
            <div className="mt-8 space-y-4">
              {/* Success/Error Messages */}
              {resendMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
                >
                  {resendMessage}
                </motion.div>
              )}

              {resendError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                >
                  {resendError}
                </motion.div>
              )}

              {/* Resend Button */}
              <button
                onClick={handleResendVerification}
                disabled={resending}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw className={`w-4 h-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Verification Email'}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Already verified your email?
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-500 mt-1"
                >
                  Sign in to your account
                </Link>
              </div>

              {/* Back to Register */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Wrong email address?
                </p>
                <Link
                  to="/register"
                  className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-400 mt-1"
                >
                  Create a new account
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPending;
