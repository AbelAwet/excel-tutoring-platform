import express from 'express';
import {
  applyAsTutor,
  getAllTutors,
  getTutorById,
  getMyTutorProfile,
  updateTutorProfile,
  uploadVerificationDocuments,
  getTutorStats
} from '../controllers/tutorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { uploadMultiple } from '../middleware/uploadMiddleware.js';
import { uploadLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllTutors);
router.get('/:id', getTutorById);

// Protected routes
router.post('/apply', protect, applyAsTutor);
router.get('/me/profile', protect, getMyTutorProfile);
router.put('/me', protect, authorize('tutor'), updateTutorProfile);
router.post(
  '/me/documents',
  protect,
  authorize('tutor'),
  uploadLimiter,
  uploadMultiple('documents', 5),
  uploadVerificationDocuments
);
router.get('/me/stats', protect, authorize('tutor'), getTutorStats);

export default router;
