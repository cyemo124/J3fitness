import mongoose from "mongoose";
import crypto from "crypto";

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  refreshTokenHash: {
    type: String,
    required: true,
  },
  deviceInfo: {
    type: String,
    default: "Unknown",
  },
  ipAddress: {
    type: String,
    default: "Unknown",
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60, // MongoDB TTL: auto-delete after 30 days
  },
});

// Hash token before saving
sessionSchema.pre("save", function (next) {
  if (this.isModified("refreshTokenHash")) {
    this.refreshTokenHash = crypto
      .createHash("sha256")
      .update(this.refreshTokenHash)
      .digest("hex");
  }
  next();
});

const Session = mongoose.model("Session", sessionSchema);
export default Session;
