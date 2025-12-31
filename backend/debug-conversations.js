import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function debugConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const messages = await Message.find({}).sort({ createdAt: 1 });
    
    console.log(`\n📊 Total messages: ${messages.length}\n`);
    
    // Group by conversation
    const conversations = {};
    
    for (const msg of messages) {
      const convId = msg.conversation;
      if (!conversations[convId]) {
        conversations[convId] = [];
      }
      conversations[convId].push(msg);
    }
    
    console.log(`📊 Total unique conversations: ${Object.keys(conversations).length}\n`);
    
    for (const [convId, msgs] of Object.entries(conversations)) {
      console.log(`\n=== Conversation: ${convId} ===`);
      console.log(`Messages: ${msgs.length}`);
      
      const sender = await User.findById(msgs[0].sender);
      const receiver = await User.findById(msgs[0].receiver);
      
      console.log(`Between: ${sender?.firstName} ${sender?.lastName} (${sender?.role})`);
      console.log(`     and: ${receiver?.firstName} ${receiver?.lastName} (${receiver?.role})`);
      
      console.log('\nMessages:');
      for (const msg of msgs) {
        const msgSender = await User.findById(msg.sender);
        console.log(`  [${msg.createdAt.toLocaleString()}] ${msgSender?.firstName}: ${msg.content}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

debugConversations();
