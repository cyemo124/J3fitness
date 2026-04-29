import Workout from "../models/Workout.js";
import Routine from "../models/Routine.js";

// SAVE workout
export const createWorkout = async (req, res) => {
  try {
    const workout = await Workout.create({
      user: req.user.id,
      exercises: req.body.exercises,
      date: new Date(), // ✅ add this
    });

    res.status(201).json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET today's workout (from routine)
export const getTodayWorkout = async (req, res) => {
  try {
    const routine = await Routine.findOne({ user: req.user.id });

    if (!routine) {
      return res.json({ success: true, data: [] });
    }

    const today = new Date().toLocaleString("en-US", {
      weekday: "long",
    });

    const todayPlan = routine.days.find((d) => d.name === today);

    res.json({
      success: true,
      data: todayPlan ? todayPlan.exercises : [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id }).sort({
      date: -1,
    });

    res.json({
      success: true,
      data: workouts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
