import User from '../models/User.js';
import Tutor from '../models/Tutor.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Review from '../models/Review.js';
import ActivityLog from '../models/ActivityLog.js';
import { sendTutorVerificationNotification } from '../utils/notificationService.js';

// @desc    Get dashboard stats
// @route   GET /api/v1/admin/stats
// @access  Private (Admin)
export const getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTutors = await Tutor.countDocuments();
    const pendingTutors = await Tutor.countDocuments({ verificationStatus: 'pending' });

    // Booking stats
    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });

    // Payment stats
    const paymentStats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          completedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          failedPayments: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Recent activity
    const recentActivity = await ActivityLog.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          tutors: totalTutors,
          pendingTutors
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings
        },
        payments: paymentStats[0] || {
          totalRevenue: 0,
          completedPayments: 0,
          failedPayments: 0
        },
        monthlyRevenue,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get dashboard stats'
    });
  }
};

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private (Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
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
      message: error.message || 'Failed to get users'
    });
  }
};

// @desc    Get pending tutor applications
// @route   GET /api/v1/admin/tutors/pending
// @access  Private (Admin)
export const getPendingTutors = async (req, res) => {
  try {
    const tutors = await Tutor.find({ verificationStatus: 'pending' })
      .populate('user', 'firstName lastName email avatar phone')
      .populate('subjects.subject', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { tutors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get pending tutors'
    });
  }
};

// @desc    Verify tutor
// @route   PUT /api/v1/admin/tutors/:id/verify
// @access  Private (Admin)
export const verifyTutor = async (req, res) => {
  try {
    const { notes } = req.body;
    const tutor = await Tutor.findById(req.params.id).populate('user');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    tutor.verificationStatus = 'verified';
    tutor.verifiedAt = new Date();
    tutor.verifiedBy = req.user._id;
    tutor.verificationNotes = notes;
    await tutor.save();

    // Send notification
    await sendTutorVerificationNotification(tutor.user._id, 'verified', notes);

    res.status(200).json({
      success: true,
      message: 'Tutor verified successfully',
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify tutor'
    });
  }
};

// @desc    Reject tutor
// @route   PUT /api/v1/admin/tutors/:id/reject
// @access  Private (Admin)
export const rejectTutor = async (req, res) => {
  try {
    const { notes } = req.body;
    const tutor = await Tutor.findById(req.params.id).populate('user');

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found'
      });
    }

    tutor.verificationStatus = 'rejected';
    tutor.verificationNotes = notes;
    await tutor.save();

    // Send notification
    await sendTutorVerificationNotification(tutor.user._id, 'rejected', notes);

    res.status(200).json({
      success: true,
      message: 'Tutor application rejected',
      data: { tutor }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reject tutor'
    });
  }
};

// @desc    Suspend user
// @route   PUT /api/v1/admin/users/:id/suspend
// @access  Private (Admin)
export const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = true;
    user.suspensionReason = reason;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User suspended successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to suspend user'
    });
  }
};

// @desc    Unsuspend user
// @route   PUT /api/v1/admin/users/:id/unsuspend
// @access  Private (Admin)
export const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isSuspended = false;
    user.suspensionReason = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unsuspended successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsuspend user'
    });
  }
};

// @desc    Get all bookings
// @route   GET /api/v1/admin/bookings
// @access  Private (Admin)
export const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('student', 'firstName lastName email')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .populate('subject', 'name')
      .populate('payment')
      .sort({ createdAt: -1 })
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

// @desc    Get all payments
// @route   GET /api/v1/admin/payments
// @access  Private (Admin)
export const getAllPayments = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('booking')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payments,
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
      message: error.message || 'Failed to get payments'
    });
  }
};

// @desc    Get reported reviews
// @route   GET /api/v1/admin/reviews/reported
// @access  Private (Admin)
export const getReportedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isReported: true })
      .populate('student', 'firstName lastName email')
      .populate({
        path: 'tutor',
        populate: { path: 'user', select: 'firstName lastName email' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get reported reviews'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete user'
    });
  }
};
