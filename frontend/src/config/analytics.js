// Google Analytics Configuration
export const GA_CONFIG = {
  TRACKING_ID: 'G-929VF82NHQ',
  MEASUREMENT_ID: 'G-929VF82NHQ',
  DEBUG_MODE: process.env.NODE_ENV === 'development',
  SEND_PAGE_VIEW: true,
  CUSTOM_DIMENSIONS: {
    USER_TYPE: 'user_type', // customer, admin, super_admin
    BRAND_INTEREST: 'brand_interest', // la-veeda, afrismocks, ogribusiness
    PRODUCT_CATEGORY: 'product_category',
    LOCATION: 'location' // Ghana, International
  }
};

// Enhanced ecommerce configuration
export const ECOMMERCE_CONFIG = {
  CURRENCY: 'GHS',
  CURRENCY_SYMBOL: 'GH₵',
  COUNTRY: 'Ghana',
  REGION: 'Upper West Region',
  CITY: 'Lawra'
};

// Event categories for consistent tracking
export const EVENT_CATEGORIES = {
  ENGAGEMENT: 'engagement',
  ECOMMERCE: 'ecommerce',
  SOCIAL: 'social',
  TECHNICAL: 'technical',
  BUSINESS: 'business',
  INTERACTION: 'interaction'
};

// Event actions for consistent tracking
export const EVENT_ACTIONS = {
  // Ecommerce
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  
  // Engagement
  FORM_SUBMIT: 'form_submit',
  FILE_DOWNLOAD: 'file_download',
  SEARCH: 'search',
  SOCIAL_CLICK: 'social_click',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  
  // Technical
  ERROR: 'error',
  PERFORMANCE: 'performance',
  PAGE_LOAD: 'page_load',
  
  // Business
  CONTACT_FORM: 'contact_form',
  REQUEST_FORM: 'request_form',
  BRAND_VIEW: 'brand_view',
  PRODUCT_VIEW: 'product_view'
};

// Custom event labels
export const EVENT_LABELS = {
  // Forms
  CONTACT_FORM: 'Contact Form - EmailJS',
  REQUEST_FORM: 'Request Form Submission',
  NEWSLETTER: 'Newsletter Signup',
  
  // Products
  SHEA_BUTTER: 'Shea Butter Products',
  AFRICAN_TEXTILES: 'African Textiles',
  BUSINESS_SOLUTIONS: 'Business Solutions',
  
  // Brands
  LA_VEEDA: 'La Veeda',
  AFRISMOCKS: 'AfriSmocks',
  OGRIBUSINESS: 'OgriBusiness',
  
  // Actions
  PDF_DOWNLOAD: 'PDF Download',
  EMAIL_SENT: 'Email Sent',
  REQUEST_SUBMITTED: 'Request Submitted'
};

export default {
  GA_CONFIG,
  ECOMMERCE_CONFIG,
  EVENT_CATEGORIES,
  EVENT_ACTIONS,
  EVENT_LABELS
};
