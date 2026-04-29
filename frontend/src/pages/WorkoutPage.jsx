import { useState } from "react";
import { userAPI } from "../services/api";

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

  // Start workout
  const handleStart = () => {
    setWorkoutStarted(true);
  };

  // Add set
  const addSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ weight: "", reps: "" });
    setExercises(updated);
  };

  // Handle input change
  const handleChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  // End workout
  const handleEndWorkout = async () => {
    try {
      // clean data (remove empty sets)
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

      alert("Workout saved!");
      setWorkoutStarted(false);
    } catch (error) {
      console.error("Error saving workout:", error);
      alert("Failed to save workout");
    }
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container">
        <h1 className="text-4xl font-bold mb-6">Workout Session</h1>

        {!workoutStarted ? (
          <button
            onClick={handleStart}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          >
            Start Workout
          </button>
        ) : (
          <>
            {/* Exercises */}
            <div className="space-y-6">
              {exercises.map((exercise, i) => (
                <div key={i} className="card">
                  <h2 className="text-xl font-bold mb-2">{exercise.name}</h2>

                  {/* Last Session Info */}
                  <p className="text-sm text-gray-600 mb-3">
                    Last: {exercise.lastSession.weight}kg x{" "}
                    {exercise.lastSession.reps} reps
                  </p>

                  {/* Suggestion */}
                  <p className="text-sm text-green-600 mb-4">
                    Suggested: {exercise.lastSession.weight + 2.5}kg
                  </p>

                  {/* Sets */}
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
                          className="border p-2 rounded w-full"
                        />

                        <input
                          type="number"
                          placeholder="Reps"
                          value={set.reps}
                          onChange={(e) =>
                            handleChange(i, j, "reps", e.target.value)
                          }
                          className="border p-2 rounded w-full"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Add Set Button */}
                  <button
                    onClick={() => addSet(i)}
                    className="mt-3 border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                  >
                    + Add Set
                  </button>
                </div>
              ))}
            </div>

            {/* End Workout */}
            <div className="mt-8">
              <button
                onClick={handleEndWorkout}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
              >
                End Workout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
