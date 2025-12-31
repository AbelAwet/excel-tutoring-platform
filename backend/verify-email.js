import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function verifyEmail(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    console.log(`\n🔍 Looking for user: ${email}\n`);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('User found:');
    console.log(`  Name: ${user.firstName} ${user.lastName}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Email Verified: ${user.isEmailVerified}`);
    console.log(`  Active: ${user.isActive}`);
    
    if (user.isEmailVerified) {
      console.log('\n✅ Email is already verified!');
    } else {
      console.log('\n📧 Verifying email...');
      
      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.otp = undefined;
      user.otpExpires = undefined;
      
      await user.save();
      
      console.log('✅ Email verified successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Get email from command line or use default
const email = process.argv[2] || 'abelawet8580@gmail.com';
verifyEmail(email);
