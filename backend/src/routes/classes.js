import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.js';
import {
  getAllClasses,
  getClassById,
  searchClasses,
  createClass,
  updateClass,
  deleteClass,
  getAvailability,
  getClassRoster
} from '../controllers/classController.js';

const router = express.Router();

// Public routes
router.get('/', getAllClasses);
router.get('/search', searchClasses);
router.get('/:id', getClassById);

// Protected routes
router.get('/:id/availability', authMiddleware, getAvailability);
router.get('/:id/roster', authMiddleware, authorize('trainer', 'admin', 'super_admin'), getClassRoster);

// Admin only routes
router.post('/', authMiddleware, authorize('admin', 'super_admin'), createClass);
router.put('/:id', authMiddleware, authorize('admin', 'super_admin'), updateClass);
router.delete('/:id', authMiddleware, authorize('admin', 'super_admin'), deleteClass);

export default router;
