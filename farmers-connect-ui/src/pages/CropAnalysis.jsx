import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeftIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GiPayMoney, GiSprout, GiCoins } from 'react-icons/gi';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

const CropAnalysis = () => {
    const { farmId, cropId } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAnalysisData = useCallback(async () => {
        setLoading(true);
        try {
            const [cropRes, expensesRes] = await Promise.all([
                api.get(`/api/Crop/${cropId}`),
                api.get(`/api/crop/${cropId}/expense`)
            ]);
            setCrop(cropRes.data);
            setExpenses(expensesRes.data);
        } catch (error) {
            console.error("Failed to fetch analysis data", error);
        } finally {
            setLoading(false);
        }
    }, [cropId]);

    useEffect(() => {
        fetchAnalysisData();
    }, [fetchAnalysisData]);

    const { totalExpenses, expenseByCategory } = useMemo(() => {
        const categoryMap = {};
        const total = expenses.reduce((acc, expense) => {
            const category = expense.category || 'Uncategorized';
            categoryMap[category] = (categoryMap[category] || 0) + expense.amount;
            return acc + expense.amount;
        }, 0);
        
        const chartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
        return { totalExpenses: total, expenseByCategory: chartData };
    }, [expenses]);

    const netProfit = revenue - totalExpenses;

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            await api.delete(`/api/crop/${cropId}/expense/${expenseId}`);
            fetchAnalysisData();
        } catch (error) {
            console.error("Failed to delete expense", error);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]"><div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => navigate(`/farm/${farmId}/crop/${cropId}`)} className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" /> Back to Crop Details
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800">Financial Analysis: {crop?.cropName}</h1>
                </header>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<GiPayMoney className="h-8 w-8 text-white"/>} title="Total Revenue" value={`₹${revenue.toFixed(2)}`} color="from-green-500 to-green-400" />
                    <StatCard icon={<GiCoins className="h-8 w-8 text-white"/>} title="Total Expenses" value={`₹${totalExpenses.toFixed(2)}`} color="from-red-500 to-red-400" />
                    <StatCard icon={<GiSprout className="h-8 w-8 text-white"/>} title="Net Profit" value={`₹${netProfit.toFixed(2)}`} color={netProfit >= 0 ? "from-blue-500 to-blue-400" : "from-orange-500 to-orange-400"} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Expense Chart and Revenue */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Expense Breakdown</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                        {expenseByCategory.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Set Total Revenue</h3>
                            <p className="text-sm text-gray-500 mb-4">Enter the final amount you received from selling this crop.</p>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                                <input type="number" placeholder="0.00" value={revenue || ''} onChange={e => setRevenue(Number(e.target.value))} className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Expense Log</h3>
                            <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-700">
                                <PlusIcon className="h-5 w-5 mr-2" /> Add Expense
                            </button>
                        </div>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {expenses.length > 0 ? expenses.map(exp => (
                                <div key={exp.expenseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-700">{exp.category}</p>
                                        <p className="text-sm text-gray-500">{new Date(exp.expenseDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <p className="font-bold text-lg text-red-500">₹{exp.amount.toFixed(2)}</p>
                                        <button onClick={() => handleDeleteExpense(exp.expenseId)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </div>
                                </div>
                            )) : <p className="text-center text-gray-500 py-10">No expenses logged yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
            {isModalOpen && <ExpenseModal cropId={cropId} onClose={() => setIsModalOpen(false)} onSave={fetchAnalysisData} />}
        </div>
    );
};

const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-gradient-to-br ${color} text-white rounded-xl shadow-lg p-6 flex items-center`}>
        <div className="bg-white/20 p-4 rounded-full">{icon}</div>
        <div className="ml-4">
            <p className="text-lg font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

const ExpenseModal = ({ cropId, onClose, onSave }) => {
    const [formData, setFormData] = useState({ category: 'Seeds', amount: '', expenseDate: new Date().toISOString().split('T')[0], description: '' });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/crop/${cropId}/expense`, { ...formData, amount: Number(formData.amount) });
            onSave();
            onClose();
        } catch (error) {
            console.error("Failed to add expense", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Log New Expense</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><XMarkIcon className="h-6 w-6 text-gray-500" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500">
                        <option>Seeds</option>
                        <option>Fertilizer</option>
                        <option>Pesticides</option>
                        <option>Labor</option>
                        <option>Machinery</option>
                        <option>Utilities</option>
                        <option>Other</option>
                    </select>
                    <input type="number" placeholder="Amount (₹)" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                    <input type="date" value={formData.expenseDate} onChange={e => setFormData({...formData, expenseDate: e.target.value})} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" required />
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional description..." className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500" rows="3"></textarea>
                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CropAnalysis;