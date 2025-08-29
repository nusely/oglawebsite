import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingBag, FiSearch, FiUser, FiLogOut } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';
import { useRequestBasket } from '../contexts/RequestBasketContext';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { brands } = useProducts();
  const { totalItems, toggleRequestBasket } = useRequestBasket();
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-md w-full">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center">
              <img 
                src="/images/ogla_icon.webp" 
                alt="Ogla Icon" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="block">
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900">Ogla Shea Butter</h1>
              <p className="text-xs text-gray-500">& General Trading</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
              }`}
            >
              Home
            </Link>
            
            <Link 
              to="/about" 
              className={`text-sm font-medium transition-colors ${
                isActive('/about') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
              }`}
            >
              About
            </Link>
            
            {/* Brands Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium text-gray-700 hover:text-golden-600 transition-colors">
                Our Brands
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-4 space-y-3">
                  {brands.map((brand) => (
                    <Link
                      key={brand._id}
                      to={`/brand/${brand.slug}`}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: brand.brandColors.primary }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{brand.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link 
              to="/products" 
              className={`text-sm font-medium transition-colors ${
                isActive('/products') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
              }`}
            >
              Products
            </Link>
            
            <Link 
              to="/stories" 
              className={`text-sm font-medium transition-colors ${
                isActive('/stories') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
              }`}
            >
              Stories
            </Link>
            
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors ${
                isActive('/contact') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-600 hover:text-golden-600 transition-colors"
            >
              <FiSearch size={20} />
            </button>
            
            <button 
              onClick={toggleRequestBasket}
              className="p-2 text-gray-600 hover:text-golden-600 transition-colors relative"
            >
              <FiShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-golden-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-golden-600 transition-colors"
                >
                  <FiUser size={20} />
                  <span className="text-sm font-medium">
                    {user?.firstName || 'User'}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-requests"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Requests
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-golden-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm px-4 py-2"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Request Basket */}
            <button 
              onClick={toggleRequestBasket}
              className="p-2 text-gray-600 hover:text-golden-600 transition-colors relative"
            >
              <FiShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-golden-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* User Icon/Name */}
            {isAuthenticated ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 p-2 text-gray-600 hover:text-golden-600 transition-colors"
              >
                <FiUser size={18} />
                <span className="text-xs font-medium max-w-16 truncate">
                  {user?.firstName || 'User'}
                </span>
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 p-2 text-gray-600 hover:text-golden-600 transition-colors"
              >
                <FiUser size={18} />
                <span className="text-xs font-medium">Sign In</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-600 hover:text-golden-600 transition-colors"
            >
              {isMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-golden-500 focus:border-transparent"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200">
            <nav className="py-4 space-y-4">
              <Link 
                to="/" 
                className={`block text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                to="/about" 
                className={`block text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Our Brands</p>
                {brands.map((brand) => (
                  <Link
                    key={brand._id}
                    to={`/brand/${brand.slug}`}
                    className="block pl-4 text-sm text-gray-600 hover:text-golden-600 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
              
              <Link 
                to="/products" 
                className={`block text-sm font-medium transition-colors ${
                  isActive('/products') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              
              <Link 
                to="/stories" 
                className={`block text-sm font-medium transition-colors ${
                  isActive('/stories') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Stories
              </Link>
              
              <Link 
                to="/contact" 
                className={`block text-sm font-medium transition-colors ${
                  isActive('/contact') ? 'text-golden-600' : 'text-gray-700 hover:text-golden-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
            </nav>
            
            <div className="py-4 border-t border-gray-200 flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-golden-600 transition-colors">
                <FiSearch size={20} />
              </button>
              <button 
                onClick={toggleRequestBasket}
                className="p-2 text-gray-600 hover:text-golden-600 transition-colors relative"
              >
                <FiShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-golden-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile User Menu */}
            {isAuthenticated && isUserMenuOpen && (
              <div className="py-4 border-t border-gray-200">
                <div className="space-y-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-requests"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsUserMenuOpen(false);
                    }}
                  >
                    My Requests
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                      setIsUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
