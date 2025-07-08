// src/pages/FarmCrops.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  PlusIcon, 
  ArrowLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';


const FarmCrops = () => {
  const { farmId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    cropName: '',
    plantingDate: '',
    harvestDate: '',
    status: 'Planted',
    yieldEstimate: '',
    waterRequirement: '',
    fertilizer: '',
    notes: ''
  });

  const getStatusColor = (status) => {
    const colors = {
      Planted: 'bg-green-100 text-green-800',
      Growing: 'bg-blue-100 text-blue-800',
      Ready: 'bg-yellow-100 text-yellow-800',
      Harvested: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    fetchFarmAndCrops();
  }, [farmId]);

  const fetchFarmAndCrops = async () => {
    try {
      const [farmResponse, cropsResponse] = await Promise.all([
        api.get(`/api/Farm/${farmId}`),
        api.get(`/api/Crop/farm/${farmId}`)
      ]);

      if (farmResponse.data.flag && cropsResponse.data.flag) {
        setFarm(farmResponse.data.farm);
        setCrops(cropsResponse.data.crops);
      } else {
        throw new Error('Failed to fetch farm data');
      }
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch farm data',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (crop = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        cropName: crop.cropName,
        plantingDate: crop.plantingDate.split('T')[0],
        harvestDate: crop.harvestDate.split('T')[0],
        status: crop.status,
        yieldEstimate: crop.yieldEstimate,
        waterRequirement: crop.waterRequirement || '',
        fertilizer: crop.fertilizer || '',
        notes: crop.notes || ''
      });
    } else {
      setEditingCrop(null);
      setFormData({
        cropName: '',
        plantingDate: '',
        harvestDate: '',
        status: 'Planted',
        yieldEstimate: '',
        waterRequirement: '',
        fertilizer: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCrop(null);
    setFormData({
      cropName: '',
      plantingDate: '',
      harvestDate: '',
      status: 'Planted',
      yieldEstimate: '',
      waterRequirement: '',
      fertilizer: '',
      notes: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        const response = await api.put(`/api/Crop/${editingCrop.cropId}`, {
          ...formData,
          cropId: editingCrop.cropId,
          farmId: farmId
        });

        if (response.data.flag) {
          setMessage({
            text: 'Crop updated successfully',
            type: 'success'
          });
          fetchFarmAndCrops();
        } else {
          throw new Error(response.data.message || 'Failed to update crop');
        }
      } else {
        const response = await api.post(`/api/Crop/farm/${farmId}`, {
          ...formData,
          farmId: farmId
        });

        if (response.data.flag) {
          setMessage({
            text: 'Crop created successfully',
            type: 'success'
          });
          fetchFarmAndCrops();
        } else {
          throw new Error(response.data.message || 'Failed to create crop');
        }
      }
      handleCloseModal();
    } catch (error) {
      setMessage({
        text: error.message || `Failed to ${editingCrop ? 'update' : 'create'} crop`,
        type: 'error'
      });
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (!window.confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/api/Crop/${cropId}`);
      if (response.data.flag) {
        setMessage({
          text: 'Crop deleted successfully',
          type: 'success'
        });
        fetchFarmAndCrops();
      } else {
        throw new Error(response.data.message || 'Failed to delete crop');
      }
    } catch (error) {
      setMessage({
        text: error.message || 'Failed to delete crop',
        type: 'error'
      });
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
      <div className="mb-8">
        <button
          onClick={() => navigate('/farm-management')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Farms
        </button>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{farm?.farmName}</h1>
            <p className="text-gray-600 mt-2">Manage crops for this farm</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Crop
          </button>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {crops.map((crop) => (
          <div
            key={crop.cropId}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{crop.cropName}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(crop.status)}`}>
                {crop.status}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                <span>Harvest: {new Date(crop.harvestDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <ChartBarIcon className="h-5 w-5 mr-2 text-gray-400" />
                <span>Expected Yield: {crop.yieldEstimate}</span>
              </div>
              {crop.waterRequirement && (
                <div className="flex items-center text-gray-600">
                  <WaterDropIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>Water Requirement: {crop.waterRequirement}</span>
                </div>
              )}
              {crop.fertilizer && (
                <div className="flex items-center text-gray-600">
                  <CloudIcon className="h-5 w-5 mr-2 text-gray-400" />
                  <span>Fertilizer: {crop.fertilizer}</span>
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => handleOpenModal(crop)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteCrop(crop.cropId)}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingCrop ? 'Edit Crop' : 'Add New Crop'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                <input
                  type="text"
                  value={formData.cropName}
                  onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Planting Date</label>
                <input
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="Planted">Planted</option>
                  <option value="Growing">Growing</option>
                  <option value="Ready">Ready</option>
                  <option value="Harvested">Harvested</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expected Yield</label>
                <input
                  type="number"
                  value={formData.yieldEstimate}
                  onChange={(e) => setFormData({ ...formData, yieldEstimate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Water Requirement</label>
                <input
                  type="text"
                  value={formData.waterRequirement}
                  onChange={(e) => setFormData({ ...formData, waterRequirement: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fertilizer</label>
                <input
                  type="text"
                  value={formData.fertilizer}
                  onChange={(e) => setFormData({ ...formData, fertilizer: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
                  {editingCrop ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmCrops;