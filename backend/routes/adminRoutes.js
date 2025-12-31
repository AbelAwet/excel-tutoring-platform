import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getPendingTutors,
  verifyTutor,
  rejectTutor,
  suspendUser,
  unsuspendUser,
  getAllBookings,
  getAllPayments,
  getReportedReviews,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.put('/users/:id/unsuspend', unsuspendUser);
router.delete('/users/:id', deleteUser);

// Tutor management
router.get('/tutors/pending', getPendingTutors);
router.put('/tutors/:id/verify', verifyTutor);
router.put('/tutors/:id/reject', rejectTutor);

// Booking management
router.get('/bookings', getAllBookings);

// Payment management
router.get('/payments', getAllPayments);

// Review management
router.get('/reviews/reported', getReportedReviews);

export default router;
