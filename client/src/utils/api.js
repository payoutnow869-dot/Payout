import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password) => api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  getBalance: () => api.get('/user/balance'),
  getTransactions: (limit, offset) => api.get('/user/transactions', { params: { limit, offset } }),
};

// Withdraw API
export const withdrawAPI = {
  getFeeInfo: () => api.get('/withdraw/fee-info'),
  calculateFee: (amount) => api.post('/withdraw/calculate-fee', { amount }),
  create: (data) => api.post('/withdraw', data),
  getHistory: (limit, offset) => api.get('/withdraw/history', { params: { limit, offset } }),
  getOne: (id) => api.get(`/withdraw/${id}`),
};

// Support API
export const supportAPI = {
  createTicket: (data) => api.post('/support/ticket', data),
  getTickets: (limit, offset) => api.get('/support/tickets', { params: { limit, offset } }),
  getOne: (id) => api.get(`/support/tickets/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (search, limit, offset) => api.get('/admin/users', { params: { search, limit, offset } }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  adjustBalance: (id, amount, reason) => api.put(`/admin/users/${id}/balance`, { amount, reason }),
  toggleStatus: (id) => api.put(`/admin/users/${id}/status`),
  getWithdrawals: (status, limit, offset) => api.get('/admin/withdrawals', { params: { status, limit, offset } }),
  processWithdrawal: (id, status, adminNote) => api.put(`/admin/withdrawals/${id}`, { status, adminNote }),
  getTickets: (status, limit, offset) => api.get('/admin/tickets', { params: { status, limit, offset } }),
  replyTicket: (id, reply, status) => api.put(`/admin/tickets/${id}`, { reply, status }),
  getSettings: () => api.get('/admin/settings'),
  updateFeeLinks: (links) => api.put('/admin/settings/fee-links', { links }),
  updateFeePercent: (percent) => api.put('/admin/settings/fee-percent', { percent }),
};

export default api;
