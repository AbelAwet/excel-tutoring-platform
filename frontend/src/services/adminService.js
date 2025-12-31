import api from '../lib/axios';

export const adminService = {
  // Get dashboard stats
  getDashboardStats: async () => {
    return await api.get('/admin/stats');
  },

  // Get all users
  getAllUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },

  // Get pending tutors
  getPendingTutors: async () => {
    return await api.get('/admin/tutors/pending');
  },

  // Verify tutor
  verifyTutor: async (id, notes) => {
    return await api.put(`/admin/tutors/${id}/verify`, { notes });
  },

  // Reject tutor
  rejectTutor: async (id, notes) => {
    return await api.put(`/admin/tutors/${id}/reject`, { notes });
  },

  // Suspend user
  suspendUser: async (id, reason) => {
    return await api.put(`/admin/users/${id}/suspend`, { reason });
  },

  // Unsuspend user
  unsuspendUser: async (id) => {
    return await api.put(`/admin/users/${id}/unsuspend`);
  },

  // Get all bookings
  getAllBookings: async (params) => {
    return await api.get('/admin/bookings', { params });
  },

  // Get all payments
  getAllPayments: async (params) => {
    return await api.get('/admin/payments', { params });
  },

  // Get reported reviews
  getReportedReviews: async () => {
    return await api.get('/admin/reviews/reported');
  },

  // Delete user
  deleteUser: async (id) => {
    return await api.delete(`/admin/users/${id}`);
  },
};
