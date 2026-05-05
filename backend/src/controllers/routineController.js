// backend/src/controllers/routineController.js
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

// GET ALL user's routines (array, not single)
export const getRoutines = async (req, res) => {
  try {
    const routines = await Routine.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ success: true, data: routines });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single routine by ID
export const getRoutineById = async (req, res) => {
  try {
    const routine = await Routine.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ success: true, data: routine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE routine
export const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ success: true, message: "Routine deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
