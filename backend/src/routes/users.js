import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserBookings,
  getMembershipInfo,
  renewMembership,
  getPaymentHistory,
  getDashboard
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/bookings', getUserBookings);
router.get('/membership', getMembershipInfo);
router.put('/membership/renew', renewMembership);
router.get('/payment-history', getPaymentHistory);

export default router;
