import express from "express";
import { authMiddleware, authorize } from "../middleware/auth.js";
import {
  getAllTrainers,
  getTrainerById,
  getTrainerClasses,
  getTrainerReviews,
  applyTrainer,
} from "../controllers/trainerController.js";

const router = express.Router();

// Public routes
router.get("/", getAllTrainers);
router.get("/:id", getTrainerById);
router.get("/:id/classes", getTrainerClasses);
router.get("/:id/reviews", getTrainerReviews);
router.post("/apply", applyTrainer);

// Admin only routes

export default router;
