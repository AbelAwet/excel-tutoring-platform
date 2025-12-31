import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api/v1';

// Test credentials
const studentCredentials = {
  email: 'abelawet8580@gmail.com',
  password: 'password123'
};

const tutorCredentials = {
  email: 'abelab805@gmail.com', 
  password: 'password123'
};

let studentToken = '';
let tutorToken = '';
let tutorUserId = '';
let studentUserId = '';

async function testMessaging() {
  try {
    console.log('🧪 Testing Real Messaging System\n');

    // 1. Login as student
    console.log('1️⃣ Logging in as student...');
    const studentLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentCredentials)
    });
    
    const studentData = await studentLogin.json();
    if (studentData.success) {
      studentToken = studentData.data.accessToken;
      studentUserId = studentData.data.user._id;
      console.log(`✅ Student logged in: ${studentData.data.user.firstName} ${studentData.data.user.lastName}`);
    } else {
      console.log('❌ Student login failed:', studentData.message);
      return;
    }

    // 2. Login as tutor
    console.log('\n2️⃣ Logging in as tutor...');
    const tutorLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tutorCredentials)
    });
    
    const tutorData = await tutorLogin.json();
    if (tutorData.success) {
      tutorToken = tutorData.data.accessToken;
      tutorUserId = tutorData.data.user._id;
      console.log(`✅ Tutor logged in: ${tutorData.data.user.firstName} ${tutorData.data.user.lastName}`);
    } else {
      console.log('❌ Tutor login failed:', tutorData.message);
      return;
    }

    // 3. Student creates conversation with tutor
    console.log('\n3️⃣ Student creating conversation with tutor...');
    const createConv = await fetch(`${API_BASE}/messages/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({ participantId: tutorUserId })
    });
    
    const convData = await createConv.json();
    if (convData.success) {
      console.log(`✅ Conversation created: ${convData.data.conversation._id}`);
    } else {
      console.log('❌ Conversation creation failed:', convData.message);
      return;
    }

    // 4. Student sends message to tutor
    console.log('\n4️⃣ Student sending message to tutor...');
    const sendMsg = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        receiverId: tutorUserId,
        content: 'Hi! I need help with mathematics. Are you available for a tutoring session?'
      })
    });
    
    const msgData = await sendMsg.json();
    if (msgData.success) {
      console.log(`✅ Message sent: "${msgData.data.message.content}"`);
    } else {
      console.log('❌ Message sending failed:', msgData.message);
      return;
    }

    // 5. Tutor gets conversations
    console.log('\n5️⃣ Tutor checking conversations...');
    const tutorConvs = await fetch(`${API_BASE}/messages/conversations`, {
      headers: {
        'Authorization': `Bearer ${tutorToken}`
      }
    });
    
    const tutorConvsData = await tutorConvs.json();
    if (tutorConvsData.success) {
      console.log(`✅ Tutor has ${tutorConvsData.data.conversations.length} conversations`);
      tutorConvsData.data.conversations.forEach(conv => {
        console.log(`   - With: ${conv.otherUser.firstName} ${conv.otherUser.lastName}`);
        console.log(`   - Last message: "${conv.lastMessage?.content || 'No messages'}"`);
      });
    } else {
      console.log('❌ Getting tutor conversations failed:', tutorConvsData.message);
    }

    // 6. Tutor gets messages with student
    console.log('\n6️⃣ Tutor getting messages with student...');
    const tutorMsgs = await fetch(`${API_BASE}/messages/${studentUserId}`, {
      headers: {
        'Authorization': `Bearer ${tutorToken}`
      }
    });
    
    const tutorMsgsData = await tutorMsgs.json();
    if (tutorMsgsData.success) {
      console.log(`✅ Found ${tutorMsgsData.data.messages.length} messages:`);
      tutorMsgsData.data.messages.forEach(msg => {
        console.log(`   - ${msg.sender.firstName}: "${msg.content}"`);
      });
    } else {
      console.log('❌ Getting messages failed:', tutorMsgsData.message);
    }

    // 7. Tutor replies to student
    console.log('\n7️⃣ Tutor replying to student...');
    const tutorReply = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tutorToken}`
      },
      body: JSON.stringify({
        receiverId: studentUserId,
        content: 'Hello! Yes, I am available for mathematics tutoring. What specific topics do you need help with?'
      })
    });
    
    const replyData = await tutorReply.json();
    if (replyData.success) {
      console.log(`✅ Tutor replied: "${replyData.data.message.content}"`);
    } else {
      console.log('❌ Tutor reply failed:', replyData.message);
    }

    // 8. Student checks for new messages
    console.log('\n8️⃣ Student checking for new messages...');
    const studentMsgs = await fetch(`${API_BASE}/messages/${tutorUserId}`, {
      headers: {
        'Authorization': `Bearer ${studentToken}`
      }
    });
    
    const studentMsgsData = await studentMsgs.json();
    if (studentMsgsData.success) {
      console.log(`✅ Student sees ${studentMsgsData.data.messages.length} messages:`);
      studentMsgsData.data.messages.forEach(msg => {
        console.log(`   - ${msg.sender.firstName}: "${msg.content}"`);
      });
    } else {
      console.log('❌ Getting student messages failed:', studentMsgsData.message);
    }

    console.log('\n🎉 Messaging test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMessaging();