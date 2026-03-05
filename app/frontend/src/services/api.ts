import axios, { type AxiosInstance, type AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  setToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  register: (data: {
    email: string;
    password: string;
    name: string;
    role: 'EMPRESA' | 'EMPLEADO';
    companyName?: string;
  }) => api.post('/auth/register', data),
  
  joinCompany: (inviteCode: string) =>
    api.post('/auth/join-company', { inviteCode }),
  
  getProfile: () => api.get('/auth/me'),
};

// Users API
export const usersApi = {
  getAll: (companyId?: string) =>
    api.get('/users', { params: { companyId } }),
  
  getById: (id: string) => api.get(`/users/${id}`),
  
  getMe: () => api.get('/users/me'),
  
  updateMe: (data: { name?: string; email?: string; avatar?: string }) =>
    api.put('/users/me', data),
};

// Companies API
export const companiesApi = {
  getById: (id: string) => api.get(`/companies/${id}`),
  
  getStats: (id: string) => api.get(`/companies/${id}/stats`),
  
  regenerateCode: (id: string) =>
    api.post(`/companies/${id}/regenerate-code`),
  
  verifyCode: (code: string) => api.get(`/companies/verify-code/${code}`),
};

// Tickets API
export const ticketsApi = {
  getAll: (myTickets?: boolean) =>
    api.get('/tickets', { params: { myTickets } }),
  
  getStats: () => api.get('/tickets/stats'),
  
  getById: (id: string) => api.get(`/tickets/${id}`),
  
  create: (data: {
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    category?: string;
    assignedToId?: string;
  }) => api.post('/tickets', data),
  
  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  
  delete: (id: string) => api.delete(`/tickets/${id}`),
};

// Comments API
export const commentsApi = {
  getByTicket: (ticketId: string) =>
    api.get(`/comments/ticket/${ticketId}`),
  
  create: (data: { content: string; ticketId: string }) =>
    api.post('/comments', data),
  
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export default api;
