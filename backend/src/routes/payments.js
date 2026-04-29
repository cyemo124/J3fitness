import express from 'express';
import { authMiddleware, authorize } from '../middleware/auth.js';
import {
  initializePayment,
  verifyPayment,
  getPaymentHistory,
  getAllPayments,
  generateInvoice,
  processRefund
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes
router.post('/initialize', authMiddleware, initializePayment);
router.get('/verify/:reference', authMiddleware, verifyPayment);
router.get('/history', authMiddleware, getPaymentHistory);
router.post('/invoice/:id', authMiddleware, generateInvoice);

// Admin routes
router.get('/admin/all', authMiddleware, authorize('admin'), getAllPayments);
router.post('/admin/refund', authMiddleware, authorize('admin'), processRefund);

export default router;
