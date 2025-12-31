import mongoose from 'mongoose';
import Message from './models/Message.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const checkMessage = async () => {
  try {
    const message = await Message.findOne();
    console.log('Message found:');
    console.log('ID:', message._id);
    console.log('Sender:', message.sender, 'Type:', typeof message.sender);
    console.log('Receiver:', message.receiver, 'Type:', typeof message.receiver);
    console.log('Conversation:', message.conversation);
    console.log('\nFull message:', JSON.stringify(message, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkMessage();
