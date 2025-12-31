import express from 'express';
import { body } from 'express-validator';
import {
  initiatePayment,
  telebirrCallback,
  verifyPayment,
  getUserPayments,
  getPaymentById,
  requestRefund
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Validation rules
const initiatePaymentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('paymentMethod').isIn(['telebirr', 'wallet']).withMessage('Invalid payment method')
];

// Routes
router.post('/initiate', protect, initiatePaymentValidation, validate, initiatePayment);
router.post('/telebirr/callback', telebirrCallback); // Public - called by Telebirr
router.get('/:id/verify', protect, verifyPayment);
router.get('/', protect, getUserPayments);
router.get('/:id', protect, getPaymentById);
router.post('/:id/refund', protect, requestRefund);

export default router;
