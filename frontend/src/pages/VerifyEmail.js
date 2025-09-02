import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid verification link. Please request a new verification email.');
      setLoading(false);
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      setVerified(true);
      
      // Redirect to login after 5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    // This would need the user's email, so we'll redirect to login
    navigate('/login?message=Please login to resend verification email');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Verifying Email</h2>
              <p className="mt-2 text-sm text-gray-600">Please wait while we verify your email address...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Invalid Verification Link</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-golden-600 hover:bg-golden-700"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verified) {
    return (
      <>
        <Helmet>
          <title>Email Verified - Ogla Shea Butter</title>
          <meta name="description" content="Your email has been successfully verified" />
        </Helmet>

        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="sm:mx-auto sm:w-full sm:max-w-md"
          >
            <div className="text-center">
              <Link to="/" className="inline-flex items-center text-2xl font-bold text-gray-900 mb-8">
                <img
                  className="h-12 w-auto mr-3"
                  src="/images/logo.png"
                  alt="Ogla Shea Butter"
                />
                Ogla Shea Butter
              </Link>
            </div>

            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Your email address has been successfully verified. You can now access all features of your account.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                  Redirecting to login page in 5 seconds...
                </p>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-golden-600 hover:bg-golden-700"
                  >
                    Go to Login Now
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Email Verification Failed - Ogla Shea Butter</title>
        <meta name="description" content="Email verification failed" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        >
          <div className="text-center">
            <Link to="/" className="inline-flex items-center text-2xl font-bold text-gray-900 mb-8">
              <img
                className="h-12 w-auto mr-3"
                src="/images/logo.png"
                alt="Ogla Shea Butter"
              />
              Ogla Shea Butter
            </Link>
          </div>

          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <XCircleIcon className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-golden-600 hover:bg-golden-700"
                >
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  Resend Verification Email
                </button>
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default VerifyEmail;
