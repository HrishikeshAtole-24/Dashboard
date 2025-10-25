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
  getWebsites: async () => {
    const response = await api.get('/dashboard/websites');
    return response.data;
  },

  addWebsite: async (websiteData) => {
    const response = await api.post('/dashboard/websites', websiteData);
    return response.data;
  },

  updateWebsite: async (id, websiteData) => {
    const response = await api.put(`/dashboard/websites/${id}`, websiteData);
    return response.data;
  },

  deleteWebsite: async (id) => {
    const response = await api.delete(`/dashboard/websites/${id}`);
    return response.data;
  },

  // Legacy compatibility methods
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

  getTechnologyAnalytics: async (websiteId, days = 30) => {
    const response = await api.get(`/dashboard/${websiteId}/technology?days=${days}`);
    return response.data;
  },

  getReferrerAnalytics: async (websiteId, days = 30, limit = 10) => {
    const response = await api.get(`/dashboard/${websiteId}/referrers?days=${days}&limit=${limit}`);
    return response.data;
  },

  getRealtime: async (websiteId) => {
    const response = await api.get(`/dashboard/${websiteId}/realtime`);
    return response.data;
  },

  getReferrers: async (websiteId, days = 30, limit = 10) => {
    const response = await api.get(`/dashboard/${websiteId}/referrers?days=${days}&limit=${limit}`);
    return response.data;
  },

  getGeographic: async (websiteId, days = 30, limit = 10) => {
    const response = await api.get(`/dashboard/${websiteId}/geographic?days=${days}&limit=${limit}`);
    return response.data;
  },

  triggerAggregation: async (websiteId) => {
    const response = await api.post(`/dashboard/${websiteId}/aggregate`);
    return response.data;
  },

  getConversionRates: async (websiteId, options = {}) => {
    const { startDate, endDate, goalId } = options;
    let url = `/dashboard/analytics/conversion-rates?website_id=${websiteId}`;
    
    if (startDate) url += `&start_date=${startDate}`;
    if (endDate) url += `&end_date=${endDate}`;
    if (goalId) url += `&goal_id=${goalId}`;
    
    const response = await api.get(url);
    return response.data;
  },
};

// Goals API
export const goalsAPI = {
  // Initialize goals table
  initialize: async () => {
    const response = await api.get('/dashboard/goals/init');
    return response.data;
  },

  // Create new goal
  create: async (goalData) => {
    const response = await api.post('/dashboard/goals', goalData);
    return response.data;
  },

  // Get all goals for a website
  getAll: async (websiteId) => {
    const response = await api.get(`/dashboard/goals?website_id=${websiteId}`);
    return response.data;
  },

  // Get specific goal
  getById: async (goalId) => {
    const response = await api.get(`/dashboard/goals/${goalId}`);
    return response.data;
  },

  // Update goal
  update: async (goalId, updateData) => {
    const response = await api.put(`/dashboard/goals/${goalId}`, updateData);
    return response.data;
  },

  // Delete goal
  delete: async (goalId) => {
    const response = await api.delete(`/dashboard/goals/${goalId}`);
    return response.data;
  },

  // Get goal conversions
  getConversions: async (goalId, options = {}) => {
    const { startDate, endDate, limit, offset } = options;
    let url = `/dashboard/goals/${goalId}/conversions`;
    
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Record manual conversion
  recordConversion: async (goalId, conversionData) => {
    const response = await api.post(`/dashboard/goals/${goalId}/conversions`, conversionData);
    return response.data;
  },

  // Process goal completions (Global Analytics Feature)
  processCompletions: async (websiteId = null) => {
    let url = '/dashboard/goals/process-completions';
    if (websiteId) {
      url += `?website_id=${websiteId}`;
    }
    const response = await api.post(url);
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