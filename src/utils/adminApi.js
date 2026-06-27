import axios from 'axios';
import { ADMIN_TOKEN_KEY, ADMIN_DATA_KEY } from './constants';

const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_DATA_KEY);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminTicketsAPI = {
  list: (params) => adminApi.get('/tickets', { params }),
  get: (id) => adminApi.get(`/tickets/${id}`),
  patchStatus: (id, status) => adminApi.patch(`/tickets/${id}/status`, { status }),
  delete: (id) => adminApi.delete(`/tickets/${id}`),
};

export const adminCommentsAPI = {
  list: (ticketId) => adminApi.get(`/comments/ticket/${ticketId}`),
  create: (ticketId, text) => adminApi.post(`/comments/ticket/${ticketId}`, { text }),
};

export const adminStatsAPI = {
  admin: () => adminApi.get('/stats/admin'),
};

export default adminApi;
