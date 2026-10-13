import api from './client';

export const masterDataApi = {
  getCategories: async (includeInactive = false) => {
    const res = await api.get(`/categories?includeInactive=${includeInactive}`);
    return res.data;
  },

  createCategory: async (data) => {
    const res = await api.post('/categories', data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },

  getLocations: async (includeInactive = false) => {
    const res = await api.get(`/locations?includeInactive=${includeInactive}`);
    return res.data;
  },

  createLocation: async (data) => {
    const res = await api.post('/locations', data);
    return res.data;
  },

  updateLocation: async (id, data) => {
    const res = await api.put(`/locations/${id}`, data);
    return res.data;
  },

  deleteLocation: async (id) => {
    const res = await api.delete(`/locations/${id}`);
    return res.data;
  },
};
