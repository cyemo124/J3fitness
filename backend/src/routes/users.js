import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserBookings,
  getMembershipInfo,
  renewMembership,
  getPaymentHistory,
  getDashboard,
  addWeightEntry,
  getWeightHistory,
} from "../controllers/userController.js";
import {
  createDummyMembership,
  cancelDummyMembership,
  changeDummyMembership,
} from "../controllers/dummyMembershipController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/dashboard", getDashboard);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/password", changePassword);
router.get("/bookings", getUserBookings);
router.get("/membership", getMembershipInfo);
router.put("/membership/renew", renewMembership);
router.get("/payment-history", getPaymentHistory);
router.post("/weight", addWeightEntry);
router.get("/weight", getWeightHistory);

// ─── NEW: Dummy membership routes ───
router.post("/dummy-membership", createDummyMembership);
router.put("/dummy-membership", changeDummyMembership);
router.delete("/dummy-membership", cancelDummyMembership);

export default router;
