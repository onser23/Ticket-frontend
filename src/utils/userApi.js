import axios from 'axios';
import { USER_TOKEN_KEY, USER_DATA_KEY } from './constants';

const userApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem(USER_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

userApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(USER_TOKEN_KEY);
      localStorage.removeItem(USER_DATA_KEY);
      const path = window.location.pathname;
      if (!path.startsWith('/login') &&
          !path.startsWith('/register') &&
          !path.startsWith('/verify-otp') &&
          !path.startsWith('/forgot-password') &&
          !path.startsWith('/reset-password')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const ticketsAPI = {
  create: (formData) => userApi.post('/tickets', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  list: (params) => userApi.get('/tickets', { params }),
  get: (id) => userApi.get(`/tickets/${id}`),
};

export const commentsAPI = {
  list: (ticketId) => userApi.get(`/comments/ticket/${ticketId}`),
  create: (ticketId, text) => userApi.post(`/comments/ticket/${ticketId}`, { text }),
};

export const statsAPI = {
  user: () => userApi.get('/stats/user'),
};

export default userApi;
