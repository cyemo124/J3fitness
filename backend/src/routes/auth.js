import express from "express";
import {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  getSessions,
  forgotPassword,
  resetPassword,
  verifyEmail,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
router.post("/logout-all", authMiddleware, logoutAll);
router.get("/sessions", authMiddleware, getSessions);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/verify-email/:token", verifyEmail);

export default router;
