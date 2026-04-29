import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trainerAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrainers();
  }, [page]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await trainerAPI.getAll(page, 12);
      setTrainers(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError("Failed to load trainers. Please try again.");
      console.error("Error fetching trainers:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingStars = (rating) => {
    return "⭐".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "✨" : "");
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
            <h1 className="text-4xl font-bold text-dark mb-2">Our Trainers</h1>
            <p className="text-gray-600">
              Meet our certified and experienced fitness trainers
            </p>
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
          ) : trainers.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600 text-lg">
                No trainers available at the moment.
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
                {trainers.map((trainer) => (
                  <motion.div
                    key={trainer._id}
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
                    {/* Image - Face-focused Cloudinary transformation */}
                    <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-200 h-48">
                      <img
                        src={
                          trainer.profileImage?.faceUrl ||
                          trainer.profileImage?.url ||
                          trainer.userId?.profileImage ||
                          "/default-trainer.png"
                        }
                        alt={`${trainer.userId?.firstName} ${trainer.userId?.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-dark mb-1">
                      {trainer.userId?.firstName} {trainer.userId?.lastName}
                    </h3>

                    {trainer.bio && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {trainer.bio}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="mb-3">
                      <div className="flex items-center gap-1 mb-1">
                        {getRatingStars(trainer.rating)}
                        <span className="text-sm text-gray-600">
                          ({trainer.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    {/* Specializations */}
                    {trainer.specializations?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">
                          SPECIALIZATIONS
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {trainer.specializations
                            .slice(0, 3)
                            .map((spec, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                              >
                                {spec}
                              </span>
                            ))}
                          {trainer.specializations.length > 3 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
                              +{trainer.specializations.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="space-y-2 mb-4 text-sm border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Experience</span>
                        <span className="font-semibold">
                          {trainer.experience} years
                        </span>
                      </div>

                      {trainer.monthlyRate > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Monthly Rate</span>
                          <span className="font-semibold">
                            ₦{trainer.monthlyRate.toLocaleString()}/month
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    <motion.button
                      onClick={() => navigate(`/trainers/${trainer._id}`)}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700"
                    >
                      View Profile
                    </motion.button>
                  </motion.div>
                ))}
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
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </button>

                  <span className="flex items-center px-4">
                    Page {page} of {pagination.pages}
                  </span>

                  <button
                    className="btn btn-secondary"
                    disabled={page === pagination.pages}
                    onClick={() => setPage(page + 1)}
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
