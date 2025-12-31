import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function checkTutorSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const db = mongoose.connection.db;
    const tutors = await db.collection('tutors').find({ verificationStatus: 'verified' }).toArray();
    
    console.log(`\n📊 Found ${tutors.length} verified tutors\n`);
    
    for (const tutor of tutors) {
      console.log(`Tutor ID: ${tutor._id}`);
      console.log(`Subjects count: ${tutor.subjects?.length || 0}`);
      console.log(`Subjects:`, JSON.stringify(tutor.subjects, null, 2));
      console.log('---\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkTutorSubjects();
