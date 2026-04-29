import Routine from "../models/Routine.js";

// CREATE routine
export const createRoutine = async (req, res) => {
  try {
    const routine = await Routine.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET user's routine
export const getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({ user: req.user.id });

    res.json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
