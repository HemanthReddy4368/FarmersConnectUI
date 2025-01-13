import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:7108', // Update with your API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request - Token:', token); // Debug
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request Config:', config); // Debug
    return config;
  },
  (error) => {
    console.error('API Request Error:', error); // Debug
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response); // Debug
    return response;
  },
  (error) => {
    console.error('API Response Error:', error); // Debug
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing token'); // Debug
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;