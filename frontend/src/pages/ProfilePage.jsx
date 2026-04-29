import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const [weight, setWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [stats, setStats] = useState({
    workouts: 12,
    streak: 5,
  });

  useEffect(() => {
    if (user) setFormData(user);
    setWeightHistory([90, 89, 88.5, 88]);
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const response = await userAPI.updateProfile(formData);
      updateUser(response.data.data);
      setSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const addWeight = () => {
    if (!weight) return;
    setWeightHistory([...weightHistory, Number(weight)]);
    setWeight("");
  };

  // 🔥 Animation configs (clean + slower)
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-light py-12"
    >
      <div className="container">
        <motion.h1 variants={item} className="text-4xl font-bold mb-8">
          My Profile
        </motion.h1>

        {/* TOP STATS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            { title: "Total Workouts", value: stats.workouts },
            { title: "Current Streak 🔥", value: `${stats.streak} days` },
            {
              title: "Latest Weight",
              value: `${weightHistory[weightHistory.length - 1] || "--"} kg`,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -4 }}
              className="card"
            >
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold text-red-600">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-2 gap-8">
          {/* WEIGHT TRACKING */}
          <motion.div variants={item} className="card">
            <h2 className="text-2xl font-bold mb-4">Weight Tracking</h2>

            <div className="flex gap-3 mb-4">
              <input
                type="number"
                placeholder="Enter weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={addWeight}
                className="bg-red-600 text-white px-4 rounded"
              >
                Add
              </motion.button>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              {weightHistory.map((w, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  • {w} kg
                </motion.p>
              ))}
            </div>
          </motion.div>

          {/* PRs */}
          <motion.div variants={item} className="card">
            <h2 className="text-2xl font-bold mb-4">Personal Records</h2>

            <div className="space-y-2 text-sm text-gray-700">
              <p>Bench Press: 80kg</p>
              <p>Squat: 100kg</p>
              <p>Deadlift: 120kg</p>
            </div>
          </motion.div>
        </div>

        {/* EDIT PROFILE */}
        <motion.div variants={item} className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

          {success && <div className="alert alert-success mb-6">{success}</div>}

          <form onSubmit={handleSubmit} className="card">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone || ""}
                onChange={handleChange}
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              type="submit"
              className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition shadow-md hover:shadow-lg disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
