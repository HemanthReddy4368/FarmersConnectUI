// src/pages/FarmCrops.jsx (UPDATED & FIXED)
// This page is now cleaner, bug-free, and navigates to the new detail page.
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PlusIcon, ArrowLeftIcon, PencilIcon, TrashIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { GiPlantSeed, GiWheat, GiTomato, GiCorn } from 'react-icons/gi';

// --- HELPER OBJECTS ---
const STATUS_MAP = {
    1: 'Planted',
    2: 'Growing',
    3: 'ReadyToHarvest',
    4: 'Harvested'
};
const STATUS_DISPLAY_MAP = {
    Planted: 'Planted',
    Growing: 'Growing',
    ReadyToHarvest: 'Ready',
    Harvested: 'Harvested'
};

const FarmCrops = () => {
    const { farmId } = useParams();
    const navigate = useNavigate();
    const [farm, setFarm] = useState(null);
    const [crops, setCrops] = useState([]);
    const [stats, setStats] = useState({ total: 0, planted: 0, growing: 0, readytoharvest: 0, harvested: 0 });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCrop, setEditingCrop] = useState(null);

    const initialFormData = {
        cropName: '',
        plantingDate: '',
        harvestDate: '',
        status: 1, // Default to 'Planted'
        yieldEstimate: '',
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchFarmAndCrops = useCallback(async () => {
        setLoading(true);
        try {
            const [farmResponse, cropsResponse] = await Promise.all([
                api.get(`/api/Farm/${farmId}`),
                api.get(`/api/Crop/farm/${farmId}`)
            ]);

            setFarm(farmResponse.data);

            const fetchedCrops = cropsResponse.data.crops || [];
            setCrops(fetchedCrops);

            const newStats = { total: fetchedCrops.length, planted: 0, growing: 0, readytoharvest: 0, harvested: 0 };
            fetchedCrops.forEach(crop => {
                const statusKey = STATUS_MAP[crop.status]?.toLowerCase();
                if (statusKey && newStats.hasOwnProperty(statusKey)) {
                    newStats[statusKey]++;
                }
            });
            setStats(newStats);

        } catch (error) {
            setMessage({ text: error.message || 'Failed to load data', type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [farmId]);

    useEffect(() => {
        fetchFarmAndCrops();
    }, [fetchFarmAndCrops]);
    
    // (Modal and form handling functions remain the same, but are updated to handle numeric status)
    const handleOpenModal = (crop = null) => {
        if (crop) {
            setEditingCrop(crop);
            setFormData({
                cropName: crop.cropName,
                plantingDate: crop.plantingDate ? new Date(crop.plantingDate).toISOString().split('T')[0] : '',
                harvestDate: crop.harvestDate ? new Date(crop.harvestDate).toISOString().split('T')[0] : '',
                status: crop.status, // Keep status as number
                yieldEstimate: crop.yieldEstimate,
            });
        } else {
            setEditingCrop(null);
            setFormData(initialFormData);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...formData, status: Number(formData.status) };
        const apiCall = editingCrop
            ? api.put(`/api/Crop/${editingCrop.cropId}`, payload)
            : api.post(`/api/Crop/farm/${farmId}`, payload);

        try {
            const response = await apiCall;
            if (response.data.flag) {
                setMessage({ text: `Crop ${editingCrop ? 'updated' : 'created'} successfully!`, type: 'success' });
                fetchFarmAndCrops();
                handleCloseModal();
            } else { throw new Error(response.data.message); }
        } catch (error) {
            setMessage({ text: error.message || `Failed to ${editingCrop ? 'update' : 'create'} crop`, type: 'error' });
        }
    };

    const handleDeleteCrop = async (cropId) => {
        if (!window.confirm('Are you sure you want to delete this crop?')) return;
        try {
            await api.delete(`/api/Crop/${cropId}`);
            setMessage({ text: 'Crop deleted successfully', type: 'success' });
            fetchFarmAndCrops();
        } catch (error) {
            setMessage({ text: error.response?.data?.message || 'Failed to delete crop', type: 'error' });
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
                <header className="mb-8">
                    <button onClick={() => navigate('/farm-management')} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Dashboard
                    </button>
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800">{farm?.farmName || 'Farm'}</h1>
                            <p className="text-lg text-gray-500 mt-1">Manage all crops for this farm</p>
                        </div>
                        <button onClick={() => handleOpenModal()} className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                            <PlusIcon className="h-5 w-5 mr-2" /> Add New Crop
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <CropStat title="Total Crops" value={stats.total} />
                    <CropStat title="Planted" value={stats.planted} />
                    <CropStat title="Growing" value={stats.growing} />
                    <CropStat title="Ready" value={stats.readytoharvest} />
                    <CropStat title="Harvested" value={stats.harvested} />
                </div>
                
                {/* Render cards or empty state */}
                {crops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {crops.map((crop) => (
                            <CropCard key={crop.cropId} crop={crop} farmId={farmId} onEdit={handleOpenModal} onDelete={handleDeleteCrop} navigate={navigate} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center bg-white p-12 rounded-lg shadow-md border border-dashed border-gray-300">
                        <GiPlantSeed className="mx-auto h-16 w-16 text-gray-400" />
                        <h3 className="mt-4 text-xl font-medium text-gray-900">No Crops Found</h3>
                        <p className="mt-2 text-gray-500">Start managing this farm by adding your first crop.</p>
                        <button onClick={() => handleOpenModal()} className="mt-6 inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                            <PlusIcon className="h-5 w-5 mr-2" /> Add First Crop
                        </button>
                    </div>
                )}
            </div>
            {isModalOpen && <CropModal crop={editingCrop} onClose={handleCloseModal} onSubmit={handleSubmit} formData={formData} setFormData={setFormData} />}
        </div>
    );
};

// --- Helper Components for FarmCrops ---
const CropStat = ({ title, value }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm text-center">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
);

const CropCard = ({ crop, farmId, onEdit, onDelete, navigate }) => {
    const getCropIcon = (cropName) => {
        const name = cropName.toLowerCase();
        if (name.includes('tomato')) return <GiTomato className="h-10 w-10 text-red-500" />;
        if (name.includes('corn')) return <GiCorn className="h-10 w-10 text-yellow-500" />;
        if (name.includes('wheat')) return <GiWheat className="h-10 w-10 text-yellow-600" />;
        return <GiPlantSeed className="h-10 w-10 text-green-500" />;
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl group">
            <div className="p-5">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        {getCropIcon(crop.cropName)}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{crop.cropName}</h3>
                            <p className="text-xs text-white px-2 py-0.5 rounded-full inline-block bg-green-500 font-semibold">{STATUS_DISPLAY_MAP[STATUS_MAP[crop.status]]}</p>
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(crop); }} className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-gray-100"><PencilIcon className="h-5 w-5"/></button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(crop.cropId); }} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"><TrashIcon className="h-5 w-5"/></button>
                    </div>
                </div>
            </div>
            <button onClick={() => navigate(`/farm/${farmId}/crop/${crop.cropId}`)} className="w-full bg-gray-50 group-hover:bg-green-50 px-5 py-3 flex justify-between items-center text-sm font-semibold text-gray-600 group-hover:text-green-700 transition-colors">
                <span>View Progress</span>
                <ChevronRightIcon className="h-5 w-5 transform group-hover:translate-x-1 transition-transform"/>
            </button>
        </div>
    );
};

const CropModal = ({ crop, onClose, onSubmit, formData, setFormData }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">{crop ? 'Edit Crop' : 'Add New Crop'}</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-4">
                <input type="text" value={formData.cropName} onChange={(e) => setFormData({ ...formData, cropName: e.target.value })} placeholder="Crop Name" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                <div className="grid grid-cols-2 gap-4">
                    <input type="date" value={formData.plantingDate} onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                    <input type="date" value={formData.harvestDate} onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required>
                        {Object.entries(STATUS_MAP).map(([key, value]) => <option key={key} value={key}>{STATUS_DISPLAY_MAP[value]}</option>)}
                    </select>
                    <input type="number" value={formData.yieldEstimate} onChange={(e) => setFormData({ ...formData, yieldEstimate: e.target.value })} placeholder="Yield Estimate (kg)" className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                    <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">{crop ? 'Update Crop' : 'Create Crop'}</button>
                </div>
            </form>
        </div>
    </div>
);

export default FarmCrops;
