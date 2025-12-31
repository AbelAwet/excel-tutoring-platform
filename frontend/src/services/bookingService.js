import api from '../lib/axios';

export const bookingService = {
  // Create booking
  createBooking: async (data) => {
    return await api.post('/bookings', data);
  },

  // Get user bookings
  getUserBookings: async (params) => {
    return await api.get('/bookings', { params });
  },

  // Get booking by ID
  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  // Confirm booking (tutor)
  confirmBooking: async (id) => {
    return await api.put(`/bookings/${id}/confirm`);
  },

  // Reject booking (tutor)
  rejectBooking: async (id, reason) => {
    return await api.put(`/bookings/${id}/reject`, { reason });
  },

  // Cancel booking
  cancelBooking: async (id, reason) => {
    return await api.put(`/bookings/${id}/cancel`, { reason });
  },

  // Complete booking (tutor)
  completeBooking: async (id) => {
    return await api.put(`/bookings/${id}/complete`);
  },
};
