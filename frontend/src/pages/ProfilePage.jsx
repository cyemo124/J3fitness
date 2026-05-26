import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, updateUser, membership } = useAuth();

  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [weight, setWeight] = useState("");
  const [weightHistory, setWeightHistory] = useState([]);
  const [personalRecords, setPersonalRecords] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [weightLoading, setWeightLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(user);
      fetchAllData();
    }
  }, [user]);

  const fetchAllData = async () => {
    setPageLoading(true);
    setError("");

    try {
      const [profileRes, dashboardRes, workoutsRes, weightRes] =
        await Promise.allSettled([
          userAPI.getProfile(),
          userAPI.getDashboard(),
          userAPI.getWorkouts(),
          userAPI.getWeightHistory(), // ← NEW: fetch from backend
        ]);

      if (profileRes.status === "fulfilled") {
        const profile = profileRes.value?.data || profileRes.value;
        setProfileData(profile);
      }

      if (dashboardRes.status === "fulfilled") {
        const dash = dashboardRes.value?.data || dashboardRes.value;
        setDashboardData(dash);
      }

      if (workoutsRes.status === "fulfilled") {
        const allWorkouts = workoutsRes.value?.data || workoutsRes.value || [];
        setWorkouts(allWorkouts);
        calculatePRs(allWorkouts);
      }

      // ← NEW: load weight history from backend
      if (weightRes.status === "fulfilled") {
        const history = weightRes.value?.data || weightRes.value || [];
        // Extract just the weight numbers if objects, or use as-is
        const normalized = history.map((entry) =>
          typeof entry === "number" ? entry : entry.weight,
        );
        setWeightHistory(normalized);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Some data couldn't be loaded");
    } finally {
      setPageLoading(false);
    }
  };

  const calculatePRs = (workoutList) => {
    const prs = [];
    const exerciseMaxes = {};

    workoutList.forEach((workout) => {
      workout.exercises?.forEach((ex) => {
        const name = ex.name || ex.exerciseName;
        const weight = Number(ex.weight) || 0;
        if (name && weight > 0) {
          if (!exerciseMaxes[name] || weight > exerciseMaxes[name]) {
            exerciseMaxes[name] = weight;
          }
        }
      });
    });

    Object.entries(exerciseMaxes).forEach(([name, weight]) => {
      prs.push({ name, weight });
    });

    if (prs.length === 0) {
      prs.push(
        { name: "Bench Press", weight: 0 },
        { name: "Squat", weight: 0 },
        { name: "Deadlift", weight: 0 },
      );
    }

    setPersonalRecords(prs);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await userAPI.updateProfile(formData);
      const updatedUser = response.data?.data || response.data || response;
      updateUser(updatedUser);
      setSuccess("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // ← UPDATED: Save weight to backend
  const addWeight = async () => {
    if (!weight) return;

    const newWeight = Number(weight);
    setWeightLoading(true);

    try {
      // Save to backend first
      await userAPI.addWeight(newWeight);

      // Then refresh from backend to confirm
      const response = await userAPI.getWeightHistory();
      const history = response?.data || response || [];
      const normalized = history.map((entry) =>
        typeof entry === "number" ? entry : entry.weight,
      );

      setWeightHistory(normalized);
      setWeight("");
    } catch (err) {
      console.error("Failed to save weight:", err);
      setError("Failed to save weight entry");
    } finally {
      setWeightLoading(false);
    }
  };

  const totalWorkouts = workouts.length;
  const currentStreak = dashboardData?.streak || 0;
  const latestWeight =
    weightHistory.length > 0
      ? weightHistory[weightHistory.length - 1]
      : profileData?.weight || "--";

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.6, staggerChildren: 0.15 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-light flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
      <div className="container mx-auto px-4">
        <motion.h1 variants={item} className="text-4xl font-bold mb-8">
          My Profile
        </motion.h1>

        {error && (
          <motion.div
            variants={item}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {membership && (
          <motion.div
            variants={item}
            className={`p-4 rounded-lg mb-8 border-l-4 ${
              membership.paymentMethod?.includes("dummy")
                ? "bg-yellow-50 border-yellow-400"
                : "bg-green-50 border-green-400"
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">
                  {membership.planName}
                  {membership.paymentMethod?.includes("dummy") && (
                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                      TEST MODE
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  {membership.accessLevel?.toUpperCase()} access • Expires{" "}
                  {new Date(membership.expiresAt).toLocaleDateString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  membership.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {membership.status?.toUpperCase()}
              </span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: "Total Workouts",
              value: totalWorkouts,
              color: "text-red-600",
            },
            {
              title: "Current Streak 🔥",
              value: `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`,
              color: "text-orange-600",
            },
            {
              title: "Latest Weight",
              value: `${latestWeight} kg`,
              color: "text-blue-600",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={{ y: -4 }}
              className="card"
            >
              <h3 className="text-gray-600 text-sm">{stat.title}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={item} className="card">
            <h2 className="text-2xl font-bold mb-4">Weight Tracking</h2>

            <div className="flex gap-3 mb-4">
              <input
                type="number"
                step="0.1"
                placeholder="Enter weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWeight()}
                className="border p-2 rounded w-full focus:ring-2 focus:ring-red-500 outline-none"
                disabled={weightLoading}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                onClick={addWeight}
                disabled={weightLoading}
                className="bg-red-600 text-white px-4 rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {weightLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  "Add"
                )}
              </motion.button>
            </div>

            {weightHistory.length > 0 ? (
              <div className="space-y-2 text-sm text-gray-700">
                {[...weightHistory].reverse().map((w, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <span className="text-gray-500">
                      #{weightHistory.length - i}
                    </span>
                    <span className="font-semibold">{w} kg</span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No weight entries yet
              </p>
            )}
          </motion.div>

          <motion.div variants={item} className="card">
            <h2 className="text-2xl font-bold mb-4">Personal Records</h2>

            {personalRecords.some((pr) => pr.weight > 0) ? (
              <div className="space-y-3">
                {personalRecords.map((pr, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium">{pr.name}</span>
                    <span className="text-xl font-bold text-red-600">
                      {pr.weight > 0 ? `${pr.weight}kg` : "—"}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">No personal records yet</p>
                <p className="text-sm text-gray-400">
                  Complete workouts with weights to track your PRs
                </p>
              </div>
            )}
          </motion.div>
        </div>

        <motion.div variants={item} className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="form-input"
                  value={
                    formData.dateOfBirth
                      ? formData.dateOfBirth.split("T")[0]
                      : ""
                  }
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  name="gender"
                  className="form-input"
                  value={formData.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input bg-gray-100"
                value={formData.email || ""}
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
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
