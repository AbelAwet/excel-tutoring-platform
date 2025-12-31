import express from 'express';
import { body } from 'express-validator';
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getCategories
} from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Validation rules
const subjectValidation = [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', getAllSubjects);
router.get('/categories/list', getCategories);
router.get('/:id', getSubjectById);

// Admin routes
router.post('/', protect, authorize('admin'), subjectValidation, validate, createSubject);
router.put('/:id', protect, authorize('admin'), updateSubject);
router.delete('/:id', protect, authorize('admin'), deleteSubject);

export default router;
