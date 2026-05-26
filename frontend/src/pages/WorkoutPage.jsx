// src/pages/WorkoutPage.jsx
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Dumbbell,
  Flame,
  Trophy,
  Clock,
  CheckCircle,
  X,
  Loader2,
  TrendingUp,
  Calendar,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
  Filter,
} from "lucide-react";
import { userAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";

// ─── COMPREHENSIVE EXERCISE LIBRARY ───
const EXERCISE_LIBRARY = {
  chest: {
    label: "Chest",
    icon: "💪",
    exercises: [
      "Barbell Bench Press",
      "Incline Barbell Bench Press",
      "Decline Barbell Bench Press",
      "Dumbbell Bench Press",
      "Incline Dumbbell Press",
      "Decline Dumbbell Press",
      "Dumbbell Flyes",
      "Incline Dumbbell Flyes",
      "Cable Crossovers",
      "Pec Deck Machine",
      "Push-ups",
      "Diamond Push-ups",
      "Dips (Chest Focus)",
      "Svend Press",
      "Landmine Press",
    ],
  },
  back: {
    label: "Back",
    icon: "🔙",
    exercises: [
      "Pull-ups",
      "Chin-ups",
      "Lat Pulldowns",
      "Bent Over Barbell Rows",
      "Pendlay Rows",
      "T-Bar Rows",
      "Seated Cable Rows",
      "Single-Arm Dumbbell Rows",
      "Chest-Supported Rows",
      "Machine Rows",
      "Deadlifts",
      "Rack Pulls",
      "Good Mornings",
      "Hyperextensions",
      "Face Pulls",
      "Reverse Flyes",
      "Shrugs",
    ],
  },
  shoulders: {
    label: "Shoulders",
    icon: "🎯",
    exercises: [
      "Overhead Press (Barbell)",
      "Seated Dumbbell Press",
      "Arnold Press",
      "Lateral Raises",
      "Front Raises",
      "Rear Delt Flyes",
      "Upright Rows",
      "Face Pulls",
      "Shrugs",
      "Push Press",
      "Landmine Press",
      "Cable Lateral Raises",
    ],
  },
  arms: {
    label: "Arms",
    icon: "💪",
    exercises: [
      "Barbell Curls",
      "Dumbbell Curls",
      "Hammer Curls",
      "Preacher Curls",
      "Incline Dumbbell Curls",
      "Concentration Curls",
      "Cable Curls",
      "21s (Biceps)",
      "Close-Grip Bench Press",
      "Skull Crushers",
      "Tricep Pushdowns",
      "Overhead Tricep Extension",
      "Dumbbell Kickbacks",
      "Cable Kickbacks",
      "Dips (Tricep Focus)",
      "Diamond Push-ups",
      "Wrist Curls",
      "Reverse Wrist Curls",
      "Farmer's Walk",
    ],
  },
  legs: {
    label: "Legs",
    icon: "🦵",
    exercises: [
      "Barbell Squats",
      "Front Squats",
      "Goblet Squats",
      "Hack Squats",
      "Leg Press",
      "Bulgarian Split Squats",
      "Lunges",
      "Walking Lunges",
      "Romanian Deadlifts",
      "Stiff-Leg Deadlifts",
      "Leg Curls",
      "Leg Extensions",
      "Calf Raises",
      "Seated Calf Raises",
      "Hip Thrusts",
      "Glute Bridges",
      "Step-ups",
      "Box Jumps",
    ],
  },
  core: {
    label: "Core",
    icon: "🎯",
    exercises: [
      "Plank",
      "Side Plank",
      "Crunches",
      "Bicycle Crunches",
      "Leg Raises",
      "Hanging Leg Raises",
      "Russian Twists",
      "Mountain Climbers",
      "Dead Bug",
      "Ab Rollouts",
      "Cable Crunches",
      "Flutter Kicks",
      "V-ups",
      "Hollow Body Hold",
    ],
  },
};

const ALL_EXERCISES = Object.entries(EXERCISE_LIBRARY).flatMap(
  ([group, data]) =>
    data.exercises.map((name) => ({ name, group, groupLabel: data.label })),
);

function InlineToast({ message, type, onClose }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />,
    error: <X className="w-5 h-5 shrink-0 text-red-600" />,
  };
  const styles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${styles[type]}`}
    >
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="hover:bg-black/5 rounded-full p-1">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function WorkoutPage() {
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streak, setStreak] = useState(0);
  const [loadingStreak, setLoadingStreak] = useState(true);

  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [customExerciseName, setCustomExerciseName] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    fetchWorkoutHistory();
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      setLoadingStreak(true);
      const response = await userAPI.getDashboard();
      const data = response?.data || response;
      setStreak(data?.streak || 0);
    } catch (err) {
      console.error("Failed to load streak:", err);
      setStreak(0);
    } finally {
      setLoadingStreak(false);
    }
  };

  const fetchWorkoutHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await userAPI.getWorkouts();
      const data = response?.data || [];
      setWorkoutHistory(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch (err) {
      console.error("Failed to load workout history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleStart = () => {
    setWorkoutStarted(true);
    setShowExercisePicker(true);
  };

  const filteredExercises = useMemo(() => {
    let results = ALL_EXERCISES;
    if (selectedGroup !== "all") {
      results = results.filter((ex) => ex.group === selectedGroup);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter((ex) => ex.name.toLowerCase().includes(q));
    }
    return results;
  }, [searchQuery, selectedGroup]);

  const addExerciseFromLibrary = (exerciseName) => {
    const existing = exercises.find((ex) => ex.name === exerciseName);
    if (existing) {
      showNotification("Exercise already added", "error");
      return;
    }
    setExercises((prev) => [
      ...prev,
      {
        name: exerciseName,
        sets: [],
        lastSession: findLastSession(exerciseName),
      },
    ]);
    setShowExercisePicker(false);
    setSearchQuery("");
    setSelectedGroup("all");
  };

  const addCustomExercise = () => {
    if (!customExerciseName.trim()) {
      showNotification("Enter an exercise name", "error");
      return;
    }
    addExerciseFromLibrary(customExerciseName.trim());
    setCustomExerciseName("");
  };

  const findLastSession = (exerciseName) => {
    for (const workout of workoutHistory) {
      const ex = workout.exercises?.find(
        (e) => e.name?.toLowerCase() === exerciseName.toLowerCase(),
      );
      if (ex?.sets?.length > 0) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return { weight: lastSet.weight, reps: lastSet.reps };
      }
    }
    return null;
  };

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    const lastSet = updated[exerciseIndex].sets.slice(-1)[0];
    updated[exerciseIndex].sets.push({
      weight: lastSet?.weight || "",
      reps: lastSet?.reps || "",
    });
    setExercises(updated);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(updated);
  };

  const handleChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const removeExercise = (exerciseIndex) => {
    const updated = [...exercises];
    updated.splice(exerciseIndex, 1);
    setExercises(updated);
  };

  const handleEndWorkout = async () => {
    try {
      setSaving(true);
      const cleanedExercises = exercises
        .map((ex) => ({
          name: ex.name,
          sets: ex.sets
            .filter((s) => s.weight && s.reps)
            .map((s) => ({
              weight: Number(s.weight),
              reps: Number(s.reps),
            })),
        }))
        .filter((ex) => ex.sets.length > 0);

      if (cleanedExercises.length === 0) {
        showNotification("Add at least one complete set", "error");
        setSaving(false);
        return;
      }

      await userAPI.createWorkout({ exercises: cleanedExercises });
      showNotification("Workout saved successfully!", "success");
      setWorkoutStarted(false);
      setExercises([]);
      fetchWorkoutHistory();
      fetchStreak();
    } catch (error) {
      console.error("Error saving workout:", error);
      showNotification("Failed to save workout. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const totalVolume = exercises.reduce(
    (sum, ex) =>
      sum +
      ex.sets.reduce(
        (setSum, set) => setSum + (Number(set.weight) * Number(set.reps) || 0),
        0,
      ),
    0,
  );

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
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
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-dark mb-2">
              Workout Session
            </h1>
            <p className="text-gray-600">
              {workoutStarted
                ? `${exercises.length} exercise${exercises.length !== 1 ? "s" : ""} • ${totalVolume}kg volume`
                : "Ready to crush your next workout?"}
            </p>
          </motion.div>

          {!workoutStarted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="card flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">
                      {workoutHistory.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Workouts</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="card flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">
                      {loadingStreak ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        streak
                      )}
                    </p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  className="card flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-dark">
                      {workoutHistory[0]?.exercises?.reduce(
                        (sum, ex) =>
                          sum +
                          ex.sets?.reduce(
                            (s, set) => s + set.weight * set.reps,
                            0,
                          ),
                        0,
                      ) || 0}
                      kg
                    </p>
                    <p className="text-sm text-gray-600">Last Volume</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                whileHover={{ scale: 1.01 }}
                className="card bg-gradient-to-br from-red-600 to-red-700 text-white text-center py-12"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <h2 className="text-2xl font-bold mb-2">Start Your Workout</h2>
                <p className="text-white/80 mb-6">
                  Pick exercises, log your sets, track your progress
                </p>
                <motion.button
                  onClick={handleStart}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-100 transition inline-flex items-center gap-3"
                >
                  <Play className="w-5 h-5" />
                  Start Workout
                </motion.button>
              </motion.div>

              <div className="card">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg font-bold">Recent Workouts</h2>
                </div>
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                  </div>
                ) : workoutHistory.length > 0 ? (
                  <div className="space-y-3">
                    {workoutHistory.map((workout, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-sm">
                              {new Date(workout.date).toLocaleDateString(
                                "en-US",
                                {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {workout.exercises?.length || 0} exercises
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-600">
                          {workout.exercises?.reduce(
                            (sum, ex) =>
                              sum +
                              ex.sets?.reduce(
                                (s, set) => s + set.weight * set.reps,
                                0,
                              ),
                            0,
                          ) || 0}
                          kg
                        </span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No workouts logged yet. Start your first one above!</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Live Stats Bar */}
              <div className="card bg-black text-white flex justify-between items-center py-4">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold">Live Session</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Total Volume</p>
                  <p className="text-xl font-bold">{totalVolume}kg</p>
                </div>
              </div>

              {/* Add Exercise Button */}
              <motion.button
                onClick={() => setShowExercisePicker(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full border-2 border-dashed border-red-300 bg-red-50 text-red-600 px-6 py-4 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Add Exercise
              </motion.button>

              {/* Exercise Picker Modal */}
              <AnimatePresence>
                {showExercisePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="card border-2 border-red-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-red-600" />
                        Add Exercise
                      </h2>
                      <button
                        onClick={() => setShowExercisePicker(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search exercises..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    {/* Group Filter */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button
                        onClick={() => setSelectedGroup("all")}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                          selectedGroup === "all"
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        All
                      </button>
                      {Object.entries(EXERCISE_LIBRARY).map(([key, data]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedGroup(key)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                            selectedGroup === key
                              ? "bg-red-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {data.icon} {data.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Exercise */}
                    <div className="flex gap-2 mb-4">
                      <input
                        type="text"
                        placeholder="Or type custom exercise..."
                        value={customExerciseName}
                        onChange={(e) => setCustomExerciseName(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && addCustomExercise()
                        }
                        className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <button
                        onClick={addCustomExercise}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Exercise List */}
                    <div className="max-h-64 overflow-y-auto space-y-1">
                      {searchQuery || selectedGroup !== "all" ? (
                        filteredExercises.length > 0 ? (
                          filteredExercises.map((ex, i) => (
                            <motion.button
                              key={`${ex.group}-${i}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() => addExerciseFromLibrary(ex.name)}
                              className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-50 transition flex items-center justify-between group"
                            >
                              <span className="font-medium">{ex.name}</span>
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded group-hover:bg-red-100">
                                {ex.groupLabel}
                              </span>
                            </motion.button>
                          ))
                        ) : (
                          <p className="text-center text-gray-500 py-4">
                            No exercises found. Try a different search or add
                            custom.
                          </p>
                        )
                      ) : (
                        Object.entries(EXERCISE_LIBRARY).map(
                          ([group, data]) => (
                            <div key={group} className="mb-2">
                              <button
                                onClick={() => toggleGroup(group)}
                                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition font-semibold"
                              >
                                <span>
                                  {data.icon} {data.label} (
                                  {data.exercises.length})
                                </span>
                                {expandedGroups[group] ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </button>
                              <AnimatePresence>
                                {expandedGroups[group] && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pl-4 space-y-1 mt-1">
                                      {data.exercises.map((name, idx) => (
                                        <motion.button
                                          key={idx}
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          transition={{ delay: idx * 0.03 }}
                                          onClick={() =>
                                            addExerciseFromLibrary(name)
                                          }
                                          className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 transition text-sm"
                                        >
                                          {name}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ),
                        )
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected Exercises */}
              {exercises.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500 card"
                >
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No exercises yet</p>
                  <p>
                    Click "Add Exercise" above to start building your workout
                  </p>
                </motion.div>
              ) : (
                exercises.map((exercise, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="card"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold">{exercise.name}</h2>
                        {exercise.lastSession && (
                          <p className="text-sm text-gray-500">
                            Last: {exercise.lastSession.weight}kg ×{" "}
                            {exercise.lastSession.reps}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => removeExercise(i)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Sets */}
                    <div className="space-y-2 mb-3">
                      {exercise.sets.map((set, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 w-8">
                            Set {j + 1}
                          </span>
                          <input
                            type="number"
                            placeholder="kg"
                            value={set.weight}
                            onChange={(e) =>
                              handleChange(i, j, "weight", e.target.value)
                            }
                            className="border p-2 rounded w-24 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                          <span className="text-gray-400">×</span>
                          <input
                            type="number"
                            placeholder="reps"
                            value={set.reps}
                            onChange={(e) =>
                              handleChange(i, j, "reps", e.target.value)
                            }
                            className="border p-2 rounded w-24 focus:ring-2 focus:ring-red-500 outline-none"
                          />
                          <button
                            onClick={() => removeSet(i, j)}
                            className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      onClick={() => addSet(i)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Set
                    </motion.button>
                  </motion.div>
                ))
              )}

              {/* End Workout */}
              {exercises.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={handleEndWorkout}
                    disabled={saving}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        End Workout
                      </>
                    )}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
