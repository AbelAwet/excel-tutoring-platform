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

// Static/specific routes MUST come before /:id to avoid being swallowed
router.get('/', getAllTutors);

// Protected "me" routes — registered before /:id
router.post('/apply', protect, applyAsTutor);
router.get('/me/profile', protect, getMyTutorProfile);
router.get('/me/stats', protect, authorize('tutor'), getTutorStats);
router.put('/me', protect, authorize('tutor'), updateTutorProfile);
router.post(
  '/me/documents',
  protect,
  authorize('tutor'),
  uploadLimiter,
  uploadMultiple('documents', 5),
  uploadVerificationDocuments
);

// Parameterised route last
router.get('/:id', getTutorById);

export default router;
