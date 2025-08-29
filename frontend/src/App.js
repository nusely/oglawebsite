import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';

// Context providers
import { AuthProvider } from './contexts/AuthContext';
import { RequestBasketProvider } from './contexts/RequestBasketContext';
import { ProductProvider } from './hooks/useProducts';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import RequestBasket from './components/RequestBasket';
import ErrorBoundary from './components/ErrorBoundary';
import Breadcrumbs from './components/Breadcrumbs';
import { PageLoadingSkeleton } from './components/LoadingSkeleton';
import PerformanceMonitor from './components/PerformanceMonitor';
import ScrollToTop from './components/ScrollToTop';

// Styles
import './styles/globals.css';

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RequestForm = lazy(() => import('./pages/RequestForm'));
const RequestConfirmation = lazy(() => import('./pages/RequestConfirmation'));
const MyRequests = lazy(() => import('./pages/MyRequests'));
const RequestBasketPage = lazy(() => import('./pages/RequestBasketPage'));
const BrandPage = lazy(() => import('./pages/BrandPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <HelmetProvider>
      <AuthProvider>
        <RequestBasketProvider>
          <ProductProvider>
            <PerformanceMonitor />
            <ScrollToTop />
            <div className="App w-full overflow-x-hidden">
            <Header />
            <RequestBasket />
            
            <main className="w-full">
              <ErrorBoundary>
                <Suspense fallback={<PageLoadingSkeleton />}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route 
                        path="/" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Home />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/products" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <Products />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/product/:slug" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <ProductDetail />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/about" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <About />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/contact" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <Contact />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/login" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Login />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/register" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Register />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/request-form" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <RequestForm />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/request-confirmation" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <RequestConfirmation />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/my-requests" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <MyRequests />
                          </motion.div>
                        } 
                      />
                      
                      <Route 
                        path="/request-basket" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <RequestBasketPage />
                          </motion.div>
                        } 
                      />
                      
                      {/* Brand Pages */}
                      <Route 
                        path="/brand/:brandSlug" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Breadcrumbs />
                            <BrandPage />
                          </motion.div>
                        } 
                      />
                      
                      {/* 404 Route */}
                      <Route 
                        path="*" 
                        element={
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <NotFound />
                          </motion.div>
                        } 
                      />
                    </Routes>
                  </AnimatePresence>
                </Suspense>
              </ErrorBoundary>
            </main>
            
            <Footer />
          </div>
            </ProductProvider>
        </RequestBasketProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
