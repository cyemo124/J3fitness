import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import classRoutes from "./routes/classes.js";
import bookingRoutes from "./routes/bookings.js";
import trainerRoutes from "./routes/trainers.js";
import membershipRoutes from "./routes/memberships.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";
import routineRoutes from "./routes/routines.js";
import workoutRoutes from "./routes/workouts.js";

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Security Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});

app.use(limiter);

// Body Parser Middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/trainers", trainerRoutes);
app.use("/api/v1/memberships", membershipRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/trainer-applications", adminRoutes);
app.use("/api/v1/admin/trainer-applications/:id/approve", adminRoutes);
app.use("/api/v1/admin/trainer-applications/:id/reject", adminRoutes);
app.use("/api/v1/routines", routineRoutes);
app.use("/api/v1/workouts", workoutRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

export default app;
