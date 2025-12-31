import Message from '../models/Message.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// @desc    Create or get conversation
// @route   POST /api/v1/messages/conversations
// @access  Private
export const createConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const userId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    if (participantId === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create conversation with yourself'
      });
    }

    const conversationId = Message.getConversationId(userId, participantId);

    // Check if conversation already exists
    let existingMessage = await Message.findOne({
      conversation: conversationId
    }).populate('sender receiver', 'firstName lastName avatar');

    if (existingMessage) {
      console.log('Found existing conversation:', conversationId);
      console.log('Existing message sender:', existingMessage.sender);
      console.log('Existing message receiver:', existingMessage.receiver);
      
      // Make sure sender and receiver are populated
      if (!existingMessage.sender || !existingMessage.receiver) {
        console.log('Sender or receiver not populated, deleting and recreating...');
        await Message.deleteOne({ _id: existingMessage._id });
        existingMessage = null;
      } else {
        // Return existing conversation
        const otherUser = existingMessage.sender._id.toString() === userId.toString()
          ? existingMessage.receiver
          : existingMessage.sender;

        return res.status(200).json({
          success: true,
          data: {
            conversation: {
              _id: conversationId,
              otherUser,
              lastMessage: existingMessage
            }
          }
        });
      }
    }

    // Create a placeholder conversation by creating an initial system message
    console.log('Creating new system message for conversation:', conversationId);
    console.log('Sender:', userId);
    console.log('Receiver:', participantId);
    
    const systemMessage = await Message.create({
      conversation: conversationId,
      sender: userId,
      receiver: participantId,
      content: 'Conversation started',
      messageType: 'system',
      isRead: true
    });

    console.log('System message created:', systemMessage._id);
    console.log('Verifying message was saved...');
    
    const savedMessage = await Message.findById(systemMessage._id);
    console.log('Message found in DB:', !!savedMessage);

    await systemMessage.populate('sender receiver', 'firstName lastName avatar');

    const otherUser = systemMessage.receiver;

    res.status(201).json({
      success: true,
      data: {
        conversation: {
          _id: conversationId,
          otherUser,
          lastMessage: systemMessage
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create conversation'
    });
  }
};

// @desc    Get conversations
// @route   GET /api/v1/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Getting conversations for user:', userId);

    // Get all unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
          isDeleted: false
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversation',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    console.log('Aggregation returned', conversations.length, 'conversations');

    // Populate user details for each conversation
    for (const conv of conversations) {
      if (conv.lastMessage) {
        conv.lastMessage.sender = await User.findById(conv.lastMessage.sender).select('firstName lastName avatar');
        conv.lastMessage.receiver = await User.findById(conv.lastMessage.receiver).select('firstName lastName avatar');
      }
    }

    console.log('After populate:', conversations.length);
    conversations.forEach((conv, i) => {
      console.log(`Conv ${i}:`, {
        id: conv._id,
        hasSender: !!conv.lastMessage?.sender,
        hasReceiver: !!conv.lastMessage?.receiver
      });
    });

    // Format conversations and filter out self-conversations
    const formattedConversations = conversations
      .filter(conv => conv.lastMessage && conv.lastMessage.sender && conv.lastMessage.receiver)
      .filter(conv => conv.lastMessage.sender._id.toString() !== conv.lastMessage.receiver._id.toString()) // Filter self-conversations
      .map(conv => {
        const otherUser = conv.lastMessage.sender._id.toString() === userId.toString()
          ? conv.lastMessage.receiver
          : conv.lastMessage.sender;

        return {
          conversationId: conv._id,
          otherUser,
          lastMessage: conv.lastMessage,
          unreadCount: conv.unreadCount
        };
      });

    console.log('Formatted conversations:', formattedConversations.length);

    res.status(200).json({
      success: true,
      data: { conversations: formattedConversations }
    });
  } catch (error) {
    console.error('❌ Error in getConversations:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get conversations'
    });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/v1/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const conversationId = Message.getConversationId(req.user._id, userId);

    const messages = await Message.find({
      conversation: conversationId,
      deletedBy: { $ne: req.user._id }
    })
      .populate('sender', 'firstName lastName avatar')
      .populate('receiver', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      conversation: conversationId,
      deletedBy: { $ne: req.user._id }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get messages'
    });
  }
};

// @desc    Send message
// @route   POST /api/v1/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text' } = req.body;

    // Prevent self-conversations
    if (receiverId === req.user._id.toString() || receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send message to yourself'
      });
    }

    const conversationId = Message.getConversationId(req.user._id, receiverId);

    let attachment = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'messages');
      attachment = {
        url: result.url,
        publicId: result.publicId,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      };
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.user._id,
      receiver: receiverId,
      content,
      messageType,
      attachment
    });

    await message.populate('sender', 'firstName lastName avatar');
    await message.populate('receiver', 'firstName lastName avatar');

    // Emit socket event
    if (global.io) {
      global.io.emitToUser(receiverId, 'message:receive', message);
    }

    res.status(201).json({
      success: true,
      data: { message }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/v1/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is sender or receiver
    if (
      message.sender.toString() !== req.user._id.toString() &&
      message.receiver.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Add user to deletedBy array
    if (!message.deletedBy.includes(req.user._id)) {
      message.deletedBy.push(req.user._id);
    }

    // If both users deleted, mark as deleted
    if (message.deletedBy.length === 2) {
      message.isDeleted = true;
    }

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete message'
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/v1/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get unread count'
    });
  }
};
