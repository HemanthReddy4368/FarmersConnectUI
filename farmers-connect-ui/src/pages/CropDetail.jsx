// src/pages/CropDetail.jsx (UPDATED & FIXED)
// Added the missing ChevronRightIcon import.
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeftIcon, CalendarIcon, CheckIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // <-- FIXED: Added ChevronRightIcon
import { GiPlantSeed, GiSprout, GiTomato, GiCorn, GiWheat, GiWateringCan } from 'react-icons/gi';
import { GiPayMoney } from 'react-icons/gi';

const CROP_STAGES = [
    { id: 1, name: 'Planted', icon: <GiPlantSeed className="h-8 w-8" /> },
    { id: 2, name: 'Growing', icon: <GiSprout className="h-8 w-8" /> },
    { id: 3, name: 'Ready to Harvest', display: 'Ready', icon: <GiTomato className="h-8 w-8" /> },
    { id: 4, name: 'Harvested', icon: <GiWheat className="h-8 w-8" /> }
];

const CropDetail = () => {
    const { farmId, cropId } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchCropDetails = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/Crop/${cropId}`);
            if (response.data.flag) {
                setCrop(response.data);
            } else {
                throw new Error('Could not fetch crop details.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [cropId]);

    useEffect(() => {
        fetchCropDetails();
    }, [fetchCropDetails]);

    const handleUpdateStatus = async () => {
        const currentStatus = crop.status;
        if (currentStatus >= 4) return;

        const nextStatus = currentStatus + 1;
        try {
            const response = await api.patch(`/api/Crop/${cropId}/status`, nextStatus, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.data.flag) {
                fetchCropDetails();
            } else {
                throw new Error("Failed to update status.");
            }
        } catch (err) {
            setError(err.response?.data?.title || err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-10">{error}</div>;
    }

    const currentStageIndex = CROP_STAGES.findIndex(stage => stage.id === crop.status);

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => navigate(`/farm/${farmId}/crops`)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to All Crops
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">{crop.cropName}</h1>
                    <p className="text-lg text-gray-500 mt-1">Detailed progress and management</p>
                </header>

                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Crop Lifecycle</h2>
                    <div className="flex items-center">
                        {CROP_STAGES.map((stage, index) => (
                            <div key={stage.id} className="flex items-center w-full">
                                <div className="flex flex-col items-center z-10">
                                    <div className={`h-16 w-16 rounded-full flex items-center justify-center border-4 ${index <= currentStageIndex ? 'bg-green-600 text-white border-white' : 'bg-gray-200 text-gray-500 border-gray-100'}`}>
                                        {stage.icon}
                                    </div>
                                    <p className={`mt-2 text-sm font-semibold text-center ${index <= currentStageIndex ? 'text-green-700' : 'text-gray-500'}`}>{stage.display || stage.name}</p>
                                </div>
                                {index < CROP_STAGES.length - 1 && (
                                    <div className={`flex-auto border-t-4 ${index < currentStageIndex ? 'border-green-600' : 'border-gray-300 border-dashed'}`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                    {crop.status < 4 && (
                        <div className="mt-8 text-center">
                            <button onClick={handleUpdateStatus} className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                                Advance to "{CROP_STAGES[currentStageIndex + 1].name}"
                                <ChevronRightIcon className="h-5 w-5 ml-2" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Key Dates</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700"><CalendarIcon className="h-5 w-5 mr-3 text-green-500" />Planted On: <span className="font-semibold ml-2">{new Date(crop.plantingDate).toLocaleDateString()}</span></div>
                            <div className="flex items-center text-gray-700"><CalendarIcon className="h-5 w-5 mr-3 text-red-500" />Expected Harvest: <span className="font-semibold ml-2">{new Date(crop.harvestDate).toLocaleDateString()}</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Yield Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700"><GiWheat className="h-5 w-5 mr-3 text-yellow-600" />Estimated Yield: <span className="font-semibold ml-2">{crop.yieldEstimate} kg</span></div>
                        </div>
                    </div>
                    <div className="mt-6">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Financials</h3>
                                    <p className="text-gray-500">Track expenses and calculate profitability.</p>
                                </div>
                                <button
                                    onClick={() => navigate(`/farm/${farmId}/crop/${cropId}/analysis`)}
                                    className="inline-flex items-center px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-md hover:bg-black transition-colors"
                                >
                                    <GiPayMoney className="h-5 w-5 mr-2" />
                                    View Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropDetail;