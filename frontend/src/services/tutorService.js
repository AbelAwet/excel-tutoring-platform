import api from '../lib/axios';

export const tutorService = {
  getAllTutors: (params) => api.get('/tutors', { params }),
  getTutorById: (id) => api.get(`/tutors/${id}`),
  applyAsTutor: (data) => api.post('/tutors/apply', data),
  getMyProfile: () => api.get('/tutors/me/profile'),
  updateProfile: (data) => api.put('/tutors/me', data),
  uploadDocuments: (formData) =>
    api.post('/tutors/me/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getStats: () => api.get('/tutors/me/stats'),
};
