import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

import ScrollToTopOnRouteChange from './components/ScrollToTopOnRouteChange';
import RequestBasket from './components/RequestBasket';
import Home from './pages/Home';
import About from './pages/About';
import BrandPage from './pages/BrandPage';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import RequestBasketPage from './pages/RequestBasketPage';
import RequestForm from './pages/RequestForm';
import RequestConfirmation from './pages/RequestConfirmation';
import MyRequests from './pages/MyRequests';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="App w-full overflow-x-hidden">
      <ScrollToTopOnRouteChange />
      <Header />
      <main className="w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:productSlug" element={<ProductDetail />} />
          <Route path="/brands/:brandSlug" element={<BrandPage />} />
          <Route path="/request-basket" element={<RequestBasketPage />} />
          <Route path="/request-form" element={<RequestForm />} />
          <Route path="/request-confirmation" element={<RequestConfirmation />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
      <RequestBasket />
    </div>
  );
}

export default App;
