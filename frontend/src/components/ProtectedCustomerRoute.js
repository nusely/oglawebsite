import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedCustomerRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600"></div>
      </div>
    );
  }

  // If user is admin or super_admin, redirect to admin dashboard
  if (user && (user.role === 'admin' || user.role === 'super_admin')) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Allow access to customer routes for regular users or guests
  return children;
};

export default ProtectedCustomerRoute;

