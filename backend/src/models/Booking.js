import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  classDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
      "refunded",
      "no-show",
    ],
    default: "confirmed",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "paid", // Change to 'pending' when you use real Paystack
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  bookingRef: {
    type: String,
    unique: true,
    required: true,
  },
  cancellationReason: String,
  cancelledAt: Date,
  checkedInAt: Date,
  attendanceMarked: {
    type: Boolean,
    default: false,
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for frequent queries
bookingSchema.index({ userId: 1, status: 1 });
bookingSchema.index({ classId: 1, status: 1 });
bookingSchema.index({ classDate: 1 });
bookingSchema.index({ bookingRef: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
