import api from './client';

export const complaintApi = {
  create: async (formData) => {
    const res = await api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  update: async (id, data) => {
    const res = await api.put(`/complaints/${id}`, data);
    return res.data;
  },

  getDetails: async (id) => {
    const res = await api.get(`/complaints/${id}`);
    return res.data;
  },

  getMyComplaints: async (params = {}) => {
    const res = await api.get('/complaints/my', { params });
    return res.data;
  },

  getMyHistory: async (page = 0, size = 10) => {
    const res = await api.get('/complaints/my/history', { params: { page, size } });
    return res.data;
  },

  getMyDashboard: async () => {
    const res = await api.get('/complaints/my/dashboard');
    return res.data;
  },

  getFileUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    return `${base}/files/${path}`;
  },

  // Helper to fetch protected image blobs with auth headers
  fetchImageBlobUrl: async (relativePath) => {
    if (!relativePath) return null;
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
      return relativePath;
    }
    try {
      const res = await api.get(`/files/${relativePath}`, { responseType: 'blob' });
      return URL.createObjectURL(res.data);
    } catch {
      return null;
    }
  },
};
