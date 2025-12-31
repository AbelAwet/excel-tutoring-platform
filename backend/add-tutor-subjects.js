import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function addTutorSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Tutor = mongoose.model('Tutor', new mongoose.Schema({}, { strict: false }));
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
    
    // Find or create subjects
    const mathSubject = await Subject.findOneAndUpdate(
      { name: 'Mathematics' },
      { 
        name: 'Mathematics', 
        category: 'Science', 
        description: 'Math tutoring',
        slug: 'mathematics'
      },
      { upsert: true, new: true }
    );
    
    const englishSubject = await Subject.findOneAndUpdate(
      { name: 'English' },
      { 
        name: 'English', 
        category: 'Language', 
        description: 'English tutoring',
        slug: 'english'
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Subjects created/found');
    console.log('  - Mathematics:', mathSubject._id);
    console.log('  - English:', englishSubject._id);
    
    // Update all verified tutors with subjects
    const tutors = await Tutor.find({ verificationStatus: 'verified' });
    
    console.log(`\n📊 Found ${tutors.length} verified tutors\n`);
    
    for (const tutor of tutors) {
      if (!tutor.subjects || tutor.subjects.length === 0) {
        tutor.subjects = [
          {
            subject: mathSubject._id,
            level: 'intermediate',
            pricePerHour: 200
          },
          {
            subject: englishSubject._id,
            level: 'beginner',
            pricePerHour: 150
          }
        ];
        
        await tutor.save();
        console.log(`✅ Added subjects to tutor: ${tutor._id}`);
      } else {
        console.log(`⏭️  Tutor ${tutor._id} already has subjects`);
      }
    }
    
    console.log('\n✅ All tutors updated!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addTutorSubjects();
