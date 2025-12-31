import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const testLogin = async () => {
  try {
    const email = 'hiyabtesfay54@gmail.com';
    const password = 'password123';
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    console.log('✅ User found:', user.email);
    console.log('   Name:', user.firstName, user.lastName);
    console.log('   Role:', user.role);
    console.log('   Email verified:', user.isEmailVerified);
    console.log('   Has password:', !!user.password);
    console.log('   Password value:', user.password);
    
    if (!user.password) {
      console.log('\n❌ User has no password set!');
      process.exit(1);
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('\n🔐 Password test:');
    console.log('   Testing password: password123');
    console.log('   Match:', isMatch ? '✅ YES' : '❌ NO');
    
    if (!isMatch) {
      console.log('\n❌ Password does not match!');
      console.log('   Stored hash:', user.password.substring(0, 20) + '...');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();
