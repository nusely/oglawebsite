import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';
import { initializeAnalytics } from './utils/analytics';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { RequestBasketProvider } from './contexts/RequestBasketContext';
import { ProductProvider } from './hooks/useProducts';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import RequestBasket from './components/RequestBasket';
import Breadcrumbs from './components/Breadcrumbs';
import ErrorBoundary from './components/ErrorBoundary';
import PerformanceMonitor from './components/PerformanceMonitor';
import ScrollToTop from './components/ScrollToTop';
import { PageLoadingSkeleton } from './components/LoadingSkeleton';
import ProtectedCustomerRoute from './components/ProtectedCustomerRoute';

// Styles
import './styles/globals.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const FeaturedProductDetail = lazy(() => import('./pages/FeaturedProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Stories = lazy(() => import('./pages/Stories'));
const StoryDetail = lazy(() => import('./pages/StoryDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const VerifyEmailPending = lazy(() => import('./pages/VerifyEmailPending'));
const RequestForm = lazy(() => import('./pages/RequestForm'));
const RequestConfirmation = lazy(() => import('./pages/RequestConfirmation'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const Profile = lazy(() => import('./pages/Profile'));
const RequestBasketPage = lazy(() => import('./pages/RequestBasketPage'));
const BrandPage = lazy(() => import('./pages/BrandPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin routes
const AdminRoutes = lazy(() => import('./admin/routes'));

// Motion wrapper for pages
const PageWrapper = ({ children }) => (
  <div
    style={{
      opacity: 1,
      transform: 'translateY(0px)',
      transition: 'opacity 0.3s ease, transform 0.3s ease'
    }}
  >
    {children}
  </div>
);

function App() {
  // Restore scroll position on navigation
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Initialize Google Analytics
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <RequestBasketProvider>
          <ProductProvider>
            <PerformanceMonitor />
            <ScrollToTop />
            <div className="App w-full overflow-x-hidden">
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Admin Routes - Outside main layout */}
                      <Route 
                        path="/admin/*" 
                        element={
                          <Suspense fallback={<PageLoadingSkeleton />}>
                            <AdminRoutes />
                          </Suspense>
                        } 
                      />
                      
                      {/* Main Layout Routes */}
                      <Route path="/*" element={
                        <>
                          <Header />
                          <RequestBasket />
                          <main className="w-full">
                            <Routes>
                              <Route 
                                path="/" 
                                element={
                                  <PageWrapper>
                                    <Home />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/products" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <Products />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/product/:slug" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <ProductDetail />
                                  </PageWrapper>
                                } 
                              />
                              
                              {/* Featured Product Detail Route */}
                              <Route 
                                path="/featured-product/:id" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <FeaturedProductDetail />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/about" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <About />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/contact" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <Contact />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/stories" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <Stories />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/story/:slug" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <StoryDetail />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/login" 
                                element={
                                  <PageWrapper>
                                    <Login />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/register" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <Register />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/forgot-password" 
                                element={
                                  <PageWrapper>
                                    <ForgotPassword />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/reset-password" 
                                element={
                                  <PageWrapper>
                                    <ResetPassword />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/verify-email" 
                                element={
                                  <PageWrapper>
                                    <VerifyEmail />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/verify-email-pending" 
                                element={
                                  <PageWrapper>
                                    <VerifyEmailPending />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/request-form" 
                                element={
                                  <ProtectedCustomerRoute>
                                    <PageWrapper>
                                      <Breadcrumbs />
                                      <RequestForm />
                                    </PageWrapper>
                                  </ProtectedCustomerRoute>
                                } 
                              />
                              
                              <Route 
                                path="/request-confirmation" 
                                element={
                                  <PageWrapper>
                                    <RequestConfirmation />
                                  </PageWrapper>
                                } 
                              />
                              
                              <Route 
                                path="/my-requests" 
                                element={
                                  <ProtectedCustomerRoute>
                                    <PageWrapper>
                                      <Breadcrumbs />
                                      <MyRequests />
                                    </PageWrapper>
                                  </ProtectedCustomerRoute>
                                } 
                              />
                              
                              <Route 
                                path="/profile" 
                                element={
                                  <ProtectedCustomerRoute>
                                    <PageWrapper>
                                      <Breadcrumbs />
                                      <Profile />
                                    </PageWrapper>
                                  </ProtectedCustomerRoute>
                                } 
                              />
                              
                              <Route 
                                path="/request-basket" 
                                element={
                                  <ProtectedCustomerRoute>
                                    <PageWrapper>
                                      <Breadcrumbs />
                                      <RequestBasketPage />
                                    </PageWrapper>
                                  </ProtectedCustomerRoute>
                                } 
                              />
                              
                              {/* Brand Pages */}
                              <Route 
                                path="/brand/:brandSlug" 
                                element={
                                  <PageWrapper>
                                    <Breadcrumbs />
                                    <BrandPage />
                                  </PageWrapper>
                                } 
                              />
                              
                              {/* 404 Route */}
                              <Route 
                                path="*" 
                                element={
                                  <PageWrapper>
                                    <NotFound />
                                  </PageWrapper>
                                } 
                              />
                            </Routes>
                          </main>
                          <Footer />
                        </>
                      } />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </ErrorBoundary>
            </div>
          </ProductProvider>
        </RequestBasketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
