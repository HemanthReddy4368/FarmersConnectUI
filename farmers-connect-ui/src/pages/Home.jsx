// src/pages/Home.jsx
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  ShoppingBagIcon, 
  TruckIcon, 
  ChatBubbleBottomCenterTextIcon 
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Home = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Current user in Home:', user);
  }, [user]);

  const features = [
    {
      name: 'Connect with Farmers',
      description: 'Direct communication with local farmers for fresh produce.',
      icon: UserIcon,
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Buy Fresh Products',
      description: 'Access to fresh, locally sourced agricultural products.',
      icon: ShoppingBagIcon,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep.',
      icon: TruckIcon,
      color: 'bg-purple-100 text-purple-800',
    },
    {
      name: 'Customer Support',
      description: '24/7 support for all your queries and concerns.',
      icon: ChatBubbleBottomCenterTextIcon,
      color: 'bg-yellow-100 text-yellow-800',
    },
  ];

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
                  Hello, <span className="font-semibold">{user.name}</span>!
                </p>
                <p className="mt-2 text-green-100">
                  You're logged in as a {user.role}
                </p>
              </div>
            ) : (
              <div className="mt-6 flex justify-center gap-4">
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
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Join our community of farmers and buyers today.
            </p>
            {!user && (
              <div className="mt-8">
                <Link
                  to="/register"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition duration-150"
                >
                  Create an Account
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