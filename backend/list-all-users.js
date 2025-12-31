import mongoose from 'mongoose';
import User from './models/User.js';

mongoose.connect('mongodb://localhost:27017/excel-tutoring');

const listUsers = async () => {
  try {
    const users = await User.find().select('_id firstName lastName email role');
    
    console.log(`Found ${users.length} users:\n`);
    
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user._id}\n`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listUsers();
