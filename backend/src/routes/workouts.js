import express from "express";
import {
  createWorkout,
  getTodayWorkout,
  getWorkouts
} from "../controllers/workoutController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createWorkout);
router.get("/today", authMiddleware, getTodayWorkout);
router.get("/", authMiddleware, getWorkouts);

export default router;
