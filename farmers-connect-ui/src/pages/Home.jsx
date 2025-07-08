// src/pages/Home.jsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserGroupIcon, 
  ShoppingBagIcon, 
  TruckIcon, 
  ChatBubbleBottomCenterTextIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  const ROLES = {
    FARMER: 'Farmer',
    BUYER: 'Buyer',
    ADMIN: 'Admin',
    WORKER: 'Worker'
  };

  const getRoleSpecificContent = () => {
    switch(user?.role) {
      case ROLES.FARMER:
        return {
          title: "Manage Your Farm",
          description: "Access your farm management tools and connect with buyers",
          actions: [
            { label: "Farm Management", path: "/farm-management", icon: BuildingOfficeIcon },
            { label: "Weather Forecast", path: "/weather", icon: CloudIcon }
          ]
        };
      case ROLES.BUYER:
        return {
          title: "Find Fresh Produce",
          description: "Browse and purchase directly from local farmers",
          actions: [
            { label: "Marketplace", path: "/marketplace", icon: ShoppingBagIcon },
            { label: "Track Orders", path: "/orders", icon: TruckIcon }
          ]
        };
      case ROLES.WORKER:
        return {
          title: "Manage Work Orders",
          description: "View and manage your assigned tasks",
          actions: [
            { label: "Work Orders", path: "/work-orders", icon: ChartBarIcon },
            { label: "Schedule", path: "/schedule", icon: CloudIcon }
          ]
        };
      default:
        return null;
    }
  };

  const features = [
    {
      name: 'Farm Management',
      description: 'Efficient tools for farmers to manage their farms and produce.',
      icon: BuildingOfficeIcon,
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Direct Trading',
      description: 'Connect farmers directly with buyers for better prices.',
      icon: CurrencyDollarIcon,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Market Access',
      description: 'Access to wider market and fair pricing for agricultural products.',
      icon: ShoppingBagIcon,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      name: 'Community',
      description: 'Join a growing community of farmers and agricultural professionals.',
      icon: UserGroupIcon,
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

  const roleContent = getRoleSpecificContent();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Welcome to Farmers Connect
            </h1>
            {user ? (
              <div className="mt-6">
                <p className="text-xl text-green-100">
                  Welcome back, <span className="font-semibold">{user.name}</span>!
                </p>
                {roleContent && (
                  <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-4">{roleContent.title}</h2>
                    <p className="text-green-100 mb-6">{roleContent.description}</p>
                    <div className="flex justify-center gap-4">
                      {roleContent.actions.map((action, index) => (
                        <Link
                          key={index}
                          to={action.path}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition duration-150"
                        >
                          <action.icon className="h-5 w-5 mr-2" />
                          {action.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center">
                <p className="text-xl text-green-100 mb-6">
                  Connect, Trade, and Grow with the Agricultural Community
                </p>
                <div className="flex gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition duration-150"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-500 hover:bg-green-600 transition duration-150"
                  >
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
          Why Choose Farmers Connect?
        </h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition duration-150"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {feature.name}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to Transform Your Agricultural Business?
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
              Join our platform to connect with farmers, buyers, and agricultural professionals. 
              Get access to better prices, wider markets, and efficient management tools.
            </p>
            {!user && (
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-150"
                >
                  Start Your Journey
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            © 2024 Farmers Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;