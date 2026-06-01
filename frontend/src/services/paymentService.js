import api from '../lib/axios';

export const paymentService = {
  // Student: submit payment with optional proof upload
  submitPayment: (formData) =>
    api.post('/payments/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  getUserPayments: (params) => api.get('/payments', { params }),
  getPaymentById: (id) => api.get(`/payments/${id}`),
};
