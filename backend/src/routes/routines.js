import express from "express";
import { createRoutine, getRoutine } from "../controllers/routineController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/", authMiddleware, createRoutine);
router.get("/", authMiddleware, getRoutine);

export default router;
