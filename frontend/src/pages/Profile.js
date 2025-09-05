import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiLock, 
  FiFileText, 
  FiMail, 
  FiPhone, 
  FiHome, 
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiEdit3,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiAlertCircle,
  FiLogIn
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import AdvancedSEO from '../components/AdvancedSEO';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile data
  const [profileData, setProfileData] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});
  
  // Password data
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Requests data
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          returnTo: '/profile',
          message: 'Please sign in to view your profile'
        } 
      });
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      if (activeTab === 'requests') {
        fetchRequests();
      }
    }
  }, [isAuthenticated, activeTab]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setProfileData(response.data.data);
        setProfileForm(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const response = await api.get('/requests/my-requests');
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const updateData = { ...profileForm };
      
      // Handle address if it exists
      if (updateData.address && typeof updateData.address === 'object') {
        updateData.address = JSON.stringify(updateData.address);
      }

      const response = await api.put('/auth/profile', updateData);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setProfileData(profileForm);
        setEditingProfile(false);
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      const response = await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      if (response.data.success) {
        setSuccess('Password updated successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <FiXCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <FiAlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <FiClock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLogIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: FiUser },
    { id: 'password', label: 'Change Password', icon: FiLock },
    { id: 'requests', label: 'My Requests', icon: FiFileText }
  ];

  return (
    <>
      <AdvancedSEO 
        title="My Profile - Ogla Shea Butter"
        description="Manage your profile, change password, and view your request history."
        type="website"
      />
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {profileData.firstName} {profileData.lastName}
              </p>
            </div>

            {/* Tabs */}
            <div className="px-6">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'border-green-500 text-green-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
            >
              {success}
            </motion.div>
          )}

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  {!editingProfile ? (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiEdit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleProfileUpdate}
                        disabled={updating}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                      >
                        <FiSave className="w-4 h-4 mr-2" />
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setProfileForm(profileData);
                          setError('');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FiX className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-900 flex items-center">
                      <FiUser className="w-4 h-4 mr-2" />
                      Personal Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileForm.firstName || ''}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileForm.lastName || ''}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiMail className="w-4 h-4 mr-1" />
                        Email
                      </label>
                      <p className="text-gray-900">{profileData.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiPhone className="w-4 h-4 mr-1" />
                        Phone
                      </label>
                      {editingProfile ? (
                        <input
                          type="tel"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                          placeholder="+233204543372"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.phone || 'Not provided'}</p>
                      )}
                    </div>
                  </div>

                  {/* Company Information */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium text-gray-900 flex items-center">
                      <FiHome className="w-4 h-4 mr-2" />
                      Company Information
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      {editingProfile ? (
                        <input
                          type="text"
                          value={profileForm.companyName || ''}
                          onChange={(e) => setProfileForm({...profileForm, companyName: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      ) : (
                        <p className="text-gray-900">{profileData.companyName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                      {editingProfile ? (
                        <select
                          value={profileForm.companyType || ''}
                          onChange={(e) => setProfileForm({...profileForm, companyType: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select company type</option>
                          <option value="Agriculture & Farming">Agriculture & Farming</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                          <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                          <option value="Textiles & Fashion">Textiles & Fashion</option>
                          <option value="Healthcare & Pharmaceuticals">Healthcare & Pharmaceuticals</option>
                          <option value="Retail & Wholesale">Retail & Wholesale</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Export/Import">Export/Import</option>
                          <option value="Hospitality & Tourism">Hospitality & Tourism</option>
                          <option value="Education">Education</option>
                          <option value="Technology">Technology</option>
                          <option value="Construction">Construction</option>
                          <option value="Transportation & Logistics">Transportation & Logistics</option>
                          <option value="Energy & Utilities">Energy & Utilities</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profileData.companyType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiBriefcase className="w-4 h-4 mr-1" />
                        Role
                      </label>
                      {editingProfile ? (
                        <select
                          value={profileForm.companyRole || ''}
                          onChange={(e) => setProfileForm({...profileForm, companyRole: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Select your role</option>
                          <option value="Owner/CEO">Owner/CEO</option>
                          <option value="Manager/Director">Manager/Director</option>
                          <option value="Purchasing Manager">Purchasing Manager</option>
                          <option value="Procurement Officer">Procurement Officer</option>
                          <option value="Sales Manager">Sales Manager</option>
                          <option value="Marketing Manager">Marketing Manager</option>
                          <option value="Operations Manager">Operations Manager</option>
                          <option value="Other">Other</option>
                        </select>
                      ) : (
                        <p className="text-gray-900">{profileData.companyRole}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiCalendar className="w-4 h-4 mr-1" />
                        Member Since
                      </label>
                      <p className="text-gray-900">{formatDate(profileData.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                
                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? <FiEyeOff className="w-4 h-4 text-gray-400" /> : <FiEye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handlePasswordUpdate}
                    disabled={updating || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* My Requests Tab */}
            {activeTab === 'requests' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">My Requests</h2>
                  <button
                    onClick={() => navigate('/request-form')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FiFileText className="w-4 h-4 mr-2" />
                    New Request
                  </button>
                </div>

                {requestsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="text-center py-8">
                    <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
                    <p className="text-gray-600 mb-4">You haven't made any requests yet.</p>
                    <button
                      onClick={() => navigate('/request-form')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      <FiFileText className="w-4 h-4 mr-2" />
                      Make Your First Request
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">
                              Request #{request.requestNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(request.createdAt)}
                            </p>
                          </div>
                          {getStatusBadge(request.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Products:</span>
                            <p className="text-gray-600">
                              {request.products ? JSON.parse(request.products).length : 0} items
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Delivery:</span>
                            <p className="text-gray-600 capitalize">{request.deliveryMethod}</p>
                          </div>
                        </div>

                        {request.notes && (
                          <div className="mt-3">
                            <span className="font-medium text-gray-700 text-sm">Notes:</span>
                            <p className="text-gray-600 text-sm mt-1">{request.notes}</p>
                          </div>
                        )}

                        {request.adminNotes && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <span className="font-medium text-blue-800 text-sm">Admin Response:</span>
                            <p className="text-blue-700 text-sm mt-1">{request.adminNotes}</p>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
