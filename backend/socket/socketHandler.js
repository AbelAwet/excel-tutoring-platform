import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

// Store online users
const onlineUsers = new Map();

export const initializeSocket = (io) => {
  // Make io globally accessible
  global.io = io;

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId}`);

    // Add user to online users
    onlineUsers.set(socket.userId, socket.id);

    // Join user's personal room
    socket.join(socket.userId);

    // Emit online status
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Send online users list to the connected user
    socket.emit('online:users', Array.from(onlineUsers.keys()));

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:start', {
          senderId: socket.userId,
          senderName: `${socket.user.firstName} ${socket.user.lastName}`
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:stop', {
          senderId: socket.userId
        });
      }
    });

    // Handle sending messages
    socket.on('message:send', async (data) => {
      try {
        const { receiverId, content, messageType = 'text', attachment } = data;

        // Create conversation ID
        const conversationId = Message.getConversationId(socket.userId, receiverId);

        // Save message to database
        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          receiver: receiverId,
          content,
          messageType,
          attachment
        });

        // Populate sender info
        await message.populate('sender', 'firstName lastName avatar');

        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:receive', message);
        }

        // Send confirmation to sender
        socket.emit('message:sent', message);

        // Send notification to receiver
        io.to(receiverId).emit('notification', {
          type: 'new_message',
          message: `New message from ${socket.user.firstName} ${socket.user.lastName}`,
          data: { senderId: socket.userId }
        });
      } catch (error) {
        console.error('Message send error:', error);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    // Handle message read status
    socket.on('message:read', async (data) => {
      try {
        const { messageId } = data;
        const message = await Message.findById(messageId);

        if (message && message.receiver.toString() === socket.userId) {
          await message.markAsRead();

          // Notify sender that message was read
          const senderSocketId = onlineUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:read', {
              messageId,
              readAt: message.readAt
            });
          }
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle booking updates
    socket.on('booking:update', (data) => {
      const { recipientId, booking } = data;
      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('booking:updated', booking);
      }
    });

    // Handle payment updates
    socket.on('payment:update', (data) => {
      const { userId, payment } = data;
      const userSocketId = onlineUsers.get(userId);

      if (userSocketId) {
        io.to(userSocketId).emit('payment:updated', payment);
      }
    });

    // Handle join conversation room
    socket.on('conversation:join', (data) => {
      const { otherUserId } = data;
      const conversationId = Message.getConversationId(socket.userId, otherUserId);
      socket.join(conversationId);
      console.log(`User ${socket.userId} joined conversation ${conversationId}`);
    });

    // Handle leave conversation room
    socket.on('conversation:leave', (data) => {
      const { otherUserId } = data;
      const conversationId = Message.getConversationId(socket.userId, otherUserId);
      socket.leave(conversationId);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
      
      // Remove from online users
      onlineUsers.delete(socket.userId);

      // Broadcast offline status
      socket.broadcast.emit('user:offline', { userId: socket.userId });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to emit to specific user
  io.emitToUser = (userId, event, data) => {
    const socketId = onlineUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  };

  // Helper function to check if user is online
  io.isUserOnline = (userId) => {
    return onlineUsers.has(userId.toString());
  };

  // Helper function to get online users count
  io.getOnlineUsersCount = () => {
    return onlineUsers.size;
  };

  console.log('✅ Socket.io handlers initialized');
};

export { onlineUsers };
