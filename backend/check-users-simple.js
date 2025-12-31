import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const tutors = await User.find({ role: 'tutor' }).select('firstName lastName email isEmailVerified');
    console.log(`\n👨‍🏫 Found ${tutors.length} tutors:`);
    tutors.forEach(tutor => {
      console.log(`- ${tutor.firstName} ${tutor.lastName} (${tutor.email}) - Verified: ${tutor.isEmailVerified}`);
    });
    
    const students = await User.find({ role: 'student' }).select('firstName lastName email isEmailVerified');
    console.log(`\n👨‍🎓 Found ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.firstName} ${student.lastName} (${student.email}) - Verified: ${student.isEmailVerified}`);
    });
    
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUsers();