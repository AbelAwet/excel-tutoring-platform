import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Mathematics',
      'Science',
      'Languages',
      'Computer Science',
      'Business',
      'Arts',
      'Social Studies',
      'Test Preparation',
      'Other'
    ]
  },
  icon: String,
  isActive: {
    type: Boolean,
    default: true
  },
  tutorCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Generate slug before saving
subjectSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  next();
});

// name and slug unique indexes already created by unique:true on fields above
subjectSchema.index({ category: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

export default Subject;
