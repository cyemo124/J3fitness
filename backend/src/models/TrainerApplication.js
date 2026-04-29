import mongoose from "mongoose";

const trainerApplicationSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    password: String, // already hashed

    experience: Number,
    specialization: String,
    bio: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },
  { timestamps: true },
);

const TrainerApplication = mongoose.model(
  "TrainerApplication",
  trainerApplicationSchema,
);

export default TrainerApplication;
