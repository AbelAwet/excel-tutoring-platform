import api from '../lib/axios';

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getActivityLogs: (params) => api.get('/admin/activity-logs', { params }),

  // Users
  getAllUsers: (params) => api.get('/admin/users', { params }),
  suspendUser: (id, reason) => api.put(`/admin/users/${id}/suspend`, { reason }),
  unsuspendUser: (id) => api.put(`/admin/users/${id}/unsuspend`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Tutors
  getAllTutors: (params) => api.get('/admin/tutors', { params }),
  getPendingTutors: () => api.get('/admin/tutors/pending'),
  verifyTutor: (id, notes) => api.put(`/admin/tutors/${id}/verify`, { notes }),
  rejectTutor: (id, notes) => api.put(`/admin/tutors/${id}/reject`, { notes }),

  // Bookings
  getAllBookings: (params) => api.get('/admin/bookings', { params }),

  // Payments
  getAllPayments: (params) => api.get('/admin/payments', { params }),
  approvePayment: (id, notes) => api.put(`/payments/${id}/approve`, { notes }),
  rejectPayment: (id, reason) => api.put(`/payments/${id}/reject`, { reason }),
  processRefund: (id, reason) => api.put(`/payments/${id}/refund`, { reason }),

  // Reviews
  getReportedReviews: () => api.get('/admin/reviews/reported'),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  unpublishReview: (id) => api.put(`/admin/reviews/${id}/unpublish`),
  dismissReviewReport: (id) => api.put(`/admin/reviews/${id}/dismiss-report`),

  // Announcements
  sendAnnouncement: (data) => api.post('/admin/announcements', data),
};
