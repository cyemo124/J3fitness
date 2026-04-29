import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { adminAPI } from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";

import ImageWithFallback from "../../components/ImageWithFallBack";

export default function AdminClassesPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    classId: null,
    className: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, [page]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getClasses(page, 12);
      // Handle nested data structure
      const classesData = response.data?.data || response.data || [];
      setClasses(classesData);
      setPagination(response.data?.pagination || response.pagination || {});
    } catch (error) {
      setError("Failed to load classes");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (cls) => {
    setDeleteModal({ isOpen: true, classId: cls._id, className: cls.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, classId: null, className: "" });
  };

  const confirmDelete = async () => {
    if (!deleteModal.classId) return;

    setDeleteLoading(true);
    try {
      await adminAPI.deleteClass(deleteModal.classId);
      closeDeleteModal();
      fetchClasses();
    } catch (err) {
      setError("Failed to delete class");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format price with Naira symbol and commas
  const formatPrice = (price) => {
    if (!price && price !== 0) return "₦0";
    return `₦${price.toLocaleString()}`;
  };

  const getCapacityStatus = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 100)
      return { text: "FULL", color: "bg-red-100 text-red-800" };
    if (percentage >= 80)
      return { text: "Almost Full", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Available", color: "bg-green-100 text-green-800" };
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-dark mb-2">
              Class Management
            </h1>
            <p className="text-gray-600">Create and manage gym classes</p>
          </div>

          <button
            onClick={() => navigate("/admin/classes/new")}
            className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-700 transition"
          >
            + Create Class
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : classes.length > 0 ? (
          <>
            {/* Classes Grid */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {classes.map((cls, index) => {
                const capacityStatus = getCapacityStatus(
                  cls.currentEnrollment,
                  cls.capacity,
                );
                const isFull = cls.currentEnrollment >= cls.capacity;

                return (
                  <motion.div
                    key={cls._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    className="card border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
                  >
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

                    <h3 className="text-xl font-bold mb-2 text-dark">
                      {cls.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {cls.description}
                    </p>

                    <div className="space-y-1 text-sm mb-4 text-gray-600">
                      <p>
                        <span className="font-semibold text-dark">
                          Category:
                        </span>{" "}
                        {cls.category}
                      </p>
                      <p>
                        <span className="font-semibold text-dark">Level:</span>{" "}
                        {cls.level}
                      </p>
                      <p>
                        <span className="font-semibold text-dark">Price:</span>{" "}
                        <span className="text-red-600 font-bold">
                          {formatPrice(cls.price)}
                        </span>
                      </p>
                      <p>
                        <span className="font-semibold text-dark">
                          Trainer:
                        </span>{" "}
                        {cls.trainerId?.userId?.firstName}{" "}
                        {cls.trainerId?.userId?.lastName || "N/A"}
                      </p>
                      <p>
                        <span className="font-semibold text-dark">
                          Schedule:
                        </span>{" "}
                        {cls.schedule?.dayOfWeek}, {cls.schedule?.startTime}
                      </p>
                      <p>
                        <span className="font-semibold text-dark">
                          Capacity:
                        </span>{" "}
                        {cls.currentEnrollment}/{cls.capacity}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/admin/classes/${cls._id}`)}
                        className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-600 hover:text-white transition"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(cls)}
                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex justify-center items-center gap-4"
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="card border border-gray-200 rounded-lg text-center py-12 shadow-sm"
          >
            <p className="text-gray-600 text-lg mb-4">No classes found</p>

            <button
              onClick={() => navigate("/admin/classes/new")}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Create First Class
            </button>
          </motion.div>
        )}
      </div>

      {/* Premium Delete Modal */}
      <AnimatePresence>
        {deleteModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeDeleteModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🗑️</span>
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">
                  Delete Class?
                </h3>
                <p className="text-gray-600">
                  Are you sure you want to delete{" "}
                  <strong>"{deleteModal.className}"</strong>? This action cannot
                  be undone. All related bookings will also be deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Deleting...
                    </>
                  ) : (
                    "Delete Class"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
