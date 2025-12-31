import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    console.log(`\n🗑️  Found ${collections.length} collections to clear:`);
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }
    
    console.log('\n⚠️  Clearing all data...');
    
    // Drop all collections
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      console.log(`   ✅ Cleared ${collection.name}`);
    }
    
    console.log('\n🎉 Database cleared successfully!');
    console.log('You can now register new users.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

clearDatabase();
