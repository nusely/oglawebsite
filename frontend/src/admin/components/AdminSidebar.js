import React from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon, 
  CubeIcon, 
  DocumentTextIcon, 
  TagIcon, 
  Squares2X2Icon, 
  UsersIcon, 
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  ClockIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AdminSidebar = ({ isOpen, onToggle, currentPath, onNavigate, userRole }) => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: HomeIcon,
      color: 'text-blue-600'
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: CubeIcon,
      color: 'text-green-600'
    },
    {
      name: 'Stories',
      path: '/admin/stories',
      icon: DocumentTextIcon,
      color: 'text-purple-600'
    },
    {
      name: 'Brands',
      path: '/admin/brands',
      icon: TagIcon,
      color: 'text-orange-600'
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: Squares2X2Icon,
      color: 'text-red-600'
    },
    {
      name: 'Requests',
      path: '/admin/requests',
      icon: ClipboardDocumentListIcon,
      color: 'text-yellow-600'
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: ChatBubbleLeftRightIcon,
      color: 'text-pink-600'
    },
    // Only show Activities for super admin
    ...(userRole === 'super_admin' ? [{
      name: 'Activities',
      path: '/admin/activities',
      icon: ClockIcon,
      color: 'text-cyan-600'
    }] : []),
          {
        name: 'Featured Products',
        path: '/admin/brand-featured-products',
        icon: StarIcon,
        color: 'text-amber-600'
      },
    {
      name: 'Users',
      path: '/admin/users',
      icon: UsersIcon,
      color: 'text-indigo-600'
    },
    {
      name: 'Profile',
      path: '/admin/profile',
      icon: UserCircleIcon,
      color: 'text-teal-600'
    }
  ];

  const handleNavigation = (path) => {
    onNavigate(path);
    if (window.innerWidth < 1024) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800">Ogla Admin</h1>
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                currentPath === item.path ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
              <span className={`font-medium ${
                currentPath === item.path ? 'text-blue-600' : 'text-gray-700'
              }`}>
                {item.name}
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white shadow-lg" style={{ height: '100vh' }}>
            <div className="flex items-center h-16 px-4 border-b">
              <h1 className="text-xl font-bold text-gray-800">Ogla Admin</h1>
            </div>
            
            <nav className="flex-1 px-2 py-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPath === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
