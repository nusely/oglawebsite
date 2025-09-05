// Google Analytics utility functions
// This file provides helper functions for tracking custom events

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-929VF82NHQ', {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
};

// Track page views
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-929VF82NHQ', {
      page_path: url,
      page_title: title,
    });
  }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track product interactions
export const trackProductView = (productName, productId, brand, price) => {
  trackEvent('view_item', 'ecommerce', productName, price);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'GHS',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_brand: brand,
        item_category: 'African Products',
        price: price,
        quantity: 1
      }]
    });
  }
};

// Track add to request basket
export const trackAddToRequest = (productName, productId, brand, price) => {
  trackEvent('add_to_cart', 'ecommerce', productName, price);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'GHS',
      value: price,
      items: [{
        item_id: productId,
        item_name: productName,
        item_brand: brand,
        item_category: 'African Products',
        price: price,
        quantity: 1
      }]
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName, formType) => {
  trackEvent('form_submit', 'engagement', `${formName} - ${formType}`);
};

// Track contact form submission
export const trackContactForm = () => {
  trackFormSubmission('Contact Form', 'EmailJS');
};

// Track request form submission
export const trackRequestForm = (itemCount, totalValue) => {
  trackEvent('purchase', 'ecommerce', 'Request Form Submission', totalValue);
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `request_${Date.now()}`,
      value: totalValue,
      currency: 'GHS',
      items: [{
        item_id: 'request_basket',
        item_name: 'Product Request',
        item_category: 'African Products',
        quantity: itemCount,
        price: totalValue
      }]
    });
  }
};

// Track brand page views
export const trackBrandView = (brandName) => {
  trackEvent('view_brand', 'engagement', brandName);
};

// Track search queries
export const trackSearch = (searchTerm, resultCount) => {
  trackEvent('search', 'engagement', searchTerm, resultCount);
};

// Track PDF downloads
export const trackPDFDownload = (documentType, documentId) => {
  trackEvent('file_download', 'engagement', `${documentType} - ${documentId}`);
};

// Track social media clicks
export const trackSocialClick = (platform, action) => {
  trackEvent('social_click', 'social', `${platform} - ${action}`);
};

// Track newsletter signup
export const trackNewsletterSignup = (email) => {
  trackEvent('newsletter_signup', 'engagement', email);
};

// Track user engagement
export const trackEngagement = (action, element) => {
  trackEvent('user_engagement', 'interaction', `${action} - ${element}`);
};

// Track errors
export const trackError = (errorType, errorMessage) => {
  trackEvent('error', 'technical', `${errorType} - ${errorMessage}`);
};

// Track performance metrics
export const trackPerformance = (metric, value) => {
  trackEvent('performance', 'technical', metric, value);
};

// Enhanced ecommerce tracking for product interactions
export const trackProductInteraction = (action, product) => {
  const eventData = {
    currency: 'GHS',
    value: product.price || product.pricing?.base || 0,
    items: [{
      item_id: product._id || product.id,
      item_name: product.name,
      item_brand: product.brandName || 'Ogla',
      item_category: product.category || 'African Products',
      price: product.price || product.pricing?.base || 0,
      quantity: 1
    }]
  };

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, eventData);
  }
};

// Track user journey
export const trackUserJourney = (step, details) => {
  trackEvent('user_journey', 'engagement', `${step} - ${details}`);
};

// Track conversion events
export const trackConversion = (conversionType, value) => {
  trackEvent('conversion', 'business', conversionType, value);
};

// Track mobile vs desktop usage
export const trackDeviceType = () => {
  const isMobile = window.innerWidth <= 768;
  trackEvent('device_type', 'technical', isMobile ? 'mobile' : 'desktop');
};

// Initialize analytics on app load
export const initializeAnalytics = () => {
  // Track initial page load
  trackPageView(window.location.pathname, document.title);
  
  // Track device type
  trackDeviceType();
  
  // Track user engagement
  trackEngagement('page_load', window.location.pathname);
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackProductView,
  trackAddToRequest,
  trackFormSubmission,
  trackContactForm,
  trackRequestForm,
  trackBrandView,
  trackSearch,
  trackPDFDownload,
  trackSocialClick,
  trackNewsletterSignup,
  trackEngagement,
  trackError,
  trackPerformance,
  trackProductInteraction,
  trackUserJourney,
  trackConversion,
  trackDeviceType,
  initializeAnalytics
};
