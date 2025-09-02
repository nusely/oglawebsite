import axios from 'axios';

// Create axios instance
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  profile: '/auth/profile',
  
  // Products
  products: '/products',
  product: (id: string) => `/products/${id}`,
  
  // Stories
  stories: '/stories',
  story: (id: string) => `/stories/${id}`,
  
  // Brands
  brands: '/brands',
  brand: (id: string) => `/brands/${id}`,
  
  // Categories
  categories: '/categories',
  category: (id: string) => `/categories/${id}`,
  
  // Users
  users: '/users',
  user: (id: string) => `/users/${id}`,
  
  // Requests
  requests: '/requests',
  request: (id: string) => `/requests/${id}`,
};



