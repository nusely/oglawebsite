import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  // Debug logging
  console.log('AdminProtectedRoute - user:', user);
  console.log('AdminProtectedRoute - isLoading:', isLoading);
  console.log('AdminProtectedRoute - user role:', user?.role);

  // Show loading while checking auth
  if (isLoading) {
    console.log('AdminProtectedRoute - Showing loading...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('AdminProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to home if not admin, staff, or super_admin
  if (!['admin', 'staff', 'super_admin'].includes(user.role)) {
    console.log('AdminProtectedRoute - User is not admin/staff/super_admin, redirecting to home');
    return <Navigate to="/" replace />;
  }

  console.log('AdminProtectedRoute - User is admin, rendering children');
  return children;
};

export default AdminProtectedRoute;
