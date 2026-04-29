import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, bookingAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("upcoming");
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  const FILTERS = ["upcoming", "completed", "cancelled"];
  const STATUS_COLORS = {
    upcoming: "bg-red-600 text-white",
    completed: "bg-green-600 text-white",
    cancelled: "bg-gray-400 text-white",
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userAPI.getBookings(
        filter === "all" ? null : filter,
      );
      setBookings(response.data);
    } catch (err) {
      setError("Failed to load bookings. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;

    try {
      setCancellingId(id);
      await bookingAPI.cancel(id);
      setBookings(
        bookings.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch (err) {
      setError("Failed to cancel booking.");
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const formatTime = (time) =>
    new Date(`2000-01-01 ${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  // 🔥 Animations
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.1 },
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
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
        <motion.div variants={item} className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-dark mb-2">My Schedule</h1>
          <p className="text-gray-600">
            View and manage your upcoming and past classes
          </p>
        </motion.div>

        {/* 🔥 Filters */}
        <motion.div variants={item} className="flex justify-center gap-4 mb-8">
          {FILTERS.map((f) => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 text-center">
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <motion.div variants={item} className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No bookings found</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/classes")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Browse Classes
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {bookings.map((b) => (
                <motion.div
                  key={b._id}
                  variants={item}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  whileHover={{ y: -3 }}
                  className="card border p-4 rounded-lg shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    {/* Class Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                          🎯
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-dark">
                            {b.classId?.name || "Class Name"}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {formatDate(b.classDate)} |{" "}
                            {formatTime(b.classId?.schedule?.startTime)} -{" "}
                            {formatTime(b.classId?.schedule?.endTime)}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {b.classId?.location || "Location"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:items-end">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          STATUS_COLORS[b.status] || "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {b.status.toUpperCase()}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/classes/${b.classId?._id}`)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        View Class
                      </motion.button>

                      {b.status === "upcoming" && (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelBooking(b._id)}
                          disabled={cancellingId === b._id}
                          className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                        >
                          {cancellingId === b._id ? "Cancelling..." : "Cancel"}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
