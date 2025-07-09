// src/pages/ExpensesDashboard.jsx (FIXED)
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GiPayMoney, GiSprout, GiPodiumWinner } from 'react-icons/gi';

const ExpensesDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [allExpenses, setAllExpenses] = useState([]);
    const [allCrops, setAllCrops] = useState([]);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const farmResponse = await api.get(`/api/Farm/user/${user.id}`);
            const farms = farmResponse.data.farms || [];

            if (farms.length > 0) {
                const cropPromises = farms.map(farm => api.get(`/api/Crop/farm/${farm.farmId}`));
                const cropResults = await Promise.all(cropPromises);
                const crops = cropResults.flatMap(res => res.data.crops || []);
                setAllCrops(crops);

                if (crops.length > 0) {
                    const expensePromises = crops.map(crop => api.get(`/api/crop/${crop.cropId}/expense`));
                    const expenseResults = await Promise.all(expensePromises);
                    setAllExpenses(expenseResults.flatMap(res => res.data || []));
                }
            }
        } catch (error) {
            console.error("Failed to fetch expense data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { totalExpenses, expensesByCategory, expensesByCrop, topStats } = useMemo(() => {
        const categoryMap = {};
        const cropMap = {};

        allExpenses.forEach(expense => {
            const categoryName = expense.category || 'Uncategorized';
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + expense.amount;

            const crop = allCrops.find(c => c.cropId === expense.cropId);
            if (crop) {
                cropMap[crop.cropName] = (cropMap[crop.cropName] || 0) + expense.amount;
            }
        });

        const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, Expenses: value })).sort((a, b) => b.Expenses - a.Expenses);
        const cropChartData = Object.entries(cropMap).map(([name, value]) => ({ name, Expenses: value })).sort((a, b) => b.Expenses - a.Expenses);
        
        const topSpendingCategory = categoryChartData[0] || { name: 'N/A', Expenses: 0 };
        const mostExpensiveCrop = cropChartData[0] || { name: 'N/A', Expenses: 0 };

        return {
            totalExpenses: allExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            expensesByCategory: categoryChartData,
            expensesByCrop: cropChartData,
            topStats: {
                category: topSpendingCategory.name,
                crop: mostExpensiveCrop.name
            }
        };
    }, [allExpenses, allCrops]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header>
                    <h1 className="text-4xl font-bold text-gray-800">Overall Expenses Hub</h1>
                    <p className="text-lg text-gray-500 mt-1">A complete financial overview of all your farming operations.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon={<GiPayMoney className="h-8 w-8 text-white"/>} title="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} color="from-red-500 to-red-400" />
                    <StatCard icon={<GiPodiumWinner className="h-8 w-8 text-white"/>} title="Highest Spending On" value={topStats.category} color="from-yellow-500 to-yellow-400" />
                    <StatCard icon={<GiSprout className="h-8 w-8 text-white"/>} title="Most Expensive Crop" value={topStats.crop} color="from-purple-500 to-purple-400" />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={expensesByCategory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                            <YAxis tickFormatter={(value) => `₹${value}`} tick={{ fill: '#6b7280' }} />
                            <Tooltip cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Expenses" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <DetailList title="Expenses by Crop" data={expensesByCrop} />
                    <DetailList title="Recent Transactions" data={allExpenses.slice(0, 10).map(e => ({name: `${e.category} (${new Date(e.expenseDate).toLocaleDateString()})`, Expenses: e.amount}))} />
                </div>
            </div>
        </div>
    );
};

// --- Helper components remain the same ---

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-gradient-to-br ${color} text-white rounded-xl shadow-lg p-6 flex items-center`}>
        <div className="bg-white/20 p-4 rounded-full">{icon}</div>
        <div className="ml-4">
            <p className="text-lg font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold truncate">{value}</p>
        </div>
    </div>
);

const DetailList = ({ title, data }) => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.length > 0 ? data.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <p className="font-semibold text-gray-700">{item.name}</p>
                    <p className="font-bold text-gray-800">₹{item.Expenses.toFixed(2)}</p>
                </div>
            )) : <p className="text-center text-gray-500 py-10">No data available.</p>}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-green-600">{`Total: ₹${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

export default ExpensesDashboard;
