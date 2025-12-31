import api from '../lib/axios';

export const userService = {
  // Get user profile
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  // Update profile
  updateProfile: async (data) => {
    return await api.put('/users/profile', data);
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    return await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Change password
  changePassword: async (data) => {
    return await api.put('/users/change-password', data);
  },

  // Delete account
  deleteAccount: async () => {
    return await api.delete('/users/account');
  },

  // Get user by ID
  getUserById: async (id) => {
    return await api.get(`/users/${id}`);
  },
};
