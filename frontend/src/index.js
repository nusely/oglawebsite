import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/globals.css';
import App from './App';
import { ProductProvider } from './hooks/useProducts';
import { RequestBasketProvider } from './contexts/RequestBasketContext';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ProductProvider>
        <RequestBasketProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </RequestBasketProvider>
      </ProductProvider>
    </BrowserRouter>
  </React.StrictMode>
);
