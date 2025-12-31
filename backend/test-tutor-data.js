import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function testTutorData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Tutor = mongoose.model('Tutor', new mongoose.Schema({}, { strict: false, strictPopulate: false }));
    
    // Get a tutor with populated data
    const tutor = await Tutor.findOne({ verificationStatus: 'verified' })
      .populate('user', 'firstName lastName email avatar')
      .populate('subjects.subject', 'name category');
    
    if (!tutor) {
      console.log('❌ No verified tutors found');
      return;
    }
    
    console.log('\n=== TUTOR DATA STRUCTURE ===\n');
    console.log('Tutor ID:', tutor._id);
    console.log('User:', tutor.user);
    console.log('Subjects:', JSON.stringify(tutor.subjects, null, 2));
    console.log('Verification Status:', tutor.verificationStatus);
    console.log('Is Available:', tutor.isAvailable);
    console.log('Headline:', tutor.headline);
    console.log('Description:', tutor.description);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testTutorData();
