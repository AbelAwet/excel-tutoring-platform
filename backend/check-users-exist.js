import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const checkUsers = async () => {
  try {
    const studentId = '6939a2e83f8147031048e2b1';
    const tutorId = '69395545e9d4c45a7295e6e9';
    
    const student = await User.findById(studentId);
    const tutor = await User.findById(tutorId);
    
    console.log('Student exists:', !!student);
    if (student) {
      console.log('Student:', student.firstName, student.lastName, student.email);
    }
    
    console.log('\nTutor exists:', !!tutor);
    if (tutor) {
      console.log('Tutor:', tutor.firstName, tutor.lastName, tutor.email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
