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
    communication: { type: Number, min: 1, max: 5 },
    knowledge: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
    teaching: { type: Number, min: 1, max: 5 }
  },
  isPublished: { type: Boolean, default: true },
  isReported: { type: Boolean, default: false },
  reportReason: String,
  tutorResponse: {
    comment: String,
    respondedAt: Date
  }
}, { timestamps: true });

// booking field already has unique: true in schema — no need for explicit index
// reviewSchema.index({ booking: 1 }, { unique: true }); — removed duplicate
reviewSchema.index({ tutor: 1, createdAt: -1 });
reviewSchema.index({ student: 1 });

// Recalculate tutor rating after save
reviewSchema.post('save', async function () {
  const Tutor = mongoose.model('Tutor');
  const tutor = await Tutor.findById(this.tutor);
  if (tutor) await tutor.calculateRating();
});

// Recalculate tutor rating after deleteOne
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  const Tutor = mongoose.model('Tutor');
  const tutor = await Tutor.findById(this.tutor);
  if (tutor) await tutor.calculateRating();
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
