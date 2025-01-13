import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Home component mounted');
    console.log('Current user in Home:', user);
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome to Farmers Connect
        </h1>
        {user ? (
          <p className="mt-4 text-gray-600">
            Hello, {user.name}! You are successfully logged in.
          </p>
        ) : (
          <p className="mt-4 text-gray-600">
            You are not logged in.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;