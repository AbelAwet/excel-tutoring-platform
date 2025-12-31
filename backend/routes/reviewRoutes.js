import express from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getTutorReviews,
  updateReview,
  deleteReview,
  respondToReview,
  reportReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Validation rules
const createReviewValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').notEmpty().withMessage('Comment is required')
];

// Routes
router.post('/', protect, authorize('student'), createReviewValidation, validate, createReview);
router.get('/tutor/:tutorId', getTutorReviews);
router.put('/:id', protect, authorize('student'), updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/response', protect, authorize('tutor'), respondToReview);
router.post('/:id/report', protect, reportReview);

export default router;
