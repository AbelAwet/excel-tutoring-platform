import api from '../lib/axios';

export const authService = {
  // Register
  register: async (data) => {
    return await api.post('/auth/register', data);
  },

  // Login
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  // Verify email
  verifyEmail: async (data) => {
    return await api.post('/auth/verify-email', data);
  },

  // Resend OTP
  resendOTP: async () => {
    return await api.post('/auth/resend-otp');
  },

  // Forgot password
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  // Reset password
  resetPassword: async (token, password) => {
    return await api.post(`/auth/reset-password/${token}`, { password });
  },

  // Logout
  logout: async () => {
    return await api.post('/auth/logout');
  },

  // Get current user
  getMe: async () => {
    return await api.get('/auth/me');
  },
};
