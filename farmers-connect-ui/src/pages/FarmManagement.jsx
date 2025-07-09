// src/pages/FarmManagement.jsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon,
  CubeIcon,
  ChevronRightIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { GiBarn, GiSprout, GiFarmer } from 'react-icons/gi'; // Using react-icons for better visuals

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
    activeCrops: 0,
  });
  const [formData, setFormData] = useState({
    farmName: '',
    location: '',
    soilType: '',
    size: '',
  });

  const fetchFarmsAndStats = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const farmResponse = await api.get(`/api/Farm/user/${user.id}`);
      const userFarms = farmResponse.data.farms || [];
      setFarms(userFarms);

      // Fetch crops for each farm to calculate stats
      const cropPromises = userFarms.map(farm => api.get(`/api/Crop/farm/${farm.farmId}`));
      const cropResults = await Promise.all(cropPromises);
      
      let totalCrops = 0;
      const farmsWithCropCount = userFarms.map((farm, index) => {
        const crops = cropResults[index].data.crops || [];
        totalCrops += crops.length;
        return { ...farm, cropCount: crops.length };
      });
      
      setFarms(farmsWithCropCount);

      // Calculate overall stats
      const stats = {
        totalFarms: userFarms.length,
        totalArea: userFarms.reduce((sum, farm) => sum + Number(farm.size), 0),
        activeCrops: totalCrops,
      };
      setFarmStats(stats);

    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch dashboard data',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFarmsAndStats();
  }, [fetchFarmsAndStats]);

  const handleOpenModal = (farm = null) => {
    if (farm) {
      setEditingFarm(farm);
      setFormData({
        farmName: farm.farmName,
        location: farm.location,
        soilType: farm.soilType,
        size: farm.size,
      });
    } else {
      setEditingFarm(null);
      setFormData({ farmName: '', location: '', soilType: '', size: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiCall = editingFarm
      ? api.put(`/api/Farm/${editingFarm.farmId}`, formData)
      : api.post('/api/Farm', formData);
      
    try {
      const response = await apiCall;
      if (response.data.flag) {
        setMessage({
          text: `Farm ${editingFarm ? 'updated' : 'created'} successfully!`,
          type: 'success',
        });
        fetchFarmsAndStats();
        handleCloseModal();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      setMessage({
        text: error.message || `Failed to ${editingFarm ? 'update' : 'create'} farm`,
        type: 'error',
      });
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Are you sure you want to delete this farm and all its associated crops? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/api/Farm/${farmId}`);
      setMessage({ text: 'Farm deleted successfully', type: 'success' });
      fetchFarmsAndStats();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to delete farm',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Farmer's Dashboard</h1>
          <p className="text-lg text-gray-500 mt-1">Welcome back, {user?.name}! Here's an overview of your operations.</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard icon={<GiBarn className="h-8 w-8 text-white"/>} title="Total Farms" value={farmStats.totalFarms} color="from-blue-500 to-blue-400" />
            <StatCard icon={<CubeIcon className="h-8 w-8 text-white"/>} title="Total Area" value={`${farmStats.totalArea} acres`} color="from-green-500 to-green-400" />
            <StatCard icon={<GiSprout className="h-8 w-8 text-white"/>} title="Total Crops" value={farmStats.activeCrops} color="from-yellow-500 to-yellow-400" />
        </div>

        {/* Farms Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">My Farms</h2>
          <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            <PlusIcon className="h-5 w-5 mr-2" /> Add New Farm
          </button>
        </div>

        {message.text && (
            <div className={`p-4 mb-6 rounded-lg border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                {message.text}
            </div>
        )}
        
        {farms.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {farms.map((farm) => (
              <FarmCard key={farm.farmId} farm={farm} onEdit={handleOpenModal} onDelete={handleDeleteFarm} navigate={navigate} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-12 rounded-lg shadow-md border border-dashed border-gray-300">
            <GiFarmer className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-4 text-xl font-medium text-gray-900">No Farms Yet</h3>
            <p className="mt-2 text-gray-500">Get started by adding your first farm to manage your crops and operations.</p>
            <button onClick={() => handleOpenModal()} className="mt-6 inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors">
              <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Farm
            </button>
          </div>
        )}
      </div>

      {isModalOpen && <FarmModal farm={editingFarm} onClose={handleCloseModal} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />}
    </div>
  );
};

// Helper components for a cleaner structure

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-gradient-to-br ${color} text-white rounded-xl shadow-lg p-6 flex items-center`}>
        <div className="bg-white/20 p-4 rounded-full">
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-lg font-medium text-green-50">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

const FarmCard = ({ farm, onEdit, onDelete, navigate }) => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
        <div className="h-32 bg-gradient-to-r from-green-50 to-green-100 flex items-center justify-center">
            <GiBarn className="h-20 w-20 text-green-400 opacity-50"/>
        </div>
        <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800">{farm.farmName}</h3>
            <p className="text-gray-500 flex items-center mt-1"><MapPinIcon className="h-4 w-4 mr-2 text-gray-400"/>{farm.location}</p>
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="font-medium text-gray-700">Size: <span className="font-normal text-gray-500">{farm.size} acres</span></div>
                <div className="font-medium text-gray-700">Soil: <span className="font-normal text-gray-500">{farm.soilType}</span></div>
                <div className="font-medium text-gray-700 col-span-2">Crops: <span className="font-normal text-gray-500">{farm.cropCount} types registered</span></div>
            </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
             <div className="flex space-x-2">
                <button onClick={() => onEdit(farm)} className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-200 transition-colors" title="Edit Farm">
                    <PencilIcon className="h-5 w-5"/>
                </button>
                <button onClick={() => onDelete(farm.farmId)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-200 transition-colors" title="Delete Farm">
                    <TrashIcon className="h-5 w-5"/>
                </button>
             </div>
            <button onClick={() => navigate(`/farm/${farm.farmId}/crops`)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                Manage Crops <ChevronRightIcon className="h-4 w-4 ml-1"/>
            </button>
        </div>
    </div>
);

const FarmModal = ({ farm, onClose, onSubmit, formData, setFormData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{farm ? 'Edit Farm' : 'Add New Farm'}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Farm Name</label>
                    <input type="text" value={formData.farmName} onChange={(e) => setFormData({ ...formData, farmName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
                        <input type="text" value={formData.soilType} onChange={(e) => setFormData({ ...formData, soilType: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size (acres)</label>
                        <input type="number" value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">{farm ? 'Update' : 'Create'}</button>
                </div>
            </form>
        </div>
    </div>
);

export default FarmManagement;
