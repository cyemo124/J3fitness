import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trainerAPI, adminAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Award,
  Clock,
  Mail,
  Phone,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function AdminTrainerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTrainerDetails();
  }, [id]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const response = await trainerAPI.getById(id);
      setTrainer(response.data);
    } catch (err) {
      setError("Failed to load trainer details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminAPI.deleteTrainer(id);
      setShowDeleteModal(false);
      navigate("/admin/trainers");
    } catch (err) {
      setError(err.message || "Failed to delete trainer");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !trainer) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light py-12">
          <div className="container mx-auto px-4">
            <div className="card p-8 text-center">
              <p className="text-red-600 mb-4">
                {error || "Trainer not found"}
              </p>
              <button
                onClick={() => navigate("/admin/trainers")}
                className="bg-red-600 text-white px-6 py-2 rounded-lg"
              >
                Back to Trainers
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/admin/trainers")}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Trainers
          </motion.button>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden"
          >
            {/* Header */}
            <div className="h-64 bg-gradient-to-r from-red-600 to-red-800 relative">
              {trainer.userId?.profileImage ? (
                <img
                  src={trainer.userId.profileImage}
                  alt=""
                  className="w-full h-full object-cover opacity-30"
                />
              ) : (
                <div className="w-full h-full bg-red-700" />
              )}

              <div className="absolute -bottom-16 left-8 flex items-end">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl overflow-hidden">
                  {trainer.profileImage?.url ? (
                    <img
                      src={trainer.profileImage.url}
                      alt={`${trainer.userId?.firstName} ${trainer.userId?.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-4xl">
                      {trainer.userId?.firstName?.[0]}
                      {trainer.userId?.lastName?.[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-dark mb-2">
                    {trainer.userId?.firstName} {trainer.userId?.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {trainer.userId?.email || "No email"}
                    </span>
                    {trainer.userId?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {trainer.userId.phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 md:mt-0">
                  <button
                    onClick={() => navigate(`/admin/trainers/${id}/edit`)}
                    className="px-6 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    Edit Trainer
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-dark">
                    {trainer.rating || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Rating ({trainer.reviewCount || 0} reviews)
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-dark">
                    {trainer.experience}
                  </p>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Award className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-dark">
                    ₦{trainer.monthlyRate?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Rate</p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-dark mb-3">About</h3>
                <p className="text-gray-600 leading-relaxed">
                  {trainer.bio || "No bio available"}
                </p>
              </div>

              {/* Specializations */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-dark mb-3">
                  Specializations
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.specializations?.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              {trainer.certifications?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-dark mb-3">
                    Certifications
                  </h3>
                  <ul className="space-y-2">
                    {trainer.certifications.map((cert, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-600"
                      >
                        <Award className="w-4 h-4 text-green-500" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Additional Info */}
              <div className="border-t pt-6 text-sm text-gray-500">
                <p>
                  Member since:{" "}
                  {new Date(trainer.createdAt).toLocaleDateString()}
                </p>
                <p>Status: {trainer.isActive ? "Active" : "Inactive"}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>

                <h3 className="text-2xl font-bold text-dark mb-2">
                  Delete Trainer?
                </h3>

                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-dark">
                    {trainer.userId?.firstName} {trainer.userId?.lastName}
                  </span>
                  ?
                </p>

                <p className="text-sm text-red-500 mb-6">
                  This will also delete their profile image from Cloudinary.
                  This action cannot be undone.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
