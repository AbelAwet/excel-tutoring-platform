#!/usr/bin/env node

// Fix tutor availability for verified tutors
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Tutor from './backend/models/Tutor.js';

async function fixTutorAvailability() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find verified tutors that are not available
    const tutorsToFix = await Tutor.find({ 
      verificationStatus: 'verified',
      isAvailable: { $ne: true }
    }).populate('user', 'firstName lastName email');

    console.log(`🔍 Found ${tutorsToFix.length} verified tutor(s) that need availability fix:`);
    
    if (tutorsToFix.length === 0) {
      console.log('   ✅ All verified tutors are already available!');
    } else {
      for (const tutor of tutorsToFix) {
        console.log(`   - ${tutor.user.firstName} ${tutor.user.lastName} (${tutor.user.email})`);
      }

      // Update all verified tutors to be available
      const result = await Tutor.updateMany(
        { verificationStatus: 'verified' },
        { isAvailable: true }
      );

      console.log(`   ✅ Updated ${result.modifiedCount} tutor(s) to be available`);
    }

    // Show final status
    const availableTutors = await Tutor.find({ 
      verificationStatus: 'verified',
      isAvailable: true 
    }).populate('user', 'firstName lastName');

    console.log('\n🎉 Available Tutors:');
    if (availableTutors.length === 0) {
      console.log('   ❌ No available tutors found');
    } else {
      availableTutors.forEach(tutor => {
        console.log(`   ✅ ${tutor.user.firstName} ${tutor.user.lastName}`);
      });
    }

    console.log(`\n📊 Total available tutors: ${availableTutors.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
fixTutorAvailability();