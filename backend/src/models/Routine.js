import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const daySchema = new mongoose.Schema({
  name: { type: String, required: true },
  exercises: [exerciseSchema],
});

const routineSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    days: [daySchema],
  },
  { timestamps: true }
);

export default mongoose.model("Routine", routineSchema);