import axios from 'axios';
import toast from 'react-hot-toast';

// Smart API URL detection for both PC and mobile access
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // If environment variable is set, use it
  if (envUrl && envUrl !== 'http://localhost:5000/api/v1') {
    return envUrl;
  }
  
  // Auto-detect based on current host
  const currentHost = window.location.hostname;
  
  // If accessing from localhost, use localhost API
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000/api/v1';
  }
  
  // If accessing from IP address (mobile), use same IP for API
  return `http://${currentHost}:5000/api/v1`;
};

const API_URL = getApiUrl();

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Don't show toast for certain errors
    if (error.response?.status !== 401 && !originalRequest._noToast) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
