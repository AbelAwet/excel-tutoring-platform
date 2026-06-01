import express from 'express';
import { body } from 'express-validator';
import {
  submitPayment,
  getUserPayments,
  getPaymentById,
  approvePayment,
  rejectPayment,
  processRefund
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

const submitPaymentValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
  body('paymentMethod')
    .isIn(['bank_transfer', 'cash', 'other'])
    .withMessage('Invalid payment method')
];

// Student routes
router.post(
  '/submit',
  protect,
  upload.single('proofOfPayment'),
  submitPaymentValidation,
  validate,
  submitPayment
);
router.get('/', protect, getUserPayments);
router.get('/:id', protect, getPaymentById);

// Admin routes
router.put('/:id/approve', protect, authorize('admin'), approvePayment);
router.put('/:id/reject', protect, authorize('admin'), rejectPayment);
router.put('/:id/refund', protect, authorize('admin'), processRefund);

export default router;
