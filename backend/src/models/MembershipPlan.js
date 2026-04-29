// backend/src/models/Membership.js
import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    features: [
      {
        type: String,
      },
    ],
    classesPerMonth: {
      type: Number,
      default: 0,
    },
    accessLevel: {
      type: String,
      enum: ["basic", "premium", "vip"],
      required: true,
    },
    benefits: {
      guestPasses: { type: Number, default: 0 },
      priorityBooking: { type: Boolean, default: false },
      personalTrainingIncluded: { type: Number, default: 0 },
      unlimitedClasses: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// CHANGED: Register as "MembershipPlan" to match your populate calls
const MembershipPlan = mongoose.model("MembershipPlan", membershipSchema);
export default MembershipPlan;
