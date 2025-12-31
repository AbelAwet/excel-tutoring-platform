import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Tutor from './models/Tutor.js';
import User from './models/User.js';
import Subject from './models/Subject.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const checkTutorProfile = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tutor';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all tutors
    const tutors = await Tutor.find()
      .populate('user', 'firstName lastName email')
      .populate('subjects.subject', 'name category');

    console.log(`\nFound ${tutors.length} tutors\n`);

    tutors.forEach((tutor, index) => {
      console.log(`\n=== Tutor ${index + 1} ===`);
      console.log('ID:', tutor._id);
      console.log('User:', tutor.user?.firstName, tutor.user?.lastName);
      console.log('Email:', tutor.user?.email);
      console.log('Verification Status:', tutor.verificationStatus);
      console.log('Available:', tutor.isAvailable);
      console.log('Rating:', tutor.rating);
      console.log('\nSubjects:');
      
      if (tutor.subjects && tutor.subjects.length > 0) {
        tutor.subjects.forEach((sub, i) => {
          console.log(`  ${i + 1}. Subject ID:`, sub.subject?._id || sub.subject);
          console.log(`     Subject Name:`, sub.subject?.name || 'NOT POPULATED');
          console.log(`     Price:`, sub.pricePerHour, 'ETB/hr');
          console.log(`     Level:`, sub.level);
        });
      } else {
        console.log('  No subjects');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkTutorProfile();
