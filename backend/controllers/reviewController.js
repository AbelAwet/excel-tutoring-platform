import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import Tutor from '../models/Tutor.js';
import { sendReviewNotification } from '../utils/notificationService.js';

// @desc    Create review
// @route   POST /api/v1/reviews
// @access  Private (Student)
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment, aspects } = req.body;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is the student
    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    // Create review
    const review = await Review.create({
      student: req.user._id,
      tutor: booking.tutor,
      booking: bookingId,
      rating,
      comment,
      aspects
    });

    await review.populate([
      { path: 'student', select: 'firstName lastName avatar' },
      { path: 'tutor' }
    ]);

    // Send notification to tutor
    const tutor = await Tutor.findById(booking.tutor).populate('user');
    if (tutor) {
      await sendReviewNotification(
        tutor.user._id,
        req.user._id,
        `${req.user.firstName} ${req.user.lastName}`,
        rating
      );
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create review'
    });
  }
};

// @desc    Get tutor reviews
// @route   GET /api/v1/reviews/tutor/:tutorId
// @access  Public
export const getTutorReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      tutor: req.params.tutorId,
      isPublished: true
    })
      .populate('student', 'firstName lastName avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({
      tutor: req.params.tutorId,
      isPublished: true
    });

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { tutor: req.params.tutorId, isPublished: true } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        ratingDistribution,
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
      message: error.message || 'Failed to get reviews'
    });
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private (Student)
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the reviewer
    if (review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { rating, comment, aspects } = req.body;

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    if (aspects) review.aspects = aspects;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review'
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private (Student/Admin)
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (
      review.student.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete review'
    });
  }
};

// @desc    Tutor response to review
// @route   POST /api/v1/reviews/:id/response
// @access  Private (Tutor)
export const respondToReview = async (req, res) => {
  try {
    const { comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user is the tutor
    const tutor = await Tutor.findOne({ _id: review.tutor, user: req.user._id });
    if (!tutor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    review.tutorResponse = {
      comment,
      respondedAt: new Date()
    };

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: { review }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to review'
    });
  }
};

// @desc    Report review
// @route   POST /api/v1/reviews/:id/report
// @access  Private
export const reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.isReported = true;
    review.reportReason = reason;
    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to report review'
    });
  }
};
