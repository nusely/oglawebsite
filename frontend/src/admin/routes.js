import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Admin Layout
import AdminLayout from './layouts/AdminLayout';
import AdminProtectedRoute from './components/AdminProtectedRoute';

// Lazy load admin pages for better performance
const AdminDashboard = lazy(() => import('./pages/Dashboard'));
const AdminProducts = lazy(() => import('./pages/Products'));
const AdminStories = lazy(() => import('./pages/Stories'));
const AdminBrands = lazy(() => import('./pages/Brands'));
const AdminCategories = lazy(() => import('./pages/Categories'));
const AdminRequests = lazy(() => import('./pages/Requests'));
const AdminReviews = lazy(() => import('./pages/Reviews'));
const AdminUsers = lazy(() => import('./pages/Users'));
const AdminProfile = lazy(() => import('./pages/Profile'));
const AdminActivities = lazy(() => import('./pages/Activities'));
const AdminBrandFeaturedProducts = lazy(() => import('./pages/BrandFeaturedProducts'));

// Loading component for admin pages
const AdminPageLoading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Motion wrapper for admin pages
const AdminPageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const AdminRoutes = () => {
  return (
    <Routes>
        {/* Simple test route */}
        <Route 
          path="test" 
          element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">ADMIN TEST PAGE</h1>
                <p className="text-gray-700">If you can see this, admin routes are working!</p>
                <p className="text-sm text-gray-500 mt-2">Route: /admin/test</p>
              </div>
            </div>
          } 
        />
        
        {/* Admin layout route */}
        <Route path="" element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          
          <Route 
            path="dashboard" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminDashboard />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="products" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminProducts />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="stories" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminStories />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="brands" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminBrands />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="categories" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminCategories />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="requests" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminRequests />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="reviews" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminReviews />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="activities" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminActivities />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="brand-featured-products" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminBrandFeaturedProducts />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="users" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminUsers />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
          
          <Route 
            path="profile" 
            element={
              <Suspense fallback={<AdminPageLoading />}>
                <AdminPageWrapper>
                  <AdminProfile />
                </AdminPageWrapper>
              </Suspense>
            } 
          />
        </Route>
      </Routes>
  );
};

export default AdminRoutes;
