import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import telebirrService from '../utils/telebirrService.js';
import { sendPaymentNotification } from '../utils/notificationService.js';

// @desc    Initiate payment
// @route   POST /api/v1/payments/initiate
// @access  Private
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId, amount, paymentMethod = 'telebirr' } = req.body;

    // Validate booking
    const booking = await Booking.findById(bookingId).populate('tutor');
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      });
    }

    // Check if already paid
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Booking already paid'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      booking: bookingId,
      amount,
      paymentMethod,
      status: 'pending',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      },
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    });

    // Initiate Telebirr payment
    if (paymentMethod === 'telebirr') {
      const paymentResult = await telebirrService.initiatePayment({
        amount,
        userId: req.user._id.toString(),
        bookingId: bookingId,
        description: `Payment for tutoring session`
      });

      if (!paymentResult.success) {
        payment.status = 'failed';
        payment.failureReason = paymentResult.error;
        await payment.save();

        return res.status(400).json({
          success: false,
          message: paymentResult.error || 'Failed to initiate payment'
        });
      }

      // Update payment with Telebirr details
      payment.telebirrOrderId = paymentResult.orderId;
      payment.telebirrTransactionId = paymentResult.telebirrOrderId;
      payment.telebirrResponse = paymentResult.rawResponse;
      payment.status = 'processing';
      await payment.save();

      res.status(200).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          payment: payment,
          paymentUrl: paymentResult.paymentUrl,
          orderId: paymentResult.orderId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initiate payment'
    });
  }
};

// @desc    Telebirr payment callback
// @route   POST /api/v1/payments/telebirr/callback
// @access  Public (called by Telebirr)
export const telebirrCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    // Verify callback signature
    const verificationResult = telebirrService.verifyPaymentCallback(callbackData);

    if (!verificationResult.success) {
      console.error('Payment verification failed:', verificationResult.error);
      return res.status(400).send('FAIL');
    }

    // Find payment by order ID
    const payment = await Payment.findOne({
      telebirrOrderId: verificationResult.orderId
    }).populate('booking');

    if (!payment) {
      console.error('Payment not found for order:', verificationResult.orderId);
      return res.status(404).send('FAIL');
    }

    // Update payment status
    if (verificationResult.success && 
        (verificationResult.status === 'TRADE_SUCCESS' || 
         verificationResult.status === 'TRADE_FINISHED')) {
      
      payment.status = 'completed';
      payment.completedAt = new Date();
      payment.telebirrTransactionId = verificationResult.telebirrTransactionId;
      payment.paymentGatewayResponse = callbackData;
      await payment.save();

      // Update booking payment status
      const booking = await Booking.findById(payment.booking);
      if (booking) {
        booking.paymentStatus = 'paid';
        booking.payment = payment._id;
        booking.status = 'confirmed';
        booking.confirmedAt = new Date();
        await booking.save();

        // Update tutor earnings
        const tutor = await Tutor.findById(booking.tutor);
        if (tutor) {
          tutor.totalEarnings += payment.amount;
          await tutor.save();
        }

        // Send notifications
        await sendPaymentNotification(payment.user, 'payment_received', {
          amount: payment.amount,
          paymentId: payment._id
        });

        // Emit socket event
        if (global.io) {
          global.io.emitToUser(payment.user, 'payment:success', {
            payment,
            booking
          });
        }
      }

      return res.status(200).send('SUCCESS');
    } else {
      payment.status = 'failed';
      payment.failureReason = verificationResult.status;
      payment.paymentGatewayResponse = callbackData;
      await payment.save();

      // Send failure notification
      await sendPaymentNotification(payment.user, 'payment_failed', {
        amount: payment.amount,
        paymentId: payment._id
      });

      return res.status(200).send('SUCCESS');
    }
  } catch (error) {
    console.error('Telebirr callback error:', error);
    return res.status(500).send('FAIL');
  }
};

// @desc    Verify payment status
// @route   GET /api/v1/payments/:id/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Query Telebirr for payment status
    if (payment.paymentMethod === 'telebirr' && payment.telebirrOrderId) {
      const statusResult = await telebirrService.queryPaymentStatus(payment.telebirrOrderId);

      if (statusResult.success) {
        // Update payment status if changed
        if (statusResult.status === 'TRADE_SUCCESS' && payment.status !== 'completed') {
          payment.status = 'completed';
          payment.completedAt = new Date();
          await payment.save();

          // Update booking
          const booking = await Booking.findById(payment.booking);
          if (booking) {
            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            booking.confirmedAt = new Date();
            await booking.save();
          }
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify payment'
    });
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
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payments'
    });
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
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        payment
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get payment'
    });
  }
};

// @desc    Request refund
// @route   POST /api/v1/payments/:id/refund
// @access  Private
export const requestRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const payment = await Payment.findById(req.params.id).populate('booking');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if payment is completed
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Only completed payments can be refunded'
      });
    }

    // Check if already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    // Process refund with Telebirr
    if (payment.paymentMethod === 'telebirr') {
      const refundResult = await telebirrService.processRefund({
        orderId: payment.telebirrOrderId,
        amount: payment.amount,
        reason
      });

      if (refundResult.success) {
        payment.status = 'refunded';
        payment.refundAmount = payment.amount;
        payment.refundReason = reason;
        payment.refundedAt = new Date();
        await payment.save();

        // Update booking
        const booking = await Booking.findById(payment.booking);
        if (booking) {
          booking.paymentStatus = 'refunded';
          booking.status = 'cancelled';
          await booking.save();
        }

        res.status(200).json({
          success: true,
          message: 'Refund processed successfully',
          data: { payment }
        });
      } else {
        res.status(400).json({
          success: false,
          message: refundResult.error || 'Refund failed'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund not supported for this payment method'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process refund'
    });
  }
};
