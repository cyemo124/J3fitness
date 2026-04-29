import User from "../models/User.js";
import Session from "../models/Sessions.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../middleware/errorHandler.js";

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" },
  );
};

const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;

    if (!firstName || !lastName || !email || !password) {
      throw new AppError("Please provide all required fields", 400);
    }

    if (password !== passwordConfirm) {
      throw new AppError("Passwords do not match", 400);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: "user",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await Session.create({
      user: user._id,
      refreshTokenHash: refreshToken,
      deviceInfo: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("Please provide email and password", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    if (!user.isActive) {
      throw new AppError("Your account has been deactivated", 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    await Session.create({
      user: user._id,
      refreshTokenHash: refreshToken,
      deviceInfo: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError("Refresh token required", 400);
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      refreshTokenHash: tokenHash,
      isValid: true,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await User.findById(session.user);
    if (!user || !user.isActive) {
      throw new AppError("User not found or account deactivated", 401);
    }

    // Rotate: invalidate old, create new
    const newRefreshToken = generateRefreshToken();
    const newAccessToken = generateAccessToken(user);

    session.isValid = false;
    await session.save();

    await Session.create({
      user: user._id,
      refreshTokenHash: newRefreshToken,
      deviceInfo: req.headers["user-agent"] || "Unknown",
      ipAddress: req.ip,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

      await Session.findOneAndUpdate(
        { refreshTokenHash: tokenHash },
        { isValid: false },
      );
    }

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (req, res, next) => {
  try {
    await Session.updateMany(
      { user: req.user.id, isValid: true },
      { isValid: false },
    );

    res.status(200).json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    next(error);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .select("-refreshTokenHash");

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      throw new AppError("Please provide your email", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;

    if (!password || !passwordConfirm) {
      throw new AppError("Please provide new password", 400);
    }

    if (password !== passwordConfirm) {
      throw new AppError("Passwords do not match", 400);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.password = password;
    await user.save();

    // Security: kill all sessions on password reset
    await Session.updateMany(
      { user: user._id, isValid: true },
      { isValid: false },
    );

    res.status(200).json({
      success: true,
      message: "Password reset successful. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    next(error);
  }
};
