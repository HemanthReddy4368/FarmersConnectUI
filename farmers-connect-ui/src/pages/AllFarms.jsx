// src/pages/AllFarms.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AllFarms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { user } = useAuth();

  useEffect(() => {
    fetchAllFarms();
  }, []);

  const fetchAllFarms = async () => {
    try {
      const response = await api.get('/api/Farm');
      setFarms(response.data.farms);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch farms',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Farms</h1>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div
            key={farm.farmId}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{farm.farmName}</h3>
            <div className="space-y-2 text-gray-600">
              <p>Farmer ID: {farm.userId}</p>
              <p>Location: {farm.location}</p>
              <p>Soil Type: {farm.soilType}</p>
              <p>Size: {farm.size} acres</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllFarms;