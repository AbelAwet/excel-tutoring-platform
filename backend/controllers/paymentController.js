import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { sendPaymentNotification } from '../utils/notificationService.js';

// @desc    Submit payment (student uploads proof)
// @route   POST /api/v1/payments/submit
// @access  Private (Student)
export const submitPayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod = 'bank_transfer', referenceNumber } = req.body;

    const booking = await Booking.findById(bookingId).populate('tutor');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Booking already paid' });
    }

    // Handle proof of payment upload
    let proofOfPayment = null;
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'payment-proofs');
      proofOfPayment = {
        url: result.url,
        publicId: result.publicId,
        uploadedAt: new Date()
      };
    }

    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount,
      paymentMethod,
      referenceNumber,
      proofOfPayment,
      status: 'under_review',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    // Link payment to booking and mark as under review
    booking.payment = payment._id;
    booking.paymentStatus = 'pending';
    await booking.save();

    // Notify admins via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('admin:payment_submitted', {
        paymentId: payment._id,
        bookingId,
        amount,
        userId: req.user._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment submitted successfully. Awaiting admin approval.',
      data: { payment }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit payment' });
  }
};

// @desc    Get user payments
// @route   GET /api/v1/payments
// @access  Private
export const getUserPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const payments = await Payment.find({ user: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get payments' });
  }
};

// @desc    Get payment by ID
// @route   GET /api/v1/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: { payment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to get payment' });
  }
};

// @desc    Admin: approve payment
// @route   PUT /api/v1/payments/:id/approve
// @access  Private (Admin)
export const approvePayment = async (req, res) => {
  try {
    const { notes } = req.body;
    const payment = await Payment.findById(req.params.id).populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Payment already approved' });
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    payment.adminNotes = notes;
    await payment.save();

    // Update booking
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
      booking.confirmedAt = new Date();
      await booking.save();

      // Update tutor earnings
      const tutor = await Tutor.findById(booking.tutor);
      if (tutor) {
        tutor.totalEarnings += payment.amount;
        await tutor.save();
      }
    }

    // Notify student
    await sendPaymentNotification(payment.user, 'payment_received', {
      amount: payment.amount,
      paymentId: payment._id
    });

    const io = req.app.get('io');
    if (io) {
      io.emitToUser(payment.user.toString(), 'payment:approved', { payment, booking });
    }

    res.status(200).json({
      success: true,
      message: 'Payment approved successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to approve payment' });
  }
};

// @desc    Admin: reject payment
// @route   PUT /api/v1/payments/:id/reject
// @access  Private (Admin)
export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.status = 'failed';
    payment.failureReason = reason;
    payment.reviewedBy = req.user._id;
    payment.reviewedAt = new Date();
    await payment.save();

    // Revert booking payment status
    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'pending';
      await booking.save();
    }

    await sendPaymentNotification(payment.user, 'payment_failed', {
      amount: payment.amount,
      paymentId: payment._id,
      reason
    });

    const io = req.app.get('io');
    if (io) {
      io.emitToUser(payment.user.toString(), 'payment:rejected', { payment, reason });
    }

    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      data: { payment }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to reject payment' });
  }
};

// @desc    Admin: process refund
// @route   PUT /api/v1/payments/:id/refund
// @access  Private (Admin)
export const processRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id).populate('booking');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed payments can be refunded' });
    }

    payment.status = 'refunded';
    payment.refundAmount = payment.amount;
    payment.refundReason = reason;
    payment.refundedAt = new Date();
    payment.refundedBy = req.user._id;
    await payment.save();

    const booking = await Booking.findById(payment.booking);
    if (booking) {
      booking.paymentStatus = 'refunded';
      booking.status = 'cancelled';
      await booking.save();

      // Reverse tutor earnings
      const tutor = await Tutor.findById(booking.tutor);
      if (tutor) {
        tutor.totalEarnings = Math.max(0, tutor.totalEarnings - payment.amount);
        await tutor.save();
      }
    }

    const io = req.app.get('io');
    if (io) {
      io.emitToUser(payment.user.toString(), 'payment:refunded', { payment });
    }

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      data: { payment }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to process refund' });
  }
};
