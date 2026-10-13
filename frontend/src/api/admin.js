import api from './client';

export const adminApi = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getAllComplaints: async (params = {}) => {
    const res = await api.get('/admin/complaints', { params });
    return res.data;
  },

  getEscalatedComplaints: async (params = {}) => {
    const res = await api.get('/admin/complaints/escalated', { params });
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  createUser: async (userData) => {
    const res = await api.post('/admin/users', userData);
    return res.data;
  },

  updateUser: async (id, userData) => {
    const res = await api.put(`/admin/users/${id}`, userData);
    return res.data;
  },

  getEscalationConfig: async () => {
    const res = await api.get('/admin/escalation-config');
    return res.data;
  },

  updateEscalationConfig: async (config) => {
    const res = await api.put('/admin/escalation-config', config);
    return res.data;
  },

  triggerEscalationCheck: async () => {
    const res = await api.post('/admin/escalation/run');
    return res.data;
  },
};
