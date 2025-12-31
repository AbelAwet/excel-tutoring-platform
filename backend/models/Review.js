import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  aspects: {
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    knowledge: {
      type: Number,
      min: 1,
      max: 5
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5
    },
    teaching: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportReason: String,
  tutorResponse: {
    comment: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same booking
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ tutor: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });

// Update tutor rating after review is saved
reviewSchema.post('save', async function() {
  const Tutor = mongoose.model('Tutor');
  const tutor = await Tutor.findById(this.tutor);
  if (tutor) {
    await tutor.calculateRating();
  }
});

// Update tutor rating after review is deleted
reviewSchema.post('remove', async function() {
  const Tutor = mongoose.model('Tutor');
  const tutor = await Tutor.findById(this.tutor);
  if (tutor) {
    await tutor.calculateRating();
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
