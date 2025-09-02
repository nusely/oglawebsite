import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  CubeIcon,
  DocumentTextIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats from backend
      const [productsRes, storiesRes, usersRes, requestsRes] =
        await Promise.all([
          api.get("/products"),
          api.get("/stories/admin/all"),
          api.get("/users"),
          api.get("/requests"),
        ]);

      const statsData = [
        {
          name: "Total Products",
          value: productsRes.data.data?.products?.length?.toString() || "0",
          change: "+12%",
          changeType: "positive",
          icon: CubeIcon,
          color: "bg-blue-500",
        },
        {
          name: "Total Stories",
          value: storiesRes.data.data?.stories?.length?.toString() || "0",
          change: "+3%",
          changeType: "positive",
          icon: DocumentTextIcon,
          color: "bg-green-500",
        },
        {
          name: "Total Users",
          value: usersRes.data.data?.users?.length?.toString() || "0",
          change: "+8%",
          changeType: "positive",
          icon: UsersIcon,
          color: "bg-purple-500",
        },
        {
          name: "Pending Requests",
          value:
            requestsRes.data.data?.requests
              ?.filter((req) => req.status === "pending")
              ?.length?.toString() || "0",
          change: "-2%",
          changeType: "negative",
          icon: ClipboardDocumentListIcon,
          color: "bg-orange-500",
        },
      ];

      setStats(statsData);

      // Generate recent activities from the data
      const activities = [];

      // Add recent products
      if (productsRes.data.data?.products?.length > 0) {
        const recentProduct = productsRes.data.data.products[0];
        activities.push({
          id: 1,
          type: "product",
          message: `Product "${recentProduct.name}" added`,
          time: "2 hours ago",
          user: "Admin User",
        });
      }

      // Add recent users
      if (usersRes.data.data?.users?.length > 0) {
        const recentUser = usersRes.data.data.users[0];
        activities.push({
          id: 2,
          type: "user",
          message: `New user registration: ${recentUser.email}`,
          time: "4 hours ago",
          user: "System",
        });
      }

      // Add recent requests
      if (requestsRes.data.data?.requests?.length > 0) {
        const recentRequest = requestsRes.data.data.requests[0];
        activities.push({
          id: 3,
          type: "request",
          message: `New request submitted: REQ-${recentRequest.id}`,
          time: "6 hours ago",
          user: "Customer",
        });
      }

      // Add recent stories
      if (storiesRes.data.data?.stories?.length > 0) {
        const recentStory = storiesRes.data.data.stories[0];
        activities.push({
          id: 4,
          type: "story",
          message: `Story "${recentStory.title}" published`,
          time: "1 day ago",
          user: "Admin User",
        });
      }

      setRecentActivities(activities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Fallback to mock data if API fails
      setStats([
        {
          name: "Total Products",
          value: "24",
          change: "+12%",
          changeType: "positive",
          icon: CubeIcon,
          color: "bg-blue-500",
        },
        {
          name: "Total Stories",
          value: "8",
          change: "+3%",
          changeType: "positive",
          icon: DocumentTextIcon,
          color: "bg-green-500",
        },
        {
          name: "Total Users",
          value: "156",
          change: "+8%",
          changeType: "positive",
          icon: UsersIcon,
          color: "bg-purple-500",
        },
        {
          name: "Pending Requests",
          value: "12",
          change: "-2%",
          changeType: "negative",
          icon: ClipboardDocumentListIcon,
          color: "bg-orange-500",
        },
      ]);

      setRecentActivities([
        {
          id: 1,
          type: "product",
          message: 'New product "Pure Shea Butter" added',
          time: "2 hours ago",
          user: "Admin User",
        },
        {
          id: 2,
          type: "user",
          message: "New user registration: john@example.com",
          time: "4 hours ago",
          user: "System",
        },
        {
          id: 3,
          type: "request",
          message: "New request submitted: REQ-2024-001",
          time: "6 hours ago",
          user: "Customer",
        },
        {
          id: 4,
          type: "story",
          message: 'Story "Benefits of Shea Butter" published',
          time: "1 day ago",
          user: "Admin User",
        },
      ]);
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
          <span className="ml-3 text-gray-600">Loading dashboard data...</span>
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
                      : "text-red-600"
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
              {/* Activities card for admin and super_admin */}
              {(user?.role === "admin" || user?.role === "super_admin") && (
                <button
                  onClick={() => navigate("/admin/activities")}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-sm font-medium text-gray-900">
                    Activities
                  </p>
                </button>
              )}
              {/* Featured Products card only for super_admin */}
              {user?.role === "super_admin" && (
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
    </div>
  );
};

export default Dashboard;
