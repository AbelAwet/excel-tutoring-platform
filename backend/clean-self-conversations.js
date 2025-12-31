import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function cleanSelfConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    
    // Find messages where sender === receiver (self-conversations)
    const selfMessages = await Message.find({
      $expr: { $eq: ['$sender', '$receiver'] }
    });
    
    console.log(`\n🔍 Found ${selfMessages.length} self-conversation messages\n`);
    
    if (selfMessages.length > 0) {
      for (const msg of selfMessages) {
        console.log(`  - Deleting: "${msg.content}" (${msg.conversation})`);
      }
      
      const result = await Message.deleteMany({
        $expr: { $eq: ['$sender', '$receiver'] }
      });
      
      console.log(`\n✅ Deleted ${result.deletedCount} self-conversation messages`);
    } else {
      console.log('✅ No self-conversations found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

cleanSelfConversations();
