import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const resetPasswords = async () => {
  try {
    console.log('🔐 Resetting passwords...\n');

    const student = await User.findOne({ email: 'hiyabtesfay54@gmail.com' }).select('+password');
    const tutor = await User.findOne({ email: 'abelab805@gmail.com' }).select('+password');

    if (student) {
      // Set password directly - the pre-save hook will hash it
      student.password = 'password123';
      await student.save();
      console.log('✅ Student password reset');
      console.log('   Email: hiyabtesfay54@gmail.com');
      console.log('   Password: password123');
    } else {
      console.log('❌ Student not found');
    }

    if (tutor) {
      // Set password directly - the pre-save hook will hash it
      tutor.password = 'password123';
      await tutor.save();
      console.log('\n✅ Tutor password reset');
      console.log('   Email: abelab805@gmail.com');
      console.log('   Password: password123');
    } else {
      console.log('❌ Tutor not found');
    }

    console.log('\n✅ Done! You can now login with password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetPasswords();
