import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  sessionDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    min: [30, 'Duration must be at least 30 minutes']
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  meetingLink: String,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Validate session date is in the future (only on new bookings)
bookingSchema.pre('save', function (next) {
  if (this.isNew && this.sessionDate < new Date()) {
    return next(new Error('Session date must be in the future'));
  }
  next();
});

// Recalculate total amount when duration or price changes
// duration is stored in MINUTES; pricePerHour is per hour
bookingSchema.pre('save', function (next) {
  if (this.isModified('duration') || this.isModified('pricePerHour')) {
    this.totalAmount = (this.duration / 60) * this.pricePerHour;
  }
  next();
});

// Indexes
bookingSchema.index({ student: 1, sessionDate: -1 });
bookingSchema.index({ tutor: 1, sessionDate: -1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ sessionDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
