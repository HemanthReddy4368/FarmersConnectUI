// src/pages/FarmManagement.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  CloudIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const FarmManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [farmStats, setFarmStats] = useState({
    totalFarms: 0,
    totalArea: 0,
    activeCrops: 0
  });
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    soilType: '',
    size: ''
  });

  useEffect(() => {
    fetchFarms();
  }, [user]);

  const fetchFarms = async () => {
    try {
      const response = await api.get(`/api/Farm/user/${user.id}`);
      setFarms(response.data.farms);
      calculateFarmStats(response.data.farms);
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch farms',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFarmStats = (farmsData) => {
    const stats = {
      totalFarms: farmsData.length,
      totalArea: farmsData.reduce((sum, farm) => sum + Number(farm.size), 0),
      activeCrops: 0 // You'll need to implement this when you have crop data
    };
    setFarmStats(stats);
  };

  // ... (keep existing modal and form handling functions)

  const navigateToFarmCrops = (farmId) => {
    navigate(`/farm/${farmId}/crops`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        // Update existing farm
        const response = await api.put(`/api/Farm/${editingFarm.farmId}`, formData);
        if (response.data.flag) {
          setMessage({
            text: 'Farm updated successfully',
            type: 'success'
          });
          fetchFarms(); // Refresh the farms list
        }
      } else {
        // Create new farm
        const response = await api.post('/api/Farm', formData);
        if (response.data.flag) {
          setMessage({
            text: 'Farm created successfully',
            type: 'success'
          });
          fetchFarms(); // Refresh the farms list
        }
      }
      handleCloseModal();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || `Failed to ${editingFarm ? 'update' : 'create'} farm`,
        type: 'error'
      });
    }
  };
  
  const handleDeleteFarm = async (farmId) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }
  
    try {
      const response = await api.delete(`/api/Farm/${farmId}`);
      if (response.data.flag) {
        setMessage({
          text: 'Farm deleted successfully',
          type: 'success'
        });
        fetchFarms(); // Refresh the farms list
      } else {
        setMessage({
          text: response.data.message || 'Failed to delete farm',
          type: 'error'
        });
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to delete farm',
        type: 'error'
      });
    }
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFarm(null);
    setFormData({
      farmName: '',
      location: '',
      soilType: '',
      size: ''
    });
  };
  
  const handleOpenModal = (farm = null) => {
    if (farm) {
      setEditingFarm(farm);
      setFormData({
        farmName: farm.farmName,
        location: farm.location,
        soilType: farm.soilType,
        size: farm.size
      });
    } else {
      setEditingFarm(null);
      setFormData({
        farmName: '',
        location: '',
        soilType: '',
        size: ''
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Dashboard Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Farm Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your farms and crops</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Farms</p>
              <p className="text-2xl font-semibold text-gray-900">{farmStats.totalFarms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Area</p>
              <p className="text-2xl font-semibold text-gray-900">{farmStats.totalArea} acres</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Crops</p>
              <p className="text-2xl font-semibold text-gray-900">{farmStats.activeCrops}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Farms</h2>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Farm
        </button>
      </div>

      {message.text && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {farms.map((farm) => (
          <div
            key={farm.farmId}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
          >
            <div 
              onClick={() => navigateToFarmCrops(farm.farmId)}
              className="cursor-pointer p-6"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{farm.farmName}</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <p>Location: {farm.location}</p>
                </div>
                <div className="flex items-center">
                  <CloudIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <p>Soil Type: {farm.soilType}</p>
                </div>
                <div className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <p>Size: {farm.size} acres</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenModal(farm);
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFarm(farm.farmId);
                }}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingFarm ? 'Edit Farm' : 'Add New Farm'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Soil Type</label>
                <input
                  type="text"
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Size (acres)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  {editingFarm ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmManagement;