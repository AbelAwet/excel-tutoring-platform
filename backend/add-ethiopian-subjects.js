import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

async function addEthiopianSubjects() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/excel-tutoring');
    
    const Subject = mongoose.model('Subject', new mongoose.Schema({}, { strict: false }));
    const Tutor = mongoose.model('Tutor', new mongoose.Schema({}, { strict: false }));
    
    // Ethiopian school subjects for grades 5-12
    const subjects = [
      // Core subjects
      { name: 'Mathematics', category: 'Science', slug: 'mathematics', description: 'Math for grades 5-12' },
      { name: 'English', category: 'Language', slug: 'english', description: 'English language' },
      { name: 'Amharic', category: 'Language', slug: 'amharic', description: 'Amharic language' },
      
      // Sciences
      { name: 'Physics', category: 'Science', slug: 'physics', description: 'Physics for grades 9-12' },
      { name: 'Chemistry', category: 'Science', slug: 'chemistry', description: 'Chemistry for grades 9-12' },
      { name: 'Biology', category: 'Science', slug: 'biology', description: 'Biology for grades 9-12' },
      { name: 'General Science', category: 'Science', slug: 'general-science', description: 'Science for grades 5-8' },
      
      // Social Sciences
      { name: 'History', category: 'Social Science', slug: 'history', description: 'Ethiopian and World History' },
      { name: 'Geography', category: 'Social Science', slug: 'geography', description: 'Geography' },
      { name: 'Civics', category: 'Social Science', slug: 'civics', description: 'Civics and Ethical Education' },
      
      // Other subjects
      { name: 'Economics', category: 'Social Science', slug: 'economics', description: 'Economics for grades 11-12' },
      { name: 'Business', category: 'Business', slug: 'business', description: 'Business studies' },
      { name: 'Accounting', category: 'Business', slug: 'accounting', description: 'Accounting' },
      { name: 'ICT', category: 'Technology', slug: 'ict', description: 'Information and Communication Technology' },
      { name: 'Technical Drawing', category: 'Technology', slug: 'technical-drawing', description: 'Technical Drawing' },
    ];
    
    console.log('📚 Creating Ethiopian school subjects...\n');
    
    const createdSubjects = [];
    
    for (const subjectData of subjects) {
      const subject = await Subject.findOneAndUpdate(
        { slug: subjectData.slug },
        subjectData,
        { upsert: true, new: true }
      );
      createdSubjects.push(subject);
      console.log(`✅ ${subject.name} (${subject.category})`);
    }
    
    console.log(`\n✅ Created/Updated ${createdSubjects.length} subjects\n`);
    
    // Update all tutors with a variety of subjects
    const tutors = await Tutor.find({ verificationStatus: 'verified' });
    
    console.log(`📊 Updating ${tutors.length} tutors with subjects...\n`);
    
    for (const tutor of tutors) {
      // Assign 3-5 random subjects to each tutor
      const numSubjects = Math.floor(Math.random() * 3) + 3; // 3-5 subjects
      const shuffled = [...createdSubjects].sort(() => 0.5 - Math.random());
      const selectedSubjects = shuffled.slice(0, numSubjects);
      
      tutor.subjects = selectedSubjects.map(subject => ({
        subject: subject._id,
        level: ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)],
        pricePerHour: Math.floor(Math.random() * 200) + 100 // 100-300 ETB
      }));
      
      // Use updateOne to ensure it saves
      await Tutor.updateOne(
        { _id: tutor._id },
        { $set: { subjects: tutor.subjects } }
      );
      
      console.log(`✅ Updated tutor ${tutor._id} with ${tutor.subjects.length} subjects`);
      console.log(`   Subjects:`, tutor.subjects.map(s => s.subject.toString()).join(', '));
    }
    
    console.log('\n🎉 All subjects and tutors updated successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

addEthiopianSubjects();
