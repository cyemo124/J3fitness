// backend/src/routes/routines.js
import express from "express";
import {
  createRoutine,
  getRoutines,
  getRoutineById,
  deleteRoutine,
} from "../controllers/routineController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createRoutine);
router.get("/", authMiddleware, getRoutines);           // All routines (array)
router.get("/:id", authMiddleware, getRoutineById);   // Single routine
router.delete("/:id", authMiddleware, deleteRoutine);   // Delete routine

export default router;