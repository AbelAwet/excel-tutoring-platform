import mongoose from 'mongoose';
import Message from './models/Message.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const testCreateMessage = async () => {
  try {
    console.log('Creating test message...\n');
    
    const studentId = '6939a2e83f8147031048e2b1'; // hiyab
    const tutorId = '69395545e9d4c45a7295e6e9'; // abu gi
    
    const conversationId = Message.getConversationId(studentId, tutorId);
    console.log('Conversation ID:', conversationId);
    
    const message = await Message.create({
      conversation: conversationId,
      sender: studentId,
      receiver: tutorId,
      content: 'Test message from script',
      messageType: 'text',
      isRead: false
    });
    
    console.log('Message created:', message._id);
    
    // Verify it was saved
    const saved = await Message.findById(message._id);
    console.log('Message saved to DB:', !!saved);
    
    // Check all messages
    const allMessages = await Message.find();
    console.log('Total messages in DB:', allMessages.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testCreateMessage();
