import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const findUsers = async () => {
  try {
    const student = await User.findOne({ email: 'hiyabtesfay54@gmail.com' });
    const tutor = await User.findOne({ email: 'abelab805@gmail.com' });
    
    console.log('Student:');
    if (student) {
      console.log('  ID:', student._id);
      console.log('  Name:', student.firstName, student.lastName);
      console.log('  Email:', student.email);
    } else {
      console.log('  NOT FOUND');
    }
    
    console.log('\nTutor:');
    if (tutor) {
      console.log('  ID:', tutor._id);
      console.log('  Name:', tutor.firstName, tutor.lastName);
      console.log('  Email:', tutor.email);
    } else {
      console.log('  NOT FOUND');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

findUsers();
