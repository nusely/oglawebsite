import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Request item structure (for reference)
// const RequestItem = {
//   _id: '',
//   name: '',
//   price: 0,
//   image: '',
//   brandId: '',
//   brandName: '',
//   quantity: 1,
//   slug: ''
// };

// Request basket state structure
const initialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
  isOpen: false
};

// Request basket actions
const REQUEST_BASKET_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_BASKET: 'CLEAR_BASKET',
  TOGGLE_BASKET: 'TOGGLE_BASKET',
  LOAD_BASKET: 'LOAD_BASKET'
};

// Request basket reducer
const requestBasketReducer = (state, action) => {
  switch (action.type) {
    case REQUEST_BASKET_ACTIONS.ADD_ITEM: {
      const { item } = action.payload;
      const existingItem = state.items.find(basketItem => basketItem._id === item._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        const updatedItems = state.items.map(basketItem =>
          basketItem._id === item._id
            ? { ...basketItem, quantity: basketItem.quantity + item.quantity }
            : basketItem
        );
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + item.quantity,
          totalAmount: state.totalAmount + (item.price * item.quantity)
        };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, item],
          totalItems: state.totalItems + item.quantity,
          totalAmount: state.totalAmount + (item.price * item.quantity)
        };
      }
    }
    
    case REQUEST_BASKET_ACTIONS.REMOVE_ITEM: {
      const { itemId } = action.payload;
      const itemToRemove = state.items.find(item => item._id === itemId);
      
      if (!itemToRemove) return state;
      
      return {
        ...state,
        items: state.items.filter(item => item._id !== itemId),
        totalItems: state.totalItems - itemToRemove.quantity,
        totalAmount: state.totalAmount - (itemToRemove.price * itemToRemove.quantity)
      };
    }
    
    case REQUEST_BASKET_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, quantity } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      
      if (!item) return state;
      
      const quantityDiff = quantity - item.quantity;
      
      return {
        ...state,
        items: state.items.map(basketItem =>
          basketItem._id === itemId
            ? { ...basketItem, quantity }
            : basketItem
        ),
        totalItems: state.totalItems + quantityDiff,
        totalAmount: state.totalAmount + (item.price * quantityDiff)
      };
    }
    
    case REQUEST_BASKET_ACTIONS.CLEAR_BASKET:
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalAmount: 0
      };
    
    case REQUEST_BASKET_ACTIONS.TOGGLE_BASKET:
      return {
        ...state,
        isOpen: !state.isOpen
      };
    
    case REQUEST_BASKET_ACTIONS.LOAD_BASKET:
      return {
        ...state,
        ...action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const RequestBasketContext = createContext();

// Request basket provider component
export const RequestBasketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(requestBasketReducer, initialState);

  // Load request basket from localStorage on mount
  useEffect(() => {
    const savedBasket = localStorage.getItem('ogla-request-basket');
    if (savedBasket) {
      try {
        const parsedBasket = JSON.parse(savedBasket);
        dispatch({ type: REQUEST_BASKET_ACTIONS.LOAD_BASKET, payload: parsedBasket });
      } catch (error) {
        console.error('Error loading request basket from localStorage:', error);
      }
    }
  }, []);

  // Save request basket to localStorage whenever it changes
  useEffect(() => {
    const basketToSave = {
      items: state.items,
      totalItems: state.totalItems,
      totalAmount: state.totalAmount
    };
    localStorage.setItem('ogla-request-basket', JSON.stringify(basketToSave));
  }, [state.items, state.totalItems, state.totalAmount]);

  // Request basket actions
  const addToRequest = (product, quantity = 1) => {
    // Handle different price structures
    let price = 0;
    if (product.pricing?.unitPrice) {
      price = product.pricing.unitPrice;
    } else if (typeof product.price === 'number') {
      price = product.price;
    } else if (typeof product.price === 'string') {
      // Handle price strings like "₵156.00" or "GHS 280.00"
      const priceMatch = product.price.match(/[\d,]+\.?\d*/);
      price = priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0;
    }

    // Generate a unique ID for featured products that don't have _id
    const productId = product._id || `featured_${product.name.replace(/\s+/g, '_').toLowerCase()}`;

    const requestItem = {
      _id: productId,
      name: product.name,
      price: price,
      image: product.images?.[0] || product.image || '/images/placeholder-product.webp',
      brandId: product.brandId || 'featured',
      brandName: product.brandName || 'Featured Product',
      quantity,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      shortDescription: product.shortDescription || product.description || ''
    };
    
    dispatch({ type: REQUEST_BASKET_ACTIONS.ADD_ITEM, payload: { item: requestItem } });
  };

  const removeFromRequest = (itemId) => {
    dispatch({ type: REQUEST_BASKET_ACTIONS.REMOVE_ITEM, payload: { itemId } });
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromRequest(itemId);
    } else {
      dispatch({ type: REQUEST_BASKET_ACTIONS.UPDATE_QUANTITY, payload: { itemId, quantity } });
    }
  };

  const clearRequestBasket = () => {
    dispatch({ type: REQUEST_BASKET_ACTIONS.CLEAR_BASKET });
  };

  const toggleRequestBasket = () => {
    dispatch({ type: REQUEST_BASKET_ACTIONS.TOGGLE_BASKET });
  };

  const isInRequest = (productId) => {
    return state.items.some(item => item._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    ...state,
    addToRequest,
    removeFromRequest,
    updateQuantity,
    clearRequestBasket,
    toggleRequestBasket,
    isInRequest,
    getItemQuantity
  };

  return (
    <RequestBasketContext.Provider value={value}>
      {children}
    </RequestBasketContext.Provider>
  );
};

// Custom hook to use request basket context
export const useRequestBasket = () => {
  const context = useContext(RequestBasketContext);
  if (!context) {
    throw new Error('useRequestBasket must be used within a RequestBasketProvider');
  }
  return context;
};
