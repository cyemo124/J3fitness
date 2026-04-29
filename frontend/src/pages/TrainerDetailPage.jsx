import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trainerAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  Award,
  Clock,
  Calendar,
  CheckCircle,
} from "lucide-react";

export default function TrainerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                onClick={() => navigate("/trainers")}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Browse Trainers
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const fullName =
    `${trainer.userId?.firstName || ""} ${trainer.userId?.lastName || ""}`.trim();

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back to Trainers */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/trainers")}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Trainers
          </motion.button>

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card overflow-hidden mb-8"
          >
            <div className="h-48 bg-gradient-to-r from-red-600 to-red-800 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-xl overflow-hidden">
                  {trainer.profileImage?.url ? (
                    <img
                      src={trainer.profileImage.url}
                      alt={fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-3xl font-bold text-gray-500">
                      {trainer.userId?.firstName?.[0]}
                      {trainer.userId?.lastName?.[0]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-20 pb-8 px-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-dark mb-2">
                    {fullName}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-dark">
                      {trainer.rating || 0}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span>{trainer.reviewCount || 0} reviews</span>
                  </div>
                </div>

                {/* Book Trainer CTA */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-2xl font-bold text-red-600">
                    ₦{trainer.monthlyRate?.toLocaleString() || 0}
                    <span className="text-sm text-gray-500 font-normal">
                      /month
                    </span>
                  </p>
                  <button
                    onClick={() => navigate(`/trainers/${id}/book`)}
                    className="mt-2 px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg hover:shadow-xl"
                    disabled
                  >
                    Book Trainer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="card p-6 text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark">
                {trainer.experience || 0}+
              </p>
              <p className="text-sm text-gray-600">Years Experience</p>
            </div>
            <div className="card p-6 text-center">
              <Calendar className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark">
                {trainer.specializations?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Specializations</p>
            </div>
            <div className="card p-6 text-center">
              <CheckCircle className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-dark">
                {trainer.certifications?.length || 0}
              </p>
              <p className="text-sm text-gray-600">Certifications</p>
            </div>
          </motion.div>

          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-dark mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">
              {trainer.bio || "No bio available."}
            </p>
          </motion.div>

          {/* Specializations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-8 mb-8"
          >
            <h2 className="text-xl font-bold text-dark mb-4">
              Specializations
            </h2>
            <div className="flex flex-wrap gap-3">
              {trainer.specializations?.length > 0 ? (
                trainer.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <p className="text-gray-500">No specializations listed.</p>
              )}
            </div>
          </motion.div>

          {/* Certifications */}
          {trainer.certifications?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-8 mb-8"
            >
              <h2 className="text-xl font-bold text-dark mb-4">
                Certifications
              </h2>
              <ul className="space-y-3">
                {trainer.certifications.map((cert, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-3 text-gray-700"
                  >
                    <Award className="w-5 h-5 text-green-500 flex-shrink-0" />
                    {cert}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-8 text-center bg-gradient-to-r from-red-50 to-red-100 border-red-200"
          >
            <h3 className="text-xl font-bold text-dark mb-2">
              Ready to train with {trainer.userId?.firstName || "this trainer"}?
            </h3>
            <p className="text-gray-600 mb-6">
              Start your fitness journey with personalized training sessions.
            </p>
            <button
              onClick={() => navigate(`/trainers/${id}/book`)}
              className="px-8 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-lg"
              disabled
            >
              Book Now — ₦{trainer.monthlyRate?.toLocaleString() || 0}/month
            </button>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
