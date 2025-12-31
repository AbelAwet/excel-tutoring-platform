import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Tutor from './models/Tutor.js';
import Subject from './models/Subject.js';
import Message from './models/Message.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const setupMessagingTest = async () => {
  try {
    console.log('🚀 Setting up messaging test data...\n');

    // 1. Create Subject
    console.log('1. Creating subject...');
    let mathSubject = await Subject.findOne({ name: 'Mathematics' });
    if (!mathSubject) {
      mathSubject = await Subject.create({
        name: 'Mathematics',
        slug: 'mathematics',
        category: 'Science',
        description: 'Math tutoring',
        isActive: true
      });
    }
    console.log('✅ Subject created:', mathSubject.name);

    // 2. Create or get Student
    console.log('\n2. Creating student...');
    let student = await User.findOne({ email: 'hiyabtesfay54@gmail.com' });
    if (!student) {
      const studentPassword = await bcrypt.hash('password123', 10);
      student = await User.create({
        firstName: 'Hiyab',
        lastName: 'Tesfay',
        email: 'hiyabtesfay54@gmail.com',
        password: studentPassword,
        phone: '0983048580',
        role: 'student',
        isEmailVerified: true,
        avatar: {
          url: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
        }
      });
      console.log('✅ Student created:', student.email);
    } else {
      console.log('✅ Student already exists:', student.email);
    }
    console.log('   ID:', student._id);
    console.log('   Password: password123');

    // 3. Create or get Tutor User
    console.log('\n3. Creating tutor user...');
    let tutorUser = await User.findOne({ email: 'abelab805@gmail.com' });
    if (!tutorUser) {
      const tutorPassword = await bcrypt.hash('password123', 10);
      tutorUser = await User.create({
        firstName: 'Abu',
        lastName: 'Gi',
        email: 'abelab805@gmail.com',
        password: tutorPassword,
        phone: '0912345678',
        role: 'tutor',
        isEmailVerified: true,
        avatar: {
          url: 'https://res.cloudinary.com/demo/image/upload/avatar-default.png'
        }
      });
      console.log('✅ Tutor user created:', tutorUser.email);
    } else {
      console.log('✅ Tutor user already exists:', tutorUser.email);
    }
    console.log('   ID:', tutorUser._id);
    console.log('   Password: password123');

    // 4. Create or get Tutor Profile
    console.log('\n4. Creating tutor profile...');
    let tutor = await Tutor.findOne({ user: tutorUser._id });
    if (!tutor) {
      tutor = await Tutor.create({
      user: tutorUser._id,
      headline: 'Expert Math Tutor',
      description: 'I help students excel in mathematics',
      subjects: [{
        subject: mathSubject._id,
        level: 'intermediate',
        pricePerHour: 500
      }],
      education: [{
        degree: 'Bachelor of Science',
        institution: 'Addis Ababa University',
        fieldOfStudy: 'Mathematics',
        startDate: new Date('2015-01-01'),
        endDate: new Date('2019-01-01')
      }],
      availability: {
        monday: [{ start: '09:00', end: '17:00' }],
        tuesday: [{ start: '09:00', end: '17:00' }],
        wednesday: [{ start: '09:00', end: '17:00' }],
        thursday: [{ start: '09:00', end: '17:00' }],
        friday: [{ start: '09:00', end: '17:00' }]
      },
      isAvailable: true,
      isVerified: true,
      verificationStatus: 'verified'
      });
      console.log('✅ Tutor profile created');
    } else {
      console.log('✅ Tutor profile already exists');
    }
    console.log('   Profile ID:', tutor._id);

    // 5. Create test conversation
    console.log('\n5. Creating test conversation...');
    const conversationId = Message.getConversationId(student._id, tutorUser._id);
    
    const message = await Message.create({
      conversation: conversationId,
      sender: student._id,
      receiver: tutorUser._id,
      content: 'Hi! I need help with calculus. Are you available this week?',
      messageType: 'text',
      isRead: false
    });
    console.log('✅ Test message created');
    console.log('   Conversation ID:', conversationId);

    console.log('\n✅ Setup complete!');
    console.log('\n📝 Login credentials:');
    console.log('   Student: hiyabtesfay54@gmail.com / password123');
    console.log('   Tutor: abelab805@gmail.com / password123');
    console.log('\n🎯 Next steps:');
    console.log('   1. Login as student');
    console.log('   2. Go to Messages page');
    console.log('   3. Click Refresh button');
    console.log('   4. You should see conversation with Abu Gi');
    console.log('   5. Click on it to start chatting!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setupMessagingTest();
