import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      if (import.meta.env.DEV) console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      if (import.meta.env.DEV) console.log('Socket disconnected');
    });

    this.socket.on('connect_error', () => {
      // Silent in production — reconnection is automatic
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  on(event, callback) {
    if (!this.socket) return;

    this.socket.on(event, callback);
    
    // Store listener for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.socket) return;

    this.socket.off(event, callback);

    // Remove from stored listeners
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  // Message events
  sendMessage(data) {
    this.emit('message:send', data);
  }

  onMessageReceive(callback) {
    this.on('message:receive', callback);
  }

  onMessageSent(callback) {
    this.on('message:sent', callback);
  }

  onMessageRead(callback) {
    this.on('message:read', callback);
  }

  // Typing events
  startTyping(receiverId) {
    this.emit('typing:start', { receiverId });
  }

  stopTyping(receiverId) {
    this.emit('typing:stop', { receiverId });
  }

  onTypingStart(callback) {
    this.on('typing:start', callback);
  }

  onTypingStop(callback) {
    this.on('typing:stop', callback);
  }

  // Notification events
  onNotification(callback) {
    this.on('notification', callback);
  }

  // Booking events
  onBookingUpdate(callback) {
    this.on('booking:updated', callback);
  }

  onNewBooking(callback) {
    this.on('booking:new', callback);
  }

  onBookingConfirmed(callback) {
    this.on('booking:confirmed', callback);
  }

  // Payment events
  onPaymentUpdate(callback) {
    this.on('payment:updated', callback);
  }

  onPaymentSuccess(callback) {
    this.on('payment:success', callback);
  }

  // User status events
  onUserOnline(callback) {
    this.on('user:online', callback);
  }

  onUserOffline(callback) {
    this.on('user:offline', callback);
  }

  onOnlineUsers(callback) {
    this.on('online:users', callback);
  }

  // Conversation events
  joinConversation(otherUserId) {
    this.emit('conversation:join', { otherUserId });
  }

  leaveConversation(otherUserId) {
    this.emit('conversation:leave', { otherUserId });
  }

  // Mark message as read
  markMessageAsRead(messageId) {
    this.emit('message:read', { messageId });
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export default new SocketService();
