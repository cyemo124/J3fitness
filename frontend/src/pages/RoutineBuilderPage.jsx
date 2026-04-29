import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  Dumbbell,
  CalendarDays,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { routineAPI } from "../services/api.js";
import PageWrapper from "../components/PageWrapper";

function InlineToast({ message, type, onClose }) {
  const icons = {
    error: <AlertTriangle className="w-5 h-5 shrink-0" />,
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
  };

  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    success: "bg-green-50 border-green-200 text-green-800",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm mb-4 ${styles[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="hover:bg-black/5 rounded-full p-1 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function RoutineBuilderPage() {
  const [routineName, setRoutineName] = useState("");
  const [days, setDays] = useState([
    { name: "Monday", exercises: [] },
    { name: "Tuesday", exercises: [] },
    { name: "Wednesday", exercises: [] },
    { name: "Thursday", exercises: [] },
    { name: "Friday", exercises: [] },
    { name: "Saturday", exercises: [] },
    { name: "Sunday", exercises: [] },
  ]);

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [newExercise, setNewExercise] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [shakeName, setShakeName] = useState(false);

  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const addExercise = () => {
    if (!newExercise.trim()) {
      showNotification("Please enter an exercise name", "error");
      return;
    }

    const updated = [...days];
    updated[selectedDayIndex].exercises.push(newExercise.trim());
    setDays(updated);
    setNewExercise("");
  };

  const removeExercise = (index) => {
    const updated = [...days];
    updated[selectedDayIndex].exercises.splice(index, 1);
    setDays(updated);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addExercise();
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      setShakeName(true);
      setTimeout(() => setShakeName(false), 500);
      showNotification("Please enter a routine name", "error");
      return;
    }

    const hasExercises = days.some((d) => d.exercises.length > 0);
    if (!hasExercises) {
      showNotification("Add at least one exercise to your routine", "error");
      return;
    }

    setSaving(true);

    // FIXED: Convert exercises from strings to objects with `name` property
    const routine = {
      name: routineName.trim(),
      days: days.map((d) => ({
        name: d.name,
        exercises: d.exercises.map((exerciseName) => ({ name: exerciseName })),
      })),
    };

    try {
      await routineAPI.saveRoutine(routine); // FIXED: Use saveRoutine, not createRoutine
      showNotification("Routine saved successfully!", "success");
      setRoutineName("");
      setDays(days.map((d) => ({ ...d, exercises: [] })));
    } catch (err) {
      console.error("Error saving routine:", err);
      showNotification(
        err.message || "Failed to save routine. Please try again.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const totalExercises = days.reduce((sum, d) => sum + d.exercises.length, 0);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-dark mb-2">
              Routine Builder
            </h1>
            <p className="text-gray-600">
              {totalExercises > 0
                ? `${totalExercises} exercise${totalExercises !== 1 ? "s" : ""} across ${days.filter((d) => d.exercises.length > 0).length} day${days.filter((d) => d.exercises.length > 0).length !== 1 ? "s" : ""}`
                : "Build your weekly workout routine"}
            </p>
          </motion.div>

          <AnimatePresence>
            {notification && (
              <InlineToast
                message={notification.message}
                type={notification.type}
                onClose={() => setNotification(null)}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Routine Name <span className="text-red-500">*</span>
            </label>
            <motion.div animate={shakeName ? { x: [-10, 10, -10, 10, 0] } : {}}>
              <input
                type="text"
                placeholder="e.g. Push Pull Legs"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition ${shakeName ? "border-red-500 bg-red-50" : "border-gray-300"}`}
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold">Select Day</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {days.map((day, index) => {
                const exerciseCount = day.exercises.length;
                const isSelected = selectedDayIndex === index;
                return (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedDayIndex(index)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-4 py-2 rounded-xl font-medium transition-all ${isSelected ? "bg-red-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    {day.name.slice(0, 3)}
                    {exerciseCount > 0 && (
                      <span
                        className={`absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${isSelected ? "bg-white text-red-600" : "bg-red-600 text-white"}`}
                      >
                        {exerciseCount}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-5 h-5 text-red-600" />
              <h2 className="text-lg font-bold">Add Exercise</h2>
              <span className="text-sm text-gray-500 font-normal">
                ({days[selectedDayIndex].name})
              </span>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. Bench Press"
                value={newExercise}
                onChange={(e) => setNewExercise(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
              <motion.button
                onClick={addExercise}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card mb-8"
          >
            <h2 className="text-lg font-bold mb-4">
              Exercises for {days[selectedDayIndex].name}
            </h2>
            <AnimatePresence mode="popLayout">
              {days[selectedDayIndex].exercises.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-gray-500"
                >
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No exercises yet</p>
                </motion.div>
              ) : (
                <div className="space-y-2">
                  {days[selectedDayIndex].exercises.map((ex, i) => (
                    <motion.div
                      key={`${selectedDayIndex}-${i}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg group hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                          {i + 1}
                        </span>
                        <span className="font-medium">{ex}</span>
                      </div>
                      <motion.button
                        onClick={() => removeExercise(i)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={saveRoutine}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Routine
                </>
              )}
            </motion.button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
