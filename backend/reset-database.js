import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    console.log('✅ Connected to MongoDB');

    // Drop the entire database
    await mongoose.connection.dropDatabase();
    console.log('🗑️  Database dropped completely');
    
    console.log('✅ Database reset successful!');
    console.log('The database will be recreated automatically when you register a new user.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

resetDatabase();
