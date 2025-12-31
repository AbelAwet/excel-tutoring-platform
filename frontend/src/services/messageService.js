import api from '../lib/axios';

export const messageService = {
  // Get conversations
  getConversations: async () => {
    return await api.get('/messages/conversations');
  },

  // Create or get conversation
  createConversation: async (participantId) => {
    return await api.post('/messages/conversations', { participantId });
  },

  // Get messages for a conversation
  getMessages: async (conversationId, params) => {
    return await api.get(`/messages/${conversationId}`, { params });
  },

  // Send message
  sendMessage: async (data) => {
    return await api.post('/messages', data);
  },

  // Delete message
  deleteMessage: async (id) => {
    return await api.delete(`/messages/${id}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return await api.get('/messages/unread/count');
  },
};
