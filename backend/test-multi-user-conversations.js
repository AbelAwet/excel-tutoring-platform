import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function testMultiUserConversations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Message = mongoose.model('Message', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log('\n=== TESTING MULTI-USER CONVERSATION ISOLATION ===\n');
    
    // Get all users
    const users = await User.find({}).select('_id firstName lastName role email');
    console.log(`📊 Total users: ${users.length}\n`);
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. ${u.firstName} ${u.lastName} (${u.role}) - ${u.email}`);
    });
    
    console.log('\n=== CONVERSATION ANALYSIS ===\n');
    
    // For each user, simulate getting their conversations
    for (const user of users) {
      console.log(`\n--- Conversations for ${user.firstName} ${user.lastName} (${user.role}) ---`);
      
      // Simulate the getConversations query
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: user._id }, { receiver: user._id }],
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
                  { $and: [{ $eq: ['$receiver', user._id] }, { $eq: ['$isRead', false] }] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);
      
      console.log(`  Found ${conversations.length} conversation(s)`);
      
      for (const conv of conversations) {
        const sender = await User.findById(conv.lastMessage.sender);
        const receiver = await User.findById(conv.lastMessage.receiver);
        
        // Check for self-conversation
        if (sender._id.toString() === receiver._id.toString()) {
          console.log(`  ⚠️  SELF-CONVERSATION DETECTED: ${conv._id}`);
        } else {
          const otherUser = sender._id.toString() === user._id.toString() ? receiver : sender;
          console.log(`  ✅ With: ${otherUser.firstName} ${otherUser.lastName} (${otherUser.role})`);
          console.log(`     Last message: "${conv.lastMessage.content.substring(0, 30)}..."`);
          console.log(`     Unread: ${conv.unreadCount}`);
        }
      }
      
      if (conversations.length === 0) {
        console.log('  No conversations yet');
      }
    }
    
    console.log('\n=== PRIVACY CHECK ===\n');
    
    // Check if any user can see conversations they shouldn't
    const allMessages = await Message.find({}).select('sender receiver conversation');
    const conversationMap = {};
    
    allMessages.forEach(msg => {
      if (!conversationMap[msg.conversation]) {
        conversationMap[msg.conversation] = {
          participants: new Set(),
          messageCount: 0
        };
      }
      conversationMap[msg.conversation].participants.add(msg.sender.toString());
      conversationMap[msg.conversation].participants.add(msg.receiver.toString());
      conversationMap[msg.conversation].messageCount++;
    });
    
    console.log('Conversation Privacy Summary:');
    for (const [convId, data] of Object.entries(conversationMap)) {
      const participants = Array.from(data.participants);
      const users = await User.find({ _id: { $in: participants } }).select('firstName lastName role');
      
      console.log(`\n  ${convId}:`);
      console.log(`    Participants: ${users.map(u => `${u.firstName} (${u.role})`).join(' ↔ ')}`);
      console.log(`    Messages: ${data.messageCount}`);
      console.log(`    Privacy: ${participants.length === 2 ? '✅ CORRECT' : '⚠️ ISSUE - More than 2 participants!'}`);
    }
    
    console.log('\n=== TEST COMPLETE ===\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testMultiUserConversations();
