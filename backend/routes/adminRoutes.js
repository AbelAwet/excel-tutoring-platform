import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  getAllUsers,
  getAllTutors,
  getPendingTutors,
  verifyTutor,
  rejectTutor,
  suspendUser,
  unsuspendUser,
  deleteUser,
  getAllBookings,
  getAllPayments,
  getReportedReviews,
  deleteReview,
  unpublishReview,
  dismissReviewReport,
  sendAnnouncement,
  getActivityLogs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/activity-logs', getActivityLogs);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);

// Tutor management
router.get('/tutors', getAllTutors);
router.get('/tutors/pending', getPendingTutors);
router.put('/tutors/:id/verify', verifyTutor);
router.put('/tutors/:id/reject', rejectTutor);

// Booking management
router.get('/bookings', getAllBookings);

// Payment management
router.get('/payments', getAllPayments);

// Review management
router.get('/reviews/reported', getReportedReviews);
router.delete('/reviews/:id', deleteReview);
router.put('/reviews/:id/unpublish', unpublishReview);
router.put('/reviews/:id/dismiss-report', dismissReviewReport);

// Announcements
router.post(
  '/announcements',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('targetRole').optional().isIn(['all', 'student', 'tutor']).withMessage('Invalid target role')
  ],
  validate,
  sendAnnouncement
);

export default router;
