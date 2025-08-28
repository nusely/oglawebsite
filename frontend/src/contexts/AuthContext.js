import React, { createContext, useContext, useReducer, useEffect } from 'react';

// User structure
const User = {
  _id: '',
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  companyName: '',
  companyType: '',
  companyRole: '',
  role: 'customer', // 'customer', 'admin'
  createdAt: '',
  lastLogin: ''
};

// Auth state structure
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  LOAD_USER: 'LOAD_USER'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.UPDATE_PROFILE:
      return {
        ...state,
        user: { ...state.user, ...action.payload.updates }
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isLoading: false
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('ogla-user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user } });
        } else {
          dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
      }
    };

    loadUser();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('ogla-user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('ogla-user');
    }
  }, [state.user]);

  // Auth actions
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // This will be replaced with actual API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API response
      const mockUser = {
        _id: 'user123',
        email,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+233 XX XXX XXXX',
        companyName: 'Sample Company Ltd',
        companyType: 'Manufacturing',
        companyRole: 'Manager/Director',
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: mockUser } });
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: { error: error.message || 'Login failed' } 
      });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      // This will be replaced with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with actual API response
      const mockUser = {
        _id: 'user' + Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        companyName: userData.companyName,
        companyType: userData.companyType,
        companyRole: userData.companyRole,
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: { user: mockUser } });
      return { success: true };
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_FAILURE, 
        payload: { error: error.message || 'Registration failed' } 
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const updateProfile = (updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: { updates } });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
