import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPasswords() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check specific users
    const student = await User.findOne({ email: 'abelawet8580@gmail.com' });
    const tutor = await User.findOne({ email: 'abelab805@gmail.com' });
    
    console.log('\n👨‍🎓 Student:', student ? `${student.firstName} ${student.lastName} - Email verified: ${student.isEmailVerified}` : 'Not found');
    console.log('👨‍🏫 Tutor:', tutor ? `${tutor.firstName} ${tutor.lastName} - Email verified: ${tutor.isEmailVerified}` : 'Not found');
    
    // Test password for student
    if (student) {
      const isValidPassword = await student.comparePassword('password123');
      console.log('Student password "password123" valid:', isValidPassword);
    }
    
    // Test password for tutor  
    if (tutor) {
      const isValidPassword = await tutor.comparePassword('password123');
      console.log('Tutor password "password123" valid:', isValidPassword);
    }
    
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkPasswords();