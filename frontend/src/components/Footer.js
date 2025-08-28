import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="text-white" style={{ backgroundColor: '#040504' }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img 
                  src="/images/ogla_icon.webp" 
                  alt="Ogla Icon" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ogla Trading</h3>
                <p className="text-sm text-gray-400">Shea Butter & General Trading</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Premium products from Northern Ghana, celebrating authentic craftsmanship 
              and natural excellence through our three distinct brands.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-gray-300">
                <FiMapPin className="mr-2" />
                <span>Lawra, Upper West Region, Ghana</span>
              </div>
              <div className="flex items-center text-gray-300">
                <FiPhone className="mr-2" />
                <span>+233 XX XXX XXXX</span>
              </div>
              <div className="flex items-center text-gray-300">
                <FiMail className="mr-2" />
                <span>info@oglatrading.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Brands */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Brands</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/brands/la-veeda" className="text-gray-300 hover:text-white transition-colors">
                  La Veeda
                </Link>
              </li>
              <li>
                <Link to="/brands/afrismocks" className="text-gray-300 hover:text-white transition-colors">
                  AfriSmocks
                </Link>
              </li>
              <li>
                <Link to="/brands/ogribusiness" className="text-gray-300 hover:text-white transition-colors">
                  OgriBusiness
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Ogla Shea Butter & General Trading. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
