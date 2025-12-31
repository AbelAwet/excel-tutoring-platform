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
    enum: ['telebirr', 'wallet', 'cash'],
    default: 'telebirr'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  telebirrTransactionId: String,
  telebirrOrderId: String,
  telebirrResponse: mongoose.Schema.Types.Mixed,
  paymentGatewayResponse: mongoose.Schema.Types.Mixed,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String,
  refundedAt: Date,
  failureReason: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    deviceInfo: String
  },
  completedAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

// Generate unique transaction ID
paymentSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ booking: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
