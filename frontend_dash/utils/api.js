import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      Cookies.remove('auth_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// Website API
export const websiteAPI = {
  getAll: async () => {
    const response = await api.get('/dashboard/websites');
    return { success: true, data: response.data.websites || [] };
  },

  create: async (websiteData) => {
    const response = await api.post('/dashboard/websites', websiteData);
    return { success: true, data: response.data.website, message: response.data.message };
  },

  update: async (id, websiteData) => {
    const response = await api.put(`/dashboard/websites/${id}`, websiteData);
    return { success: true, data: response.data.website, message: response.data.message };
  },

  delete: async (id) => {
    const response = await api.delete(`/dashboard/websites/${id}`);
    return { success: true, message: response.data.message };
  },
};

// Analytics API
export const analyticsAPI = {
  getOverview: async (websiteId, days = 30) => {
    const response = await api.get(`/dashboard/${websiteId}/overview?days=${days}`);
    return response.data;
  },

  getChartData: async (websiteId, days = 30) => {
    const response = await api.get(`/dashboard/${websiteId}/chart?days=${days}`);
    return response.data;
  },

  getTopPages: async (websiteId, days = 30) => {
    const response = await api.get(`/dashboard/${websiteId}/top-pages?days=${days}`);
    return response.data;
  },

  getRealtime: async (websiteId) => {
    const response = await api.get(`/dashboard/${websiteId}/realtime`);
    return response.data;
  },
};

// Database initialization API
export const initAPI = {
  initAuth: async () => {
    const response = await api.get('/auth/init');
    return response.data;
  },

  initCollect: async () => {
    const response = await api.get('/collect/init');
    return response.data;
  },

  initDashboard: async () => {
    const response = await api.get('/dashboard/init');
    return response.data;
  },
};

export default api;