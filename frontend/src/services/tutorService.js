import api from '../lib/axios';

export const tutorService = {
  // Get all tutors
  getAllTutors: async (params) => {
    return await api.get('/tutors', { params });
  },

  // Get tutor by ID
  getTutorById: async (id) => {
    return await api.get(`/tutors/${id}`);
  },

  // Apply as tutor
  applyAsTutor: async (data) => {
    return await api.post('/tutors/apply', data);
  },

  // Get my tutor profile
  getMyProfile: async () => {
    return await api.get('/tutors/me/profile');
  },

  // Update tutor profile
  updateProfile: async (data) => {
    return await api.put('/tutors/me', data);
  },

  // Upload documents
  uploadDocuments: async (formData) => {
    return await api.post('/tutors/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Get tutor stats
  getStats: async () => {
    return await api.get('/tutors/me/stats');
  },

  // Apply as tutor
  applyAsTutor: async (data) => {
    return await api.post('/tutors/apply', data);
  },
};
