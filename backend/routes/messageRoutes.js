import express from 'express';
import { body } from 'express-validator';
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteMessage,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { uploadSingle } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Validation rules
const sendMessageValidation = [
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
  body('content').notEmpty().withMessage('Message content is required')
];

// Routes
router.post('/conversations', protect, createConversation);
router.get('/conversations', protect, getConversations);
router.get('/unread/count', protect, getUnreadCount);
router.get('/:userId', protect, getMessages);
router.post('/', protect, uploadSingle('attachment'), sendMessageValidation, validate, sendMessage);
router.delete('/:id', protect, deleteMessage);

// Development route to create test conversation
if (process.env.NODE_ENV === 'development') {
  router.post('/test/conversation', protect, async (req, res) => {
    try {
      const { receiverId, content = 'Hello! This is a test message.' } = req.body;
      
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Receiver ID is required'
        });
      }

      const Message = (await import('../models/Message.js')).default;
      const conversationId = Message.getConversationId(req.user._id, receiverId);
      
      const message = await Message.create({
        conversation: conversationId,
        sender: req.user._id,
        receiver: receiverId,
        content,
        messageType: 'text'
      });

      await message.populate('sender', 'firstName lastName avatar');
      await message.populate('receiver', 'firstName lastName avatar');

      res.status(201).json({
        success: true,
        message: 'Test conversation created',
        data: { message }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
}

export default router;
