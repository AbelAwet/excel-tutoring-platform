#!/usr/bin/env node

// Debug tutors API
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Tutor from './backend/models/Tutor.js';
import Subject from './backend/models/Subject.js';

async function debugTutors() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    console.log('\n🔍 DEBUGGING TUTORS API...\n');

    // 1. Check all tutors
    const allTutors = await Tutor.find({});
    console.log(`1️⃣ Total tutors in database: ${allTutors.length}`);

    // 2. Check verified tutors
    const verifiedTutors = await Tutor.find({ verificationStatus: 'verified' });
    console.log(`2️⃣ Verified tutors: ${verifiedTutors.length}`);

    // 3. Check available tutors
    const availableTutors = await Tutor.find({ isAvailable: true });
    console.log(`3️⃣ Available tutors: ${availableTutors.length}`);

    // 4. Check tutors that should be browsable (verified + available)
    const browsableTutors = await Tutor.find({ 
      verificationStatus: 'verified', 
      isAvailable: true 
    });
    console.log(`4️⃣ Browsable tutors (verified + available): ${browsableTutors.length}`);

    // 5. Test the exact query from getAllTutors
    const query = { verificationStatus: 'verified', isAvailable: true };
    const apiTutors = await Tutor.find(query)
      .populate('user', 'firstName lastName avatar email')
      .populate('subjects.subject', 'name category');
    
    console.log(`5️⃣ API query result: ${apiTutors.length} tutors`);

    if (apiTutors.length > 0) {
      console.log('\n📋 Browsable Tutors Details:');
      apiTutors.forEach((tutor, index) => {
        console.log(`\n   ${index + 1}. ${tutor.user.firstName} ${tutor.user.lastName}`);
        console.log(`      📧 Email: ${tutor.user.email}`);
        console.log(`      📚 Subjects: ${tutor.subjects.length}`);
        tutor.subjects.forEach(sub => {
          console.log(`         - ${sub.subject?.name || 'Unknown'} (${sub.level}) - ${sub.pricePerHour} ETB/hr`);
        });
        console.log(`      ⭐ Rating: ${tutor.rating.average}/5 (${tutor.rating.count} reviews)`);
        console.log(`      💰 Total Earnings: ${tutor.totalEarnings} ETB`);
      });
    }

    // 6. Check subjects
    const allSubjects = await Subject.find({});
    console.log(`\n6️⃣ Total subjects in database: ${allSubjects.length}`);
    if (allSubjects.length > 0) {
      console.log('   📚 Available subjects:');
      allSubjects.forEach(subject => {
        console.log(`      - ${subject.name} (${subject.category})`);
      });
    }

    // 7. Test API response format
    console.log('\n7️⃣ API Response Format Test:');
    const apiResponse = {
      success: true,
      data: {
        tutors: apiTutors,
        pagination: {
          page: 1,
          limit: 12,
          total: apiTutors.length,
          pages: Math.ceil(apiTutors.length / 12)
        }
      }
    };
    
    console.log(`   ✅ Response structure: ${JSON.stringify(apiResponse, null, 2).substring(0, 200)}...`);
    console.log(`   📊 Tutors in response: ${apiResponse.data.tutors.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
debugTutors();