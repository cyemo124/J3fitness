// backend/src/routes/membershipRoutes.js
import express from "express";
import {
  getAllMemberships,
  getMembershipById,
  createMembership,
  updateMembership,
  deleteMembership,
} from "../controllers/membershipController.js";
import { authMiddleware, authorize } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getAllMemberships);
router.get("/:id", getMembershipById);

// Admin only
router.post(
  "/",
  authMiddleware,
  authorize("admin", "super_admin"),
  createMembership,
);
router.put(
  "/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  updateMembership,
);
router.delete(
  "/:id",
  authMiddleware,
  authorize("admin", "super_admin"),
  deleteMembership,
);

export default router;
