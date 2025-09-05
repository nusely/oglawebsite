import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch stats from backend
      const [dashboardStatsRes, storiesRes, activitiesRes] =
        await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/stories/admin/all"),
          api.get("/activities?limit=10"), // Fetch recent activities
        ]);

      // Use dynamic stats from dashboard API
      const dashboardData = dashboardStatsRes.data.data;
      
      const formatPercentageChange = (percent) => {
        if (percent === 0) return "0%";
        return percent > 0 ? `+${percent}%` : `${percent}%`;
      };

      const statsData = [
        {
          name: "Total Products",
          value: dashboardData.products.total.toString(),
          change: formatPercentageChange(dashboardData.products.growthPercent),
          changeType: dashboardData.products.growthPercent >= 0 ? "positive" : "negative",
          icon: CubeIcon,
          color: "bg-blue-500",
        },
        {
          name: "Total Stories",
          value: storiesRes.data.data?.stories?.length?.toString() || "0",
          change: "0%", // Stories don't have growth tracking yet
          changeType: "neutral",
          icon: DocumentTextIcon,
          color: "bg-green-500",
        },
        {
          name: "Total Users",
          value: dashboardData.users.total.toString(),
          change: formatPercentageChange(dashboardData.users.growthPercent),
          changeType: dashboardData.users.growthPercent >= 0 ? "positive" : "negative",
          icon: UsersIcon,
          color: "bg-purple-500",
        },
        {
          name: "Pending Requests",
          value: dashboardData.requests.total.toString(),
          change: formatPercentageChange(dashboardData.requests.growthPercent),
          changeType: dashboardData.requests.growthPercent >= 0 ? "positive" : "negative",
          icon: ClipboardDocumentListIcon,
          color: "bg-orange-500",
        },
      ];

      setStats(statsData);

      // Use real activities from the API
      if (activitiesRes.data?.activities?.length > 0) {
        const formattedActivities = activitiesRes.data.activities.map(activity => {
          // Convert timestamp to relative time
          const activityTime = new Date(activity.createdAt);
          const now = new Date();
          const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
          
          let timeString;
          if (diffInMinutes < 60) {
            timeString = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
          } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            timeString = `${hours} hour${hours !== 1 ? 's' : ''} ago`;
          } else {
            const days = Math.floor(diffInMinutes / 1440);
            timeString = `${days} day${days !== 1 ? 's' : ''} ago`;
          }

          // Format activity message based on action
          let message = activity.details || activity.action;
          if (activity.action === 'user_login') {
            message = `User logged in`;
          } else if (activity.action === 'user_registered') {
            message = `New user registration`;
          } else if (activity.action === 'product_created') {
            message = `Product created`;
          } else if (activity.action === 'request_created') {
            message = `New request submitted`;
          } else if (activity.action === 'brand_featured_product_added') {
            message = `Featured product added`;
          }

          return {
            id: activity.id,
            type: activity.entityType,
            message: message,
            time: timeString,
            user: activity.user || 'System',
          };
        });
        
        setRecentActivities(formattedActivities);
      } else {
        setRecentActivities([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");
      
      // Set empty arrays instead of mock data
      setStats([]);
      setRecentActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      product: CubeIcon,
      user: UsersIcon,
      request: ClipboardDocumentListIcon,
      story: DocumentTextIcon,
    };
    return icons[type] || DocumentTextIcon;
  };

  const getActivityColor = (type) => {
    const colors = {
      product: "text-blue-600",
      user: "text-purple-600",
      request: "text-orange-600",
      story: "text-green-600",
    };
    return colors[type] || "text-gray-600";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Ogla Admin Dashboard</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard data from database...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to the Ogla Admin Dashboard</p>
        </div>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-center">
            <div className="text-red-600 text-lg font-medium">{error}</div>
            <p className="text-gray-500 mt-2">All data comes from the database - no mock data used.</p>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-golden-600 text-white rounded-lg hover:bg-golden-700 transition-colors"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to the Ogla Admin Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const getNavigationPath = (statName) => {
            switch (statName) {
              case "Total Products":
                return "/admin/products";
              case "Total Stories":
                return "/admin/stories";
              case "Total Users":
                return "/admin/users";
              case "Pending Requests":
                return "/admin/requests";
              default:
                return null;
            }
          };

          const navigationPath = getNavigationPath(stat.name);
          const StatComponent = navigationPath ? "button" : "div";
          const statProps = navigationPath
            ? {
                onClick: () => navigate(navigationPath),
                className:
                  "bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer",
              }
            : {
                className: "bg-white rounded-lg shadow p-6",
              };

          return (
            <StatComponent key={stat.name} {...statProps}>
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">
                  from last month
                </span>
              </div>
            </StatComponent>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const getActivityNavigationPath = (type) => {
                  switch (type) {
                    case "product":
                      return "/admin/products";
                    case "user":
                      return "/admin/users";
                    case "request":
                      return "/admin/requests";
                    case "story":
                      return "/admin/stories";
                    default:
                      return null;
                  }
                };

                const navigationPath = getActivityNavigationPath(activity.type);
                const ActivityComponent = navigationPath ? "button" : "div";
                const activityProps = navigationPath
                  ? {
                      onClick: () => navigate(navigationPath),
                      className:
                        "flex items-start space-x-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors",
                    }
                  : {
                      className: "flex items-start space-x-3",
                    };

                return (
                  <ActivityComponent key={activity.id} {...activityProps}>
                    <div
                      className={`p-2 rounded-lg bg-gray-100 ${getActivityColor(
                        activity.type
                      )}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-sm text-gray-500">
                        {activity.time} • {activity.user}
                      </p>
                    </div>
                  </ActivityComponent>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/admin/products")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <CubeIcon className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Add Product</p>
              </button>
              <button
                onClick={() => navigate("/admin/stories")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <DocumentTextIcon className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Create Story
                </p>
              </button>
              <button
                onClick={() => navigate("/admin/users")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <UsersIcon className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Manage Users
                </p>
              </button>
              <button
                onClick={() => navigate("/admin/requests")}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <ClipboardDocumentListIcon className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  View Requests
                </p>
              </button>
              {/* Activities card for super_admin only */}
              {user?.role === "super_admin" && (
                <button
                  onClick={() => navigate("/admin/activities")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <ClockIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">
                    Activities
                  </p>
                </button>
              )}
              {/* Featured Products card for both admin and super_admin */}
              {(user?.role === "admin" || user?.role === "super_admin") && (
                <button
                  onClick={() => navigate("/admin/brand-featured-products")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <CubeIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">
                    Featured Products
                  </p>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Data Source Indicator */}
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          📊 All dashboard data is dynamically loaded from the database - no mock data used
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
