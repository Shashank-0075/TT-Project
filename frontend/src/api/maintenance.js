import api from './client';

export const maintenanceApi = {
  getDashboard: async () => {
    const res = await api.get('/maintenance/dashboard');
    return res.data;
  },

  getComplaints: async (params = {}) => {
    const res = await api.get('/maintenance/complaints', { params });
    return res.data;
  },

  updateStatus: async (complaintId, data) => {
    const res = await api.put(`/maintenance/complaints/${complaintId}/status`, data);
    return res.data;
  },

  addProgressNote: async (complaintId, data) => {
    const res = await api.post(`/maintenance/complaints/${complaintId}/progress`, data);
    return res.data;
  },

  resolve: async (complaintId, formData) => {
    const res = await api.post(`/maintenance/complaints/${complaintId}/resolve`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getResolutions: async (params = {}) => {
    const res = await api.get('/maintenance/resolutions', { params });
    return res.data;
  },
};
