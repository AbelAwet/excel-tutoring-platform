import api from '../lib/axios';

export const subjectService = {
  // Get all subjects
  getAllSubjects: async (params) => {
    return await api.get('/subjects', { params });
  },

  // Get subject by ID
  getSubjectById: async (id) => {
    return await api.get(`/subjects/${id}`);
  },

  // Get categories
  getCategories: async () => {
    return await api.get('/subjects/categories/list');
  },
};
