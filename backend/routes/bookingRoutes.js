import express from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking
} from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('tutorId').notEmpty().withMessage('Tutor ID is required'),
  body('subjectId').notEmpty().withMessage('Subject ID is required'),
  body('sessionDate').isISO8601().withMessage('Valid session date is required'),
  body('startTime').notEmpty().withMessage('Start time is required'),
  body('endTime').notEmpty().withMessage('End time is required'),
  body('duration').isInt({ min: 30 }).withMessage('Duration must be at least 30 minutes')
];

// Routes
router.post('/', protect, authorize('student'), createBookingValidation, validate, createBooking);
router.get('/', protect, getUserBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/confirm', protect, authorize('tutor'), confirmBooking);
router.put('/:id/reject', protect, authorize('tutor'), rejectBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/complete', protect, authorize('tutor'), completeBooking);

export default router;
