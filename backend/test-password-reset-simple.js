import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

// Load environment variables
dotenv.config();

const testPasswordReset = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a test user
    const testUser = await User.findOne({ email: 'abel.awet22@gmail.com' });
    
    if (!testUser) {
      console.log('❌ Test user not found. Please register first.');
      return;
    }

    console.log('👤 Found test user:', testUser.email);
    console.log('🔑 Current password reset token:', testUser.passwordResetToken || 'None');
    console.log('⏰ Token expiry:', testUser.passwordResetExpire ? new Date(testUser.passwordResetExpire) : 'None');
    
    // Check if token is still valid
    if (testUser.passwordResetToken && testUser.passwordResetExpire > Date.now()) {
      console.log('✅ User has valid reset token');
    } else {
      console.log('❌ No valid reset token found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    console.log('📡 Disconnecting from MongoDB...');
    await mongoose.disconnect();
  }
};

testPasswordReset();