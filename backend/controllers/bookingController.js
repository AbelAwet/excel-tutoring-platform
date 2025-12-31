import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import Message from '../models/Message.js';
import { sendBookingNotification } from '../utils/notificationService.js';
import { sendBookingConfirmationEmail } from '../utils/emailService.js';

// @desc    Create booking
// @route   POST /api/v1/bookings
// @access  Private (Student)
export const createBooking = async (req, res) => {
  try {
    const { tutorId, subjectId, sessionDate, startTime, endTime, duration, notes } = req.body;

    // Find tutor
    const tutor = await Tutor.findById(tutorId).populate('user');
    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    // Check if tutor is verified
    if (tutor.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Tutor is not verified yet'
      });
    }

    // Find subject and price
    const tutorSubject = tutor.subjects.find(
      s => s.subject.toString() === subjectId
    );

    if (!tutorSubject) {
      return res.status(400).json({
        success: false,
        message: 'Tutor does not teach this subject'
      });
    }

    // Calculate total amount
    const totalAmount = (duration / 60) * tutorSubject.pricePerHour;

    // Create booking
    const booking = await Booking.create({
      student: req.user._id,
      tutor: tutorId,
      subject: subjectId,
      sessionDate,
      startTime,
      endTime,
      duration,
      pricePerHour: tutorSubject.pricePerHour,
      totalAmount,
      notes,
      status: 'pending'
    });

    // Populate booking
    await booking.populate([
      { path: 'student', select: 'firstName lastName email avatar' },
      { path: 'tutor' },
      { path: 'subject', select: 'name' }
    ]);

    // Send notification to tutor
    await sendBookingNotification(
      tutor.user._id,
      req.user._id,
      'booking_request',
      {
        subject: booking.subject.name,
        bookingId: booking._id
      }
    );

    // Create initial conversation message
    try {
      const conversationId = Message.getConversationId(req.user._id, tutor.user._id);
      
      // Check if conversation already exists
      const existingMessage = await Message.findOne({
        conversation: conversationId
      });

      // If no conversation exists, create a welcome message
      if (!existingMessage) {
        await Message.create({
          conversation: conversationId,
          sender: req.user._id,
          receiver: tutor.user._id,
          content: `Hi! I've booked a session with you for ${booking.subject.name}. Looking forward to learning with you!`,
          messageType: 'text'
        });
      }
    } catch (error) {
      console.error('Failed to create initial conversation:', error);
      // Don't fail the booking if conversation creation fails
    }

    // Emit socket event
    if (global.io) {
      global.io.emitToUser(tutor.user._id, 'booking:new', booking);
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/v1/bookings
// @access  Private
export const getUserBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    
    // Filter by role
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'tutor') {
      const tutor = await Tutor.findOne({ user: req.user._id });
      if (tutor) {
        query.tutor = tutor._id;
      }
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('student', 'firstName lastName email avatar')
      .populate('tutor')
      .populate('subject', 'name')
      .populate('payment')
      .sort({ sessionDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get bookings'
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/v1/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'firstName lastName email avatar phone')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'firstName lastName email avatar phone' }
      })
      .populate('subject', 'name description')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isStudent = booking.student._id.toString() === req.user._id.toString();
    const tutor = await Tutor.findOne({ _id: booking.tutor._id, user: req.user._id });
    const isTutor = !!tutor;
    const isAdmin = req.user.role === 'admin';

    if (!isStudent && !isTutor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get booking'
    });
  }
};

// @desc    Confirm booking (Tutor)
// @route   PUT /api/v1/bookings/:id/confirm
// @access  Private (Tutor)
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'firstName lastName email')
      .populate('subject', 'name');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the tutor
    const tutor = await Tutor.findOne({ _id: booking.tutor, user: req.user._id });
    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be confirmed'
      });
    }

    // For now, allow confirmation without payment (can be changed later)
    // In production, you would check: if (booking.paymentStatus !== 'paid')
    
    booking.status = 'confirmed';
    booking.confirmedAt = new Date();
    await booking.save();

    // Send notification to student
    await sendBookingNotification(
      booking.student._id,
      req.user._id,
      'booking_confirmed',
      {
        subject: booking.subject.name,
        bookingId: booking._id
      }
    );

    // Send confirmation email
    try {
      await sendBookingConfirmationEmail(booking.student.email, {
        studentName: booking.student.firstName,
        tutorName: `${req.user.firstName} ${req.user.lastName}`,
        subject: booking.subject.name,
        date: booking.sessionDate.toLocaleDateString(),
        time: `${booking.startTime} - ${booking.endTime}`,
        duration: booking.duration,
        amount: booking.totalAmount
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Emit socket event
    if (global.io) {
      global.io.emitToUser(booking.student._id, 'booking:confirmed', booking);
    }

    res.status(200).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm booking'
    });
  }
};

// @desc    Reject booking (Tutor)
// @route   PUT /api/v1/bookings/:id/reject
// @access  Private (Tutor)
export const rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the tutor
    const tutor = await Tutor.findOne({ _id: booking.tutor, user: req.user._id });
    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending bookings can be rejected'
      });
    }

    booking.status = 'rejected';
    booking.rejectedAt = new Date();
    booking.rejectionReason = reason;
    await booking.save();

    // Send notification
    await sendBookingNotification(
      booking.student,
      req.user._id,
      'booking_cancelled',
      {
        subject: booking.subject.name,
        bookingId: booking._id
      }
    );

    res.status(200).json({
      success: true,
      message: 'Booking rejected',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject booking'
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/v1/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isStudent = booking.student.toString() === req.user._id.toString();
    const tutor = await Tutor.findOne({ _id: booking.tutor, user: req.user._id });
    const isTutor = !!tutor;

    if (!isStudent && !isTutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    await booking.save();

    // Notify the other party
    const recipientId = isStudent ? booking.tutor : booking.student;
    await sendBookingNotification(
      recipientId,
      req.user._id,
      'booking_cancelled',
      {
        subject: booking.subject.name,
        bookingId: booking._id
      }
    );

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking'
    });
  }
};

// @desc    Complete booking
// @route   PUT /api/v1/bookings/:id/complete
// @access  Private (Tutor)
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the tutor
    const tutor = await Tutor.findOne({ _id: booking.tutor, user: req.user._id });
    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be completed'
      });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    await booking.save();

    // Update tutor stats
    tutor.totalSessions += 1;
    await tutor.save();

    // Send notification
    await sendBookingNotification(
      booking.student,
      req.user._id,
      'booking_completed',
      {
        subject: booking.subject.name,
        bookingId: booking._id
      }
    );

    res.status(200).json({
      success: true,
      message: 'Booking completed successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete booking'
    });
  }
};
