import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trainerAPI, adminAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";

export default function MakeTrainersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trainers");
  const [trainers, setTrainers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [approvedApplications, setApprovedApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  // Form states
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    bio: "",
    experience: 0,
    monthlyRate: 0,
    specializations: "",
    certifications: "",
  });

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "trainers") {
      fetchTrainers();
      fetchApprovedApplications();
    }
    if (activeTab === "applications") fetchPendingApplications();
    if (activeTab === "approved") fetchApprovedApplications();
  }, [activeTab, page]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await trainerAPI.getAll(page, 12);
      const trainersData = response.data?.data || response.data || [];
      const paginationData =
        response.data?.pagination || response.pagination || {};
      setTrainers(trainersData);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error fetching trainers:", err);
      setError("Failed to load trainers");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingApplications = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminAPI.getTrainerApplications({ status: "pending" });
      setApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedApplications = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTrainerApplications({ status: "approved" });
      setApprovedApplications(res.data || []);
    } catch (err) {
      console.error("Error fetching approved applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setFormError("");

    // Create preview for display
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Clear image when switching tabs or after submit
  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleCreateTrainer = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        specializations: formData.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: formData.certifications
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      };

      // Pass imageFile separately to API
      await adminAPI.createTrainer(payload, imageFile);

      setSuccessMessage("Trainer created successfully!");
      setFormData({
        userId: "",
        bio: "",
        experience: 0,
        monthlyRate: 0,
        specializations: "",
        certifications: "",
      });
      clearImage();

      setActiveTab("trainers");
      fetchTrainers();
      fetchApprovedApplications();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to create trainer");
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveTrainer(id);
      fetchPendingApplications();
      fetchTrainers();
      fetchApprovedApplications();
    } catch (err) {
      console.error(err);
      setError("Failed to approve application");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminAPI.rejectTrainer(id);
      fetchPendingApplications();
    } catch (err) {
      console.error(err);
      setError("Failed to reject application");
    }
  };

  const getRatingStars = (rating) => {
    return "⭐".repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? "✨" : "");
  };

  const isTrainerFromApplication = (trainer) => {
    if (!trainer.userId?.email || approvedApplications.length === 0)
      return false;
    return approvedApplications.some(
      (app) => app.email === trainer.userId.email,
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4">
          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-dark mb-2">
              Trainer Management
            </h1>
            <p className="text-gray-600">
              Manage trainers, review applications, and create New Trainer
              profiles with photos
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <motion.div
              className="card hover:shadow-lg transition-shadow"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Trainers</p>
                  <p className="text-3xl font-bold text-red-600">
                    {pagination.total || trainers.length}
                  </p>
                </div>
                <span className="text-3xl">👥</span>
              </div>
            </motion.div>

            <motion.div
              className="card hover:shadow-lg transition-shadow"
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    Pending Applications
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {applications.length}
                  </p>
                </div>
                <span className="text-3xl">⏳</span>
              </div>
            </motion.div>

            <motion.div
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => setActiveTab("approved")}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-600 text-sm mb-1">
                    From Applications
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {approvedApplications.length}
                  </p>
                </div>
                <span className="text-3xl">✅</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card mb-8"
          >
            <div className="flex flex-wrap gap-2 p-2">
              {[
                { id: "trainers", label: "All Trainers", icon: "👥" },
                {
                  id: "applications",
                  label: "Pending Applications",
                  icon: "⏳",
                  badge: applications.length,
                },
                {
                  id: "approved",
                  label: "Approved from Applications",
                  icon: "✅",
                },
                { id: "create", label: "Create Trainer", icon: "➕" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id !== "create") clearImage();
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all flex-1 md:flex-none justify-center ${
                    activeTab === tab.id
                      ? "bg-red-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-white text-red-600 text-xs rounded-full px-2 py-0.5 ml-1 font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {/* Trainers Tab */}
            {activeTab === "trainers" && (
              <motion.div
                key="trainers"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0 }}
              >
                {loading ? (
                  <div className="flex justify-center items-center min-h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : trainers.length === 0 ? (
                  <div className="text-center py-12 card">
                    <p className="text-6xl mb-4">👥</p>
                    <h3 className="text-xl font-bold text-dark mb-2">
                      No trainers found
                    </h3>
                    <p className="text-gray-600">
                      Create Your first trainer to get started
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {trainers.map((trainer, index) => (
                        <motion.div
                          key={trainer._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="card hover:shadow-lg transition-shadow relative"
                        >
                          {/* From Application Badge */}
                          {isTrainerFromApplication(trainer) && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-bold z-10">
                              From Application
                            </div>
                          )}

                          {/* Image - UPDATED for Cloudinary */}
                          <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-200 h-48">
                            <img
                              src={
                                trainer.profileImage?.faceUrlLarge ||
                                trainer.profileImage?.faceUrl ||
                                trainer.profileImage?.url
                              }
                              alt={`${trainer.userId?.firstName} ${trainer.userId?.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <h3 className="text-xl font-bold text-dark mb-1">
                            {trainer.userId?.firstName}{" "}
                            {trainer.userId?.lastName}
                          </h3>

                          {trainer.bio && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {trainer.bio}
                            </p>
                          )}

                          {/* Rating */}
                          <div className="mb-3">
                            <div className="flex items-center gap-1 mb-1">
                              <span>{getRatingStars(trainer.rating)}</span>
                              <span className="text-sm text-gray-600">
                                ({trainer.reviewCount || 0} reviews)
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
                                <span className="text-gray-600">
                                  Monthly Rate
                                </span>
                                <span className="font-semibold">
                                  ₦{trainer.monthlyRate.toLocaleString()}/month
                                </span>
                              </div>
                            )}
                          </div>

                          {/* View Details Button */}
                          <button
                            onClick={() =>
                              navigate(`/admin/trainers/${trainer._id}`)
                            }
                            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
                          >
                            View Details
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                      <div className="flex justify-center gap-2">
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
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Pending Applications Tab */}
            {activeTab === "applications" && (
              <motion.div
                key="applications"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0 }}
                className="card"
              >
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">✅</p>
                    <h3 className="text-xl font-bold text-dark mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600">
                      No pending trainer applications to review
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app, index) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="flex gap-4 items-start">
                            <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {app.firstName?.[0]}
                              {app.lastName?.[0]}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-dark">
                                {app.firstName} {app.lastName}
                              </h3>
                              <p className="text-red-600 font-medium text-sm mb-2">
                                {app.email}
                              </p>

                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                  {app.specialization}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                                  {app.experience} years exp
                                </span>
                              </div>

                              {app.bio && (
                                <p className="text-sm text-gray-600 italic">
                                  "{app.bio}"
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <button
                              onClick={() => handleReject(app._id)}
                              className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(app._id)}
                              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Approved Applications Tab */}
            {activeTab === "approved" && (
              <motion.div
                key="approved"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0 }}
                className="card"
              >
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : approvedApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-6xl mb-4">📋</p>
                    <h3 className="text-xl font-bold text-dark mb-2">
                      No approved applications yet
                    </h3>
                    <p className="text-gray-600">
                      Approved applications will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {approvedApplications.map((app, index) => (
                      <motion.div
                        key={app._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border border-green-200 bg-green-50 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4 items-center">
                            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              ✅
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-dark">
                                {app.firstName} {app.lastName}
                              </h3>
                              <p className="text-green-600 font-medium text-sm">
                                {app.email}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded font-bold">
                                  Approved
                                </span>
                                <span className="text-xs text-gray-500">
                                  {app.reviewedAt &&
                                    new Date(
                                      app.reviewedAt,
                                    ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab("trainers")}
                            className="px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg hover:bg-green-100 transition"
                          >
                            View in Trainers
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Create Trainer Form Tab - UPDATED with Image Upload */}
            {activeTab === "create" && (
              <motion.div
                key="create"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                exit={{ opacity: 0 }}
                className="card max-w-2xl mx-auto"
              >
                <div className="mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-dark mb-2">
                    Create New Trainer
                  </h2>
                  <p className="text-gray-600">
                    Manually create a trainer profile for an existing user with
                    photo
                  </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded text-green-700">
                    {successMessage}
                  </div>
                )}

                {/* Error Message */}
                {formError && (
                  <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleCreateTrainer} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.userId}
                      onChange={(e) =>
                        setFormData({ ...formData, userId: e.target.value })
                      }
                      placeholder="e.g. 69d4db4b0fe9bdf90cc88253"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      The MongoDB ObjectId of the existing user
                    </p>
                  </div>

                  {/* Image Upload Section */}
                  <div className="border-t border-b border-gray-200 py-6 my-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Photo
                    </label>

                    <div className="flex items-start gap-4">
                      {/* Image Preview */}
                      {imagePreview ? (
                        <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                          <span className="text-3xl">📷</span>
                        </div>
                      )}

                      {/* Upload Input */}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                          Max file size: 5MB. Recommended: 400x400px square
                          image
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (years)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            experience: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Rate (₦)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.monthlyRate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyRate: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="Brief description of the trainer..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.specializations}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specializations: e.target.value,
                        })
                      }
                      placeholder="Yoga, HIIT, Strength Training..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Certifications (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.certifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          certifications: e.target.value,
                        })
                      }
                      placeholder="NASM, ACE, Yoga Alliance..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => setActiveTab("trainers")}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                    >
                      {formLoading ? "Creating..." : "Create Trainer"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
