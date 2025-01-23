// src/pages/Admin.jsx
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
// Updated Heroicons v2 imports
import { ArrowPathIcon as RefreshIcon, TrashIcon, UsersIcon as UserGroupIcon } from '@heroicons/react/24/outline';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Role definitions with colors
  const ROLES = {
    1: { name: 'Farmer', color: 'bg-green-100 text-green-800' },
    2: { name: 'Buyer', color: 'bg-blue-100 text-blue-800' },
    3: { name: 'Admin', color: 'bg-purple-100 text-purple-800' },
    4: { name: 'Worker', color: 'bg-yellow-100 text-yellow-800' }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'Admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/User');
      if (response.data) {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          throw new Error('Invalid response format');
        }
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch users';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Session expired. Please login again.';
            navigate('/login');
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            navigate('/');
            break;
          case 404:
            errorMessage = 'User data not found.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.response.data?.message || 'An error occurred while fetching users.';
        }
      }
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/api/User/${userId}/role`, newRole);
      setMessage({
        text: 'User role updated successfully',
        type: 'success'
      });
      await fetchUsers();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to update user role',
        type: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await api.delete(`/api/User/${userId}`);
      setMessage({
        text: 'User deleted successfully',
        type: 'success'
      });
      await fetchUsers();
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to delete user',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-xl font-semibold">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-8 w-8 text-white" />
                <h2 className="text-3xl font-bold text-white">Admin Panel</h2>
              </div>
              <button
                onClick={fetchUsers}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-white rounded-md hover:bg-indigo-50 shadow-sm transition duration-150 ease-in-out"
              >
                <RefreshIcon className="h-4 w-4 mr-2" />
                Refresh Users
              </button>
            </div>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div
              className={`mx-6 mt-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              } flex items-center justify-between`}
            >
              <span className="text-sm font-medium">{message.text}</span>
              <button
                onClick={() => setMessage({ text: '', type: '' })}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
          )}

          {/* Users Table */}
          <div className="p-6">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by adding new users.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.userId} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {user.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.userId, parseInt(e.target.value))}
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-1 px-2"
                          >
                            {Object.entries(ROLES).map(([roleId, { name }]) => (
                              <option key={roleId} value={roleId}>
                                {name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDeleteUser(user.userId)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;