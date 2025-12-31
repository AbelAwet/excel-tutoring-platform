#!/usr/bin/env node

// Check users in database for password reset debugging
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import User from './backend/models/User.js';

async function checkUsers() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('email firstName lastName passwordResetOTP passwordResetOTPExpire');
    
    console.log(`\n👥 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   📧 Email: "${user.email}"`);
      console.log(`   🔑 Reset OTP: ${user.passwordResetOTP || 'None'}`);
      console.log(`   ⏰ OTP Expiry: ${user.passwordResetOTPExpire ? new Date(user.passwordResetOTPExpire) : 'None'}`);
      console.log(`   ✅ OTP Valid: ${user.passwordResetOTPExpire > Date.now() ? 'Yes' : 'No'}`);
    });

    // Test email lookup
    console.log('\n🔍 Testing email lookups:');
    const testEmails = users.map(u => u.email);
    
    for (const email of testEmails) {
      console.log(`\nTesting: "${email}"`);
      
      const exact = await User.findOne({ email });
      const lower = await User.findOne({ email: email.toLowerCase() });
      const trimmed = await User.findOne({ email: email.trim() });
      const normalized = await User.findOne({ email: email.toLowerCase().trim() });
      
      console.log(`   Exact match: ${exact ? '✅' : '❌'}`);
      console.log(`   Lowercase: ${lower ? '✅' : '❌'}`);
      console.log(`   Trimmed: ${trimmed ? '✅' : '❌'}`);
      console.log(`   Normalized: ${normalized ? '✅' : '❌'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
checkUsers();