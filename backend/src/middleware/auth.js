import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "./errorHandler.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("User no longer exists", 401);
    }
    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired, please refresh", 401));
    }
    next(new AppError("Invalid token", 401));
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied", 403));
    }
    next();
  };
};
