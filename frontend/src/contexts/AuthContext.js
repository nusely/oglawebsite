import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';

// User structure (for reference)
// const User = {
//   _id: '',
//   email: '',
//   firstName: '',
//   lastName: '',
//   phone: '',
//   companyName: '',
//   companyType: '',
//   companyRole: '',
//   role: 'customer', // 'customer', 'admin'
//   createdAt: '',
//   lastLogin: ''
// };

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

  // Load user from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('ogla-token');
      if (token) {
        try {
          // Verify token and get user data
          const response = await fetch('http://192.168.0.123:5000/api/auth/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: data.data } });
            } else {
              // Token invalid, remove it
              localStorage.removeItem('ogla-token');
              dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
            }
          } else {
            // Token invalid, remove it
            localStorage.removeItem('ogla-token');
            dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          localStorage.removeItem('ogla-token');
          dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER, payload: { user: null } });
      }
    };

    initializeAuth();
  }, []);

  // Auth actions
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      // Try real API call first
      const response = await fetch('http://192.168.0.123:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success) {
        const user = data.data.user;
        // Store token in localStorage
        localStorage.setItem('ogla-token', data.data.token);
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user } });
        return { success: true, user };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (apiError) {
      // If API failed, show error
      dispatch({ 
        type: AUTH_ACTIONS.LOGIN_FAILURE, 
        payload: { error: apiError.message || 'Login failed' } 
      });
      return { success: false, error: apiError.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    
    try {
      // Call actual registration API
      const response = await fetch('http://192.168.0.123:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success) {
        const user = data.data.user;
        // Store token in localStorage
        localStorage.setItem('ogla-token', data.data.token);
        dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: { user } });
        return { success: true, user, requiresVerification: !user.emailVerified };
      } else {
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ 
        type: AUTH_ACTIONS.REGISTER_FAILURE, 
        payload: { error: error.message || 'Registration failed' } 
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('ogla-token');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const updateProfile = (updates) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_PROFILE, payload: { updates } });
  };



  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

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
