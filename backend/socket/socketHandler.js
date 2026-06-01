import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

const onlineUsers = new Map();

export const initializeSocket = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    socket.join(socket.userId);
    socket.broadcast.emit('user:online', { userId: socket.userId });
    socket.emit('online:users', Array.from(onlineUsers.keys()));

    socket.on('typing:start', ({ receiverId }) => {
      const rid = onlineUsers.get(receiverId);
      if (rid) {
        io.to(rid).emit('typing:start', {
          senderId: socket.userId,
          senderName: `${socket.user.firstName} ${socket.user.lastName}`
        });
      }
    });

    socket.on('typing:stop', ({ receiverId }) => {
      const rid = onlineUsers.get(receiverId);
      if (rid) io.to(rid).emit('typing:stop', { senderId: socket.userId });
    });

    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content, messageType = 'text', attachment } = data;
        const conversationId = Message.getConversationId(socket.userId, receiverId);

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
          attachment
        });

        await message.populate('sender', 'firstName lastName avatar');

        const rid = onlineUsers.get(receiverId);
        if (rid) io.to(rid).emit('message:receive', message);
        socket.emit('message:sent', message);

        io.to(receiverId).emit('notification', {
          type: 'new_message',
          message: `New message from ${socket.user.firstName} ${socket.user.lastName}`,
          data: { senderId: socket.userId }
        });
      } catch (error) {
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('message:read', async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message && message.receiver.toString() === socket.userId) {
          await message.markAsRead();
          const sid = onlineUsers.get(message.sender.toString());
          if (sid) io.to(sid).emit('message:read', { messageId, readAt: message.readAt });
        }
      } catch {
        // Non-fatal
      }
    });

    socket.on('booking:update', ({ recipientId, booking }) => {
      const rid = onlineUsers.get(recipientId);
      if (rid) io.to(rid).emit('booking:updated', booking);
    });

    socket.on('conversation:join', ({ otherUserId }) => {
      const conversationId = Message.getConversationId(socket.userId, otherUserId);
      socket.join(conversationId);
    });

    socket.on('conversation:leave', ({ otherUserId }) => {
      const conversationId = Message.getConversationId(socket.userId, otherUserId);
      socket.leave(conversationId);
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper: emit to a specific user by userId string
  io.emitToUser = (userId, event, data) => {
    const sid = onlineUsers.get(userId.toString());
    if (sid) io.to(sid).emit(event, data);
  };

  io.isUserOnline = (userId) => onlineUsers.has(userId.toString());
  io.getOnlineUsersCount = () => onlineUsers.size;
};

export { onlineUsers };
