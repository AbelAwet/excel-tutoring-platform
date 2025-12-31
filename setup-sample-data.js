#!/usr/bin/env node

// Setup sample subjects and verify tutors for testing
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

// Import models
import Subject from './backend/models/Subject.js';
import Tutor from './backend/models/Tutor.js';
import User from './backend/models/User.js';

const sampleSubjects = [
  {
    name: 'Mathematics',
    description: 'Algebra, Calculus, Geometry, Statistics, and more',
    category: 'Mathematics',
    icon: '🔢'
  },
  {
    name: 'Physics',
    description: 'Mechanics, Thermodynamics, Electromagnetism, Quantum Physics',
    category: 'Science',
    icon: '⚛️'
  },
  {
    name: 'Chemistry',
    description: 'Organic, Inorganic, Physical Chemistry, Biochemistry',
    category: 'Science',
    icon: '🧪'
  },
  {
    name: 'Biology',
    description: 'Cell Biology, Genetics, Ecology, Human Biology',
    category: 'Science',
    icon: '🧬'
  },
  {
    name: 'English',
    description: 'Grammar, Literature, Writing, Reading Comprehension',
    category: 'Languages',
    icon: '📚'
  },
  {
    name: 'Computer Science',
    description: 'Programming, Algorithms, Data Structures, Software Development',
    category: 'Computer Science',
    icon: '💻'
  },
  {
    name: 'Economics',
    description: 'Microeconomics, Macroeconomics, Business Economics',
    category: 'Business',
    icon: '📈'
  },
  {
    name: 'History',
    description: 'World History, Local History, Historical Analysis',
    category: 'Social Studies',
    icon: '📜'
  },
  {
    name: 'Art',
    description: 'Drawing, Painting, Digital Art, Art History',
    category: 'Arts',
    icon: '🎨'
  },
  {
    name: 'SAT Preparation',
    description: 'SAT Math, SAT English, Test Strategies',
    category: 'Test Preparation',
    icon: '📝'
  }
];

async function setupSampleData() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB');

    // Add sample subjects
    console.log('📚 Setting up sample subjects...');
    
    for (const subjectData of sampleSubjects) {
      const existingSubject = await Subject.findOne({ name: subjectData.name });
      if (!existingSubject) {
        await Subject.create(subjectData);
        console.log(`   ✅ Added subject: ${subjectData.name}`);
      } else {
        console.log(`   ⏭️  Subject already exists: ${subjectData.name}`);
      }
    }

    // Auto-verify pending tutors
    console.log('\n👨‍🏫 Checking for pending tutors...');
    
    const pendingTutors = await Tutor.find({ verificationStatus: 'pending' })
      .populate('user', 'firstName lastName email');

    if (pendingTutors.length === 0) {
      console.log('   ℹ️  No pending tutors found');
    } else {
      console.log(`   🔍 Found ${pendingTutors.length} pending tutor(s):`);
      
      for (const tutor of pendingTutors) {
        console.log(`      - ${tutor.user.firstName} ${tutor.user.lastName} (${tutor.user.email})`);
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

      console.log(`   ✅ Auto-verified ${result.modifiedCount} tutor(s)`);
    }

    // Show summary
    const totalSubjects = await Subject.countDocuments();
    const totalTutors = await Tutor.countDocuments({ verificationStatus: 'verified' });
    
    console.log('\n🎉 Setup Complete!');
    console.log(`   📚 Total subjects: ${totalSubjects}`);
    console.log(`   👨‍🏫 Verified tutors: ${totalTutors}`);
    console.log('\n📱 Students can now browse and find tutors!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

// Run the script
setupSampleData();