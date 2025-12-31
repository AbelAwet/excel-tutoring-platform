#!/usr/bin/env node

// Check tutor status in database
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Tutor from './backend/models/Tutor.js';

async function checkTutorStatus() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Get all tutors with their status
    const allTutors = await Tutor.find({}).populate('user', 'firstName lastName email');

    console.log(`\n📊 Total tutors in database: ${allTutors.length}`);
    
    if (allTutors.length === 0) {
      console.log('   ❌ No tutors found in database');
    } else {
      console.log('\n📋 Tutor Status Report:');
      allTutors.forEach((tutor, index) => {
        const status = tutor.verificationStatus;
        const available = tutor.isAvailable;
        const name = `${tutor.user.firstName} ${tutor.user.lastName}`;
        
        console.log(`   ${index + 1}. ${name}`);
        console.log(`      📧 Email: ${tutor.user.email}`);
        console.log(`      ✅ Verification: ${status}`);
        console.log(`      🟢 Available: ${available}`);
        console.log(`      📚 Subjects: ${tutor.subjects.length}`);
        console.log('');
      });

      // Summary
      const verified = allTutors.filter(t => t.verificationStatus === 'verified').length;
      const available = allTutors.filter(t => t.isAvailable === true).length;
      const browsable = allTutors.filter(t => t.verificationStatus === 'verified' && t.isAvailable === true).length;

      console.log('📈 Summary:');
      console.log(`   ✅ Verified tutors: ${verified}`);
      console.log(`   🟢 Available tutors: ${available}`);
      console.log(`   👀 Browsable tutors (verified + available): ${browsable}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
checkTutorStatus();