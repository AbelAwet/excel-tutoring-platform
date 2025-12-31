import api from '../lib/axios';

export const notificationService = {
  // Get notifications
  getNotifications: async (params) => {
    return await api.get('/notifications', { params });
  },

  // Mark as read
  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  // Mark all as read
  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return await api.get('/notifications/unread/count');
  },
};
