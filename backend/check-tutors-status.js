import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function checkTutors() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Tutor = mongoose.model('Tutor', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const tutors = await Tutor.find({});
    
    console.log(`\n📊 Total tutors: ${tutors.length}\n`);
    
    for (let i = 0; i < tutors.length; i++) {
      const tutor = tutors[i];
      const user = await User.findById(tutor.user);
      
      console.log(`Tutor ${i + 1}:`);
      console.log(`  Name: ${user?.firstName} ${user?.lastName}`);
      console.log(`  Email: ${user?.email}`);
      console.log(`  Verification Status: ${tutor.verificationStatus}`);
      console.log(`  Is Available: ${tutor.isAvailable}`);
      console.log(`  Subjects: ${tutor.subjects?.length || 0}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkTutors();
