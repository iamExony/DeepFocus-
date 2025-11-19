import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Goals API
export const goalsAPI = {
  getAll: () => api.get('/goals'),
  getOne: (id) => api.get(`/goals/${id}`),
  create: (data) => api.post('/goals', data),
  update: (id, data) => api.put(`/goals/${id}`, data),
  delete: (id) => api.delete(`/goals/${id}`),
  getStats: (id) => api.get(`/goals/${id}/stats`),
};

// Sessions API
export const sessionsAPI = {
  create: (data) => api.post('/sessions', data),
  getAll: (params) => api.get('/sessions', { params }),
  getStats: (params) => api.get('/sessions/stats', { params }),
};

// Progress API
export const progressAPI = {
  getDaily: (date) => api.get('/progress/daily', { params: { date } }),
  getByGoal: (goalId, params) => api.get(`/progress/goal/${goalId}`, { params }),
  getCalendar: (params) => api.get('/progress/calendar', { params }),
  getOverallStats: () => api.get('/progress/stats/overall'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Admin API
export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemStats: () => api.get('/admin/stats/system'),
};

export default api;
