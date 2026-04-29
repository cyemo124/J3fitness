// frontend/src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flame, Calendar, Dumbbell, CreditCard } from "lucide-react";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dashboard data from backend
  const [membershipInfo, setMembershipInfo] = useState(null);
  const [streak, setStreak] = useState(0);
  const [missedWorkout, setMissedWorkout] = useState(false);
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Dismissed alert tracking (key includes date so it resets on new missed workout)
  const [dismissedAlert, setDismissedAlert] = useState(() => {
    const stored = localStorage.getItem("dismissedMissedWorkout");
    const today = new Date().toDateString();
    // Only restore if dismissed today (new missed workout = new date = alert shows)
    return stored === today ? true : false;
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getDashboard();
        const data = response?.data?.data;

        if (data) {
          setMembershipInfo(data.membership);
          setStreak(data.streak || 0);
          setMissedWorkout(data.missedWorkout || false);
          setTodayWorkout(data.todayWorkout);
          setRecentActivity(data.recentActivity || []);
          setRecentBookings(data.recentBookings || []);
        }
      } catch (error) {
        console.error("Dashboard error:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const dismissAlert = () => {
    setDismissedAlert(true);
    localStorage.setItem("dismissedMissedWorkout", new Date().toDateString());
  };

  // Clear dismissal when missedWorkout changes (new missed workout = show alert)
  useEffect(() => {
    if (missedWorkout) {
      const stored = localStorage.getItem("dismissedMissedWorkout");
      const today = new Date().toDateString();
      if (stored !== today) {
        setDismissedAlert(false);
      }
    }
  }, [missedWorkout]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4">
          {/* HEADER */}
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-dark">
              Welcome, {user?.firstName || "Member"}!
            </h1>

            <motion.button
              onClick={logout}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              Logout
            </motion.button>
          </motion.div>

          {/* MISSED WORKOUT ALERT - Dismissible */}
          <AnimatePresence>
            {missedWorkout && !dismissedAlert && (
              <motion.div
                className="bg-red-100 text-red-700 p-4 rounded-lg mb-6 flex justify-between items-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <span>You missed your last workout 👀 Stay consistent!</span>
                <button
                  onClick={dismissAlert}
                  className="ml-4 p-1 hover:bg-red-200 rounded-full transition"
                  title="Dismiss until next missed workout"
                >
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TOP STATS */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[
              {
                title: "Membership Status",
                value:
                  membershipInfo?.status === "active" ? "Active" : "Inactive",
                color:
                  membershipInfo?.status === "active"
                    ? "text-green-600"
                    : "text-red-600",
                icon: CreditCard,
              },
              {
                title: "Classes Booked",
                value: recentBookings?.length || 0,
                color: "text-blue-600",
                icon: Calendar,
              },
              {
                title: "Streak",
                value: `${streak} days`,
                color: "text-orange-600",
                icon: Flame,
              },
              {
                title: "Expiry Date",
                value: membershipInfo?.expiryDate
                  ? new Date(membershipInfo.expiryDate).toLocaleDateString()
                  : "N/A",
                color: "text-gray-600",
                icon: Calendar,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <h3 className="text-gray-600 text-sm">{item.title}</h3>
                </div>
                <p className={`text-2xl font-bold ${item.color || ""}`}>
                  {item.value}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* MAIN GRID */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            {/* ROUTINE BUILDER */}
            <motion.div
              className="card"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold">Build Your Routine</h2>
              </div>
              <p className="mb-4 text-gray-600">
                Create a weekly workout routine and track your exercises
              </p>
              <Link
                to="/routines"
                className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
              >
                Go to Routine Builder
              </Link>
            </motion.div>

            {/* TODAY'S WORKOUT */}
            <motion.div
              className="card"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Flame className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold">Today's Workout</h2>
              </div>

              {todayWorkout ? (
                <>
                  <p className="mb-2 font-semibold text-lg">
                    {todayWorkout.name}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {todayWorkout.exercises?.length || 0} exercises planned
                  </p>
                  <Link
                    to="/workout"
                    className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Start Workout
                  </Link>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">
                    No workout planned for today
                  </p>
                  <Link
                    to="/routines"
                    className="inline-block border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                  >
                    Create Routine
                  </Link>
                </div>
              )}
            </motion.div>

            {/* RECENT ACTIVITY */}
            <motion.div
              className="card"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>

              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-sm text-gray-700 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full shrink-0"></div>
                      {activity}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No recent activity. Start your first workout!
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* LOWER GRID */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            {/* RECENT BOOKINGS */}
            <motion.div
              className="card"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Recent Bookings</h2>
              </div>

              {recentBookings?.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="border-b pb-4 last:border-0"
                    >
                      <p className="font-bold text-dark">
                        {booking.classId?.name || "Class"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.classDate
                          ? new Date(booking.classDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Date unavailable"}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-medium ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "completed"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {booking.status || "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No bookings yet</p>
              )}

              <Link
                to="/my-bookings"
                className="inline-block mt-4 border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                View All Bookings
              </Link>
            </motion.div>

            {/* QUICK LINKS */}
            <motion.div
              className="card"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -5 }}
            >
              <h2 className="text-2xl font-bold mb-4">Quick Links</h2>

              <div className="space-y-3">
                {[
                  { to: "/workout", label: "Start Workout", icon: Dumbbell },
                  { to: "/routines", label: "View Routines", icon: Calendar },
                  { to: "/profile", label: "Edit Profile", icon: CreditCard },
                  { to: "/classes", label: "Browse Classes", icon: Calendar },
                  {
                    to: "/membership",
                    label: "Renew Membership",
                    icon: CreditCard,
                  },
                ].map((link, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={link.to}
                      className="flex items-center gap-3 border border-gray-300 px-4 py-3 rounded-lg hover:bg-gray-100 transition"
                    >
                      <link.icon className="w-5 h-5 text-gray-500" />
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
