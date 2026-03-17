import axios, { type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  joinCompany: (inviteCode: string) => api.post('/auth/join-company', { inviteCode }),
  getProfile: () => api.get('/auth/me'),
};

export const usersApi = {
  getAll: (companyId?: string) => api.get('/users', { params: { companyId } }),
  getById: (id: string) => api.get(`/users/${id}`),
  getMe: () => api.get('/users/me'),
  updateMe: (data: { name?: string; email?: string }) => api.put('/users/me', data),
  updatePassword: (data: any) => api.patch('/users/me/password', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateUserRole: (id: string, roleId: string) => api.patch(`/users/${id}/role`, { roleId }),
  updateUserArea: (id: string, areaId: string | null) => api.patch(`/users/${id}/area`, { areaId }),
  getTechnicians: (areaId?: string) => api.get('/users/technicians', { params: { areaId } }),
};

export const getFileUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = API_URL.replace('/api', '');
  return `${base}${path}`;
};

export const companiesApi = {
  getById: (id: string) => api.get(`/companies/${id}`),
  getStats: (id: string) => api.get(`/companies/${id}/stats`),
  update: (id: string, data: { name?: string; description?: string; information?: string }) => 
    api.patch(`/companies/${id}`, data),
  uploadLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  regenerateCode: (id: string) => api.post(`/companies/${id}/regenerate-code`),
};

export const ticketsApi = {
  getAll: (myTickets?: boolean) => api.get('/tickets', { params: { myTickets } }),
  getStats: () => api.get('/tickets/stats'),
  getById: (id: string) => api.get(`/tickets/${id}`),
  create: (data: any) => api.post('/tickets', data),
  update: (id: string, data: any) => api.put(`/tickets/${id}`, data),
  claim: (id: string) => api.put(`/tickets/${id}/claim`),
  delete: (id: string) => api.delete(`/tickets/${id}`),
};

export const commentsApi = {
  getByTicket: (ticketId: string) => api.get(`/comments/ticket/${ticketId}`),
  create: (data: { content: string; ticketId: string }) => api.post('/comments', data),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export const areasApi = {
  getAll: () => api.get('/areas'),
  create: (data: { name: string; description?: string }) => api.post('/areas', data),
  update: (id: string, data: { name: string; description?: string }) => api.put(`/areas/${id}`, data),
  delete: (id: string) => api.delete(`/areas/${id}`),
};

export const meetingsApi = {
  getByTicket: (ticketId: string) => api.get(`/meetings/ticket/${ticketId}`),
  getMyMeetings: () => api.get('/meetings/my-meetings'),
  getAgenda: () => api.get('/meetings/agenda'),
  createProposal: (data: any) => api.post('/meetings', data),
  updateStatus: (id: string, status: string) => api.put(`/meetings/${id}/status`, { status }),
  repropose: (id: string, data: any) => api.put(`/meetings/${id}/repropose`, data),
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
};

export default api;
