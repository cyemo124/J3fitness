import express from "express";
import { authMiddleware, authorize } from "../middleware/auth.js";
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  checkInToClass,
  getAllBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

// Protected routes (members)
router.get("/admin/all", authMiddleware, authorize("admin"), getAllBookings);
router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getUserBookings);
router.get("/:id", authMiddleware, getBookingById);
router.put("/:id", authMiddleware, updateBooking);
router.delete("/:id", authMiddleware, cancelBooking);
router.post("/:id/checkin", authMiddleware, checkInToClass);

// Admin routes

export default router;
