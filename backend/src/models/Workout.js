import mongoose from "mongoose";

const setSchema = new mongoose.Schema({
  weight: Number,
  reps: Number,
});

const exerciseSchema = new mongoose.Schema({
  name: String,
  sets: [setSchema],
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    exercises: [exerciseSchema],
  },
  { timestamps: true },
);

export default mongoose.model("Workout", workoutSchema);
