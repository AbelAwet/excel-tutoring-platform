import api from '../lib/axios';

export const reviewService = {
  // Create review
  createReview: async (data) => {
    return await api.post('/reviews', data);
  },

  // Get tutor reviews
  getTutorReviews: async (tutorId, params) => {
    return await api.get(`/reviews/tutor/${tutorId}`, { params });
  },

  // Update review
  updateReview: async (id, data) => {
    return await api.put(`/reviews/${id}`, data);
  },

  // Delete review
  deleteReview: async (id) => {
    return await api.delete(`/reviews/${id}`);
  },

  // Respond to review (tutor)
  respondToReview: async (id, comment) => {
    return await api.post(`/reviews/${id}/response`, { comment });
  },

  // Report review
  reportReview: async (id, reason) => {
    return await api.post(`/reviews/${id}/report`, { reason });
  },
};
