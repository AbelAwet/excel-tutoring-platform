import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function debugMessages() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const messages = await Message.find({});
    
    console.log(`\n📊 Total messages: ${messages.length}\n`);
    
    for (const msg of messages) {
      const sender = await User.findById(msg.sender);
      const receiver = await User.findById(msg.receiver);
      
      console.log(`Message:`);
      console.log(`  Conversation: ${msg.conversation}`);
      console.log(`  Sender ID: ${msg.sender}`);
      console.log(`  Sender exists: ${!!sender} ${sender ? `(${sender.firstName} ${sender.lastName})` : ''}`);
      console.log(`  Receiver ID: ${msg.receiver}`);
      console.log(`  Receiver exists: ${!!receiver} ${receiver ? `(${receiver.firstName} ${receiver.lastName})` : ''}`);
      console.log(`  Content: ${msg.content}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugMessages();
