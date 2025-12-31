import mongoose from 'mongoose';
import Message from './models/Message.js';
import User from './models/User.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/excel-tutoring', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const checkConversations = async () => {
  try {
    console.log('Checking all messages...\n');
    
    const messages = await Message.find()
      .populate('sender', 'firstName lastName email')
      .populate('receiver', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log(`Found ${messages.length} messages:\n`);
    
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. Conversation: ${msg.conversation}`);
      console.log(`   From: ${msg.sender?.firstName} ${msg.sender?.lastName} (${msg.sender?.email})`);
      console.log(`   To: ${msg.receiver?.firstName} ${msg.receiver?.lastName} (${msg.receiver?.email})`);
      console.log(`   Content: ${msg.content}`);
      console.log(`   Type: ${msg.messageType}`);
      console.log(`   Created: ${msg.createdAt}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkConversations();
