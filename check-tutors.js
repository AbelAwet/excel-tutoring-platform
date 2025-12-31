#!/usr/bin/env node

// Check tutors in database for debugging
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Tutor from './backend/models/Tutor.js';
import User from './backend/models/User.js';
import Subject from './backend/models/Subject.js';

async function checkTutors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Check subjects
    const subjects = await Subject.find();
    console.log(`\n📚 Subjects in database: ${subjects.length}`);
    subjects.forEach(subject => {
      console.log(`   - ${subject.name} (${subject.category})`);
    });

    // Check all tutors
    const allTutors = await Tutor.find().populate('user', 'firstName lastName email role');
    console.log(`\n👨‍🏫 Total tutors in database: ${allTutors.length}`);
    
    if (allTutors.length > 0) {
      console.log('\nTutor Details:');
      allTutors.forEach(tutor => {
        console.log(`   - ${tutor.user.firstName} ${tutor.user.lastName} (${tutor.user.email})`);
        console.log(`     Status: ${tutor.verificationStatus}`);
        console.log(`     Available: ${tutor.isAvailable}`);
        console.log(`     Subjects: ${tutor.subjects?.length || 0}`);
        console.log('');
      });
    }

    // Check verified tutors (what students see)
    const verifiedTutors = await Tutor.find({ 
      verificationStatus: 'verified', 
      isAvailable: true 
    }).populate('user', 'firstName lastName email');
    
    console.log(`✅ Verified & Available tutors (visible to students): ${verifiedTutors.length}`);
    
    if (verifiedTutors.length > 0) {
      console.log('\nVisible to students:');
      verifiedTutors.forEach(tutor => {
        console.log(`   - ${tutor.user.firstName} ${tutor.user.lastName}`);
      });
    } else {
      console.log('\n❌ NO TUTORS VISIBLE TO STUDENTS!');
      console.log('\nReasons tutors might not be visible:');
      console.log('1. No tutors registered');
      console.log('2. Tutors not verified (status = pending)');
      console.log('3. Tutors not available (isAvailable = false)');
      console.log('4. Tutors have no subjects');
      
      if (allTutors.length > 0) {
        console.log('\n🔧 To fix: Run setup-tutors.bat to verify pending tutors');
      } else {
        console.log('\n🔧 To fix: Register as a tutor first, then run setup-tutors.bat');
      }
    }

    // Check users with tutor role
    const tutorUsers = await User.find({ role: 'tutor' });
    console.log(`\n👤 Users with tutor role: ${tutorUsers.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
checkTutors();