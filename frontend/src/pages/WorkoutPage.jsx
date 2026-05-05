// src/pages/WorkoutPage.jsx
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { userAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";

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
  const [exercises, setExercises] = useState([
    {
      name: "Bench Press",
      sets: [],
      lastSession: { weight: 50, reps: 8 },
    },
    {
      name: "Incline Dumbbell Press",
      sets: [],
      lastSession: { weight: 20, reps: 10 },
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [streak, setStreak] = useState(0); // ← Real streak from backend
  const [loadingStreak, setLoadingStreak] = useState(true);

  // Fetch workout history AND streak on mount
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
  };

  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight: "", reps: "" });
    setExercises(updated);
  };

  const handleChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const handleEndWorkout = async () => {
    try {
      setSaving(true);

      const cleanedExercises = exercises.map((ex) => ({
        name: ex.name,
        sets: ex.sets
          .filter((s) => s.weight && s.reps)
          .map((s) => ({
            weight: Number(s.weight),
            reps: Number(s.reps),
          })),
      }));

      await userAPI.createWorkout({
        exercises: cleanedExercises,
      });

      showNotification("Workout saved successfully!", "success");
      setWorkoutStarted(false);
      setExercises([
        {
          name: "Bench Press",
          sets: [],
          lastSession: { weight: 50, reps: 8 },
        },
        {
          name: "Incline Dumbbell Press",
          sets: [],
          lastSession: { weight: 20, reps: 10 },
        },
      ]);
      fetchWorkoutHistory();
      fetchStreak(); // ← Refresh streak after saving
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
                ? "Log your sets and track your progress"
                : "Ready to crush your next workout?"}
            </p>
          </motion.div>

          {!workoutStarted ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Cards */}
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
                      {totalVolume > 0 ? `${totalVolume}kg` : "—"}
                    </p>
                    <p className="text-sm text-gray-600">Last Volume</p>
                  </div>
                </motion.div>
              </div>

              {/* Quick Start */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="card bg-gradient-to-br from-red-600 to-red-700 text-white text-center py-12"
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <h2 className="text-2xl font-bold mb-2">Start Your Workout</h2>
                <p className="text-white/80 mb-6">
                  Track your sets, monitor progress, and beat your personal
                  bests
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

              {/* Recent Workouts */}
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
            /* ACTIVE WORKOUT */
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

              {/* Exercises */}
              {exercises.map((exercise, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card"
                >
                  <h2 className="text-xl font-bold mb-2">{exercise.name}</h2>

                  <p className="text-sm text-gray-600 mb-3">
                    Last: {exercise.lastSession.weight}kg x{" "}
                    {exercise.lastSession.reps} reps
                  </p>

                  <p className="text-sm text-green-600 mb-4">
                    Suggested: {exercise.lastSession.weight + 2.5}kg
                  </p>

                  <div className="space-y-3">
                    {exercise.sets.map((set, j) => (
                      <div key={j} className="flex gap-3">
                        <input
                          type="number"
                          placeholder="Weight (kg)"
                          value={set.weight}
                          onChange={(e) =>
                            handleChange(i, j, "weight", e.target.value)
                          }
                          className="border p-2 rounded w-full focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) =>
                            handleChange(i, j, "reps", e.target.value)
                          }
                          className="border p-2 rounded w-full focus:ring-2 focus:ring-red-500 outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <motion.button
                    onClick={() => addSet(i)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                  >
                    + Add Set
                  </motion.button>
                </motion.div>
              ))}

              {/* End Workout */}
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
            </motion.div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
