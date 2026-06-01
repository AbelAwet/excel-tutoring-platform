import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'ETB',
    enum: ['ETB', 'USD']
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'other'],
    default: 'bank_transfer'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  // Student-submitted proof of payment
  proofOfPayment: {
    url: String,
    publicId: String,
    uploadedAt: Date
  },
  // Reference number student provides (bank ref, etc.)
  referenceNumber: {
    type: String,
    trim: true
  },
  // Admin review fields
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  adminNotes: String,
  // Refund fields
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  failureReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String
  },
  completedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Generate unique transaction ID
paymentSchema.pre('save', function (next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
  }
  next();
});

// Indexes — transactionId unique index is already created by unique:true in schema field
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ booking: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
