import { useEffect, useState } from "react";
import { userAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        const res = await userAPI.getWorkouts();
        const data = res.data || [];
        setWorkouts(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // 🔥 Animations (smooth + not fast)
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.12,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light py-12">
        <div className="container">
          <p className="text-gray-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-light py-12"
    >
      <div className="container">
        <motion.h1 variants={item} className="text-4xl font-bold mb-8">
          Workout History
        </motion.h1>

        {workouts.length === 0 ? (
          <p className="text-gray-600">No workouts yet</p>
        ) : (
          <div className="space-y-6">
            {workouts.map((workout) => (
              <motion.div
                key={workout._id}
                variants={item}
                whileHover={{ y: -3 }}
                className="card"
              >
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg">
                      {new Date(workout.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {workout.exercises.length} exercises
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleExpand(workout._id)}
                    className="text-red-600 hover:underline"
                  >
                    {expandedId === workout._id ? "Hide" : "View"}
                  </motion.button>
                </div>

                {/* 🔥 Animated Expand Section */}
                <AnimatePresence>
                  {expandedId === workout._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-4">
                        {workout.exercises.map((exercise, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border p-3 rounded"
                          >
                            <p className="font-semibold mb-2">
                              {exercise.name}
                            </p>

                            <div className="space-y-1 text-sm text-gray-700">
                              {exercise.sets.map((set, j) => (
                                <p key={j}>
                                  {set.weight}kg x {set.reps}
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
