#!/usr/bin/env node

// Development helper to auto-verify tutors for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Tutor from './backend/models/Tutor.js';
import User from './backend/models/User.js';

async function autoVerifyTutors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Find all pending tutors
    const pendingTutors = await Tutor.find({ verificationStatus: 'pending' })
      .populate('user', 'firstName lastName email');

    if (pendingTutors.length === 0) {
      console.log('✅ No pending tutors found');
      return;
    }

    console.log(`🔍 Found ${pendingTutors.length} pending tutor(s):`);
    
    for (const tutor of pendingTutors) {
      console.log(`   - ${tutor.user.firstName} ${tutor.user.lastName} (${tutor.user.email})`);
    }

    // Auto-verify all pending tutors
    const result = await Tutor.updateMany(
      { verificationStatus: 'pending' },
      { 
        verificationStatus: 'verified',
        verifiedAt: new Date(),
        verificationNotes: 'Auto-verified for development testing',
        isAvailable: true
      }
    );

    console.log(`✅ Auto-verified ${result.modifiedCount} tutor(s)`);
    console.log('🎉 Tutors are now visible to students!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
autoVerifyTutors();