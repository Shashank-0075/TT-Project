import api from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  getProfile: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/users/me', data);
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.put('/users/me/password', data);
    return res.data;
  },
};
