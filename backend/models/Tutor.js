import mongoose from 'mongoose';

const tutorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }],
  education: [{
    degree: {
      type: String,
      required: true
    },
    institution: {
      type: String,
      required: true
    },
    fieldOfStudy: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  experience: [{
    title: String,
    company: String,
    description: String,
    startDate: Date,
    endDate: Date,
    current: {
      type: Boolean,
      default: false
    }
  }],
  certifications: [{
    name: String,
    issuingOrganization: String,
    issueDate: Date,
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    document: {
      url: String,
      publicId: String
    }
  }],
  languages: [{
    language: String,
    proficiency: {
      type: String,
      enum: ['basic', 'conversational', 'fluent', 'native']
    }
  }],
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      startTime: String,
      endTime: String,
      isBooked: {
        type: Boolean,
        default: false
      }
    }]
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verificationDocuments: [{
    type: {
      type: String,
      enum: ['id', 'degree', 'certificate', 'other']
    },
    url: String,
    publicId: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationNotes: String,
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  headline: {
    type: String,
    maxlength: [100, 'Headline cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  videoIntroduction: {
    url: String,
    publicId: String
  },
  teachingStyle: String,
  responseTime: {
    type: Number,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    branchName: String
  }
}, {
  timestamps: true
});

// Calculate average rating
tutorSchema.methods.calculateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { tutor: this._id } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating.average = Math.round(stats[0].averageRating * 10) / 10;
    this.rating.count = stats[0].totalReviews;
  } else {
    this.rating.average = 0;
    this.rating.count = 0;
  }

  await this.save();
};

// Indexes
tutorSchema.index({ user: 1 });
tutorSchema.index({ 'subjects.subject': 1 });
tutorSchema.index({ verificationStatus: 1 });
tutorSchema.index({ 'rating.average': -1 });
tutorSchema.index({ isAvailable: 1 });

const Tutor = mongoose.model('Tutor', tutorSchema);

export default Tutor;
