import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { classAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import ImageWithFallback from "../components/ImageWithFallBack";

const CATEGORIES = [
  "Yoga",
  "Cardio",
  "Strength",
  "Pilates",
  "CrossFit",
  "Dance",
  "Boxing",
  "Swimming",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    level: "",
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchClasses();
  }, [filters]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await classAPI.getAll(filters.page, filters.limit, {
        category: filters.category,
        level: filters.level,
      });
      setClasses(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError("Failed to load classes. Please try again.");
      console.error("Error fetching classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = (classId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(`/classes/${classId}`);
  };

  const getCapacityStatus = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 100)
      return { text: "FULL", color: "bg-red-100 text-red-800" };
    if (percentage >= 80)
      return { text: "Almost Full", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Available", color: "bg-green-100 text-green-800" };
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";
    return `₦${price.toLocaleString()}`;
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-dark mb-2 text-center">Our Classes</h1>
            <p className="text-gray-600 text-center">
              Discover our wide range of fitness classes
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="card mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-4">Filter Classes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input form-select"
                  value={filters.category}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      category: e.target.value,
                      page: 1,
                    })
                  }
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Level</label>
                <select
                  className="form-input form-select"
                  value={filters.level}
                  onChange={(e) =>
                    setFilters({ ...filters, level: e.target.value, page: 1 })
                  }
                >
                  <option value="">All Levels</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="flex justify-center items-center min-h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : classes.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600 text-lg">
                No classes found. Try adjusting your filters.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.25 },
                  },
                }}
              >
                {classes.map((cls) => {
                  const capacityStatus = getCapacityStatus(
                    cls.currentEnrollment,
                    cls.capacity,
                  );
                  const isFull = cls.currentEnrollment >= cls.capacity;

                  return (
                    <motion.div
                      key={cls._id}
                      className="card hover:shadow-lg transition-shadow"
                      variants={{
                        hidden: { opacity: 0, y: 30 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          transition: { duration: 0.45 },
                        },
                      }}
                      whileHover={{ y: -6, scale: 1.02 }}
                    >
                      {/* FIXED IMAGE - No more flickering! */}
                      <div className="relative mb-4 overflow-hidden rounded-lg h-48 group">
                        <ImageWithFallback
                          src={cls.image}
                          alt={cls.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        <div className="absolute top-2 right-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${capacityStatus.color}`}
                          >
                            {capacityStatus.text}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-dark mb-2">
                        {cls.name}
                      </h3>

                      {cls.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {cls.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-600 mb-3">
                        👤 {cls.trainerId?.userId?.firstName}{" "}
                        {cls.trainerId?.userId?.lastName || "Unknown Trainer"}
                      </p>

                      <div className="flex gap-2 mb-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {cls.category}
                        </span>
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                          {cls.level}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-semibold">Capacity</span>
                          <span>
                            {cls.currentEnrollment}/{cls.capacity}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className="bg-primary h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(
                                (cls.currentEnrollment / cls.capacity) * 100,
                                100,
                              )}%`,
                            }}
                            transition={{ duration: 0.6 }}
                          />
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 mb-4">
                        <p>📅 {cls.schedule?.dayOfWeek}</p>
                        <p>
                          ⏰ {cls.schedule?.startTime} - {cls.schedule?.endTime}
                        </p>
                        <p>📍 {cls.location}</p>
                      </div>

                      <motion.button
                        onClick={() => handleBooking(cls._id)}
                        disabled={isFull}
                        whileTap={!isFull ? { scale: 0.95 } : {}}
                        whileHover={!isFull ? { scale: 1.03 } : {}}
                        transition={{ duration: 0.2 }}
                        className={`w-full py-2 rounded font-semibold text-white ${
                          isFull
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        {isFull ? "Class Full" : "View Details"}
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <motion.div
                  className="flex justify-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    className="btn btn-secondary"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page - 1 })
                    }
                  >
                    Previous
                  </button>

                  <span className="flex items-center px-4">
                    Page {filters.page} of {pagination.pages}
                  </span>

                  <button
                    className="btn btn-secondary"
                    disabled={filters.page === pagination.pages}
                    onClick={() =>
                      setFilters({ ...filters, page: filters.page + 1 })
                    }
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
