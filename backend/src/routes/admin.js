import express from "express";
import upload from "../middleware/upload.js";
import { authMiddleware, authorize } from "../middleware/auth.js";
import User from "../models/User.js";
import {
  getDashboard,
  getAnalytics,
  getAllMembers,
  updateGymSettings,
  getSystemLogs,
  getRevenueReport,
  getMemberGrowthReport,
  getClassPopularityReport,
  makeAdmin,
} from "../controllers/adminController.js";

import {
  getTrainerApplications,
  approveTrainerApplication,
  rejectTrainerApplication,
  updateTrainer,
  createTrainer,
  deleteTrainer,
} from "../controllers/trainerController.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(authorize("admin", "super_admin"));

router.get("/dashboard", getDashboard);
router.get("/analytics", getAnalytics);
router.get("/members", getAllMembers);
router.patch("/make-admin/:id", makeAdmin); // promote user to admin
// router.patch("/update-member/:id", updateMember);
router.post("/settings", updateGymSettings);
router.get("/logs", getSystemLogs);
router.get("/reports/revenue", getRevenueReport);
router.get("/reports/member-growth", getMemberGrowthReport);
router.get("/reports/class-popularity", getClassPopularityReport);

router.post(
  "/trainers",
  authMiddleware,
  authorize("admin", "super_admin"),
  upload.single("image"),
  createTrainer,
);

router.put(
  "/trainers/:id",
  authMiddleware,
  authorize("admin", "super_admin", "trainer"),
  upload.single("image"),
  updateTrainer
);

router.delete(
  "/trainers/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  deleteTrainer,
);

router.patch(
  "/trainer-applications/:id/approve",
  authMiddleware,
  authorize("admin", "super_admin"),
  approveTrainerApplication,
);
router.patch(
  "/trainer-applications/:id/reject",
  authMiddleware,
  authorize("admin", "super_admin"),
  rejectTrainerApplication,
);
router.get(
  "/trainer-applications",
  authMiddleware,
  authorize("admin", "super_admin"),
  getTrainerApplications,
);

export default router;
