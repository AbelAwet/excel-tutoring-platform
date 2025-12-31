import api from '../lib/axios';

export const paymentService = {
  // Initiate payment
  initiatePayment: async (data) => {
    return await api.post('/payments/initiate', data);
  },

  // Verify payment
  verifyPayment: async (id) => {
    return await api.get(`/payments/${id}/verify`);
  },

  // Get user payments
  getUserPayments: async (params) => {
    return await api.get('/payments', { params });
  },

  // Get payment by ID
  getPaymentById: async (id) => {
    return await api.get(`/payments/${id}`);
  },

  // Request refund
  requestRefund: async (id, reason) => {
    return await api.post(`/payments/${id}/refund`, { reason });
  },
};
