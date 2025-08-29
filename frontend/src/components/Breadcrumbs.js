import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { useProducts } from '../hooks/useProducts';

const Breadcrumbs = () => {
  const location = useLocation();
  const { products } = useProducts();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) {
    return null;
  }

  // Define breadcrumb labels
  const getBreadcrumbLabel = (pathname, index) => {
    const pathMap = {
      'products': 'Products',
      'brands': 'Our Brands',
      'la-veeda': 'La Veeda',
      'afrismocks': 'AfriSmocks',
      'ogribusiness': 'OgriBusiness',
      'about': 'About Us',
      'contact': 'Contact Us',
      'login': 'Sign In',
      'register': 'Create Account',
      'request-form': 'Request Form',
      'request-confirmation': 'Request Confirmation',
      'my-requests': 'My Requests',
      'request-basket': 'Request Basket',
      'stories': 'Stories & News'
    };

    // Check if this is a product ID (numeric or alphanumeric)
    if (pathMap[pathname]) {
      return pathMap[pathname];
    }
    
    // If it's a product slug, try to find the product name
    if (index === 1 && pathnames[0] === 'product') {
      const product = products.find(p => p.slug === pathname);
      return product ? product.name : pathname;
    }
    
    // If it's a brand ID, try to find the brand name
    if (index === 1 && pathnames[0] === 'brand') {
      // This will be handled by the brand page itself
      return pathname.charAt(0).toUpperCase() + pathname.slice(1);
    }

    return pathname.charAt(0).toUpperCase() + pathname.slice(1);
  };

  // Build breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Home',
      path: '/',
      icon: <FiHome className="w-4 h-4" />
    }
  ];

  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    breadcrumbItems.push({
      label: getBreadcrumbLabel(pathname, index),
      path: currentPath,
      isLast: index === pathnames.length - 1
    });
  });

  return (
    <nav className="bg-white border-b border-gray-200 py-3 px-4">
      <div className="container mx-auto">
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.path}>
              {index > 0 && (
                <FiChevronRight className="w-4 h-4 text-gray-400" />
              )}
              
              {item.isLast ? (
                <span className="text-gray-900 font-medium flex items-center gap-1">
                  {item.icon && item.icon}
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-gray-600 hover:text-golden-600 transition-colors flex items-center gap-1"
                >
                  {item.icon && item.icon}
                  {item.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumbs;
