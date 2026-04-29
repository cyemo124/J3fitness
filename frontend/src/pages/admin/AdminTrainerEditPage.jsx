import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { trainerAPI, adminAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";
import { ArrowLeft, Upload, X } from "lucide-react";

export default function AdminTrainerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trainer, setTrainer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    bio: "",
    experience: 0,
    monthlyRate: 0,
    specializations: "",
    certifications: "",
    isActive: true,
  });

  // Image upload states
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    fetchTrainerDetails();
  }, [id]);

  const fetchTrainerDetails = async () => {
    try {
      setLoading(true);
      const response = await trainerAPI.getById(id);
      const trainerData = response.data;
      setTrainer(trainerData);

      // Populate form
      setFormData({
        bio: trainerData.bio || "",
        experience: trainerData.experience || 0,
        monthlyRate: trainerData.monthlyRate || 0,
        specializations: (trainerData.specializations || []).join(", "),
        certifications: (trainerData.certifications || []).join(", "),
        isActive: trainerData.isActive ?? true,
      });

      // Set current image
      setCurrentImage(trainerData.profileImage?.url || "");
    } catch (err) {
      setError("Failed to load trainer details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

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

      // Pass imageFile to API if selected
      await adminAPI.updateTrainer(id, payload, imageFile);

      setSuccess("Trainer updated successfully!");
      setTimeout(() => {
        navigate(`/admin/trainers/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update trainer");
    } finally {
      setSaving(false);
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

  if (error && !trainer) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light py-12">
          <div className="container mx-auto px-4">
            <div className="card p-8 text-center">
              <p className="text-red-600 mb-4">{error}</p>
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
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(`/admin/trainers/${id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Details
          </motion.button>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold text-dark mb-2">
                Edit Trainer Profile
              </h1>
              <p className="text-gray-600">
                {trainer?.userId?.firstName} {trainer?.userId?.lastName}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded text-green-700">
                {success}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="border-t border-b border-gray-200 py-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Photo
                </label>

                <div className="flex items-start gap-4">
                  {/* Current or Preview Image */}
                  <div className="relative">
                    {imagePreview ? (
                      // New image preview
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-red-500 shrink-0 relative">
                        <img
                          src={imagePreview}
                          alt="New Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={clearImage}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : currentImage ? (
                      // Existing Cloudinary image
                      <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200 shrink-0">
                        <img
                          src={currentImage}
                          alt="Current"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      // Placeholder
                      <div className="w-32 h-32 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 shrink-0">
                        <span className="text-3xl">👤</span>
                      </div>
                    )}
                  </div>

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
                      Max file size: 5MB. Leave empty to keep current image.
                    </p>
                  </div>
                </div>
              </div>

              {/* Experience & Rate */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience (years)
                  </label>
                  <input
                    type="number"
                    name="experience"
                    min="0"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Rate (₦)
                  </label>
                  <input
                    type="number"
                    name="monthlyRate"
                    min="0"
                    value={formData.monthlyRate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Brief description of the trainer..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              {/* Specializations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  name="specializations"
                  value={formData.specializations}
                  onChange={handleChange}
                  placeholder="Yoga, HIIT, Strength Training..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications (comma separated)
                </label>
                <input
                  type="text"
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  placeholder="NASM, ACE, Yoga Alliance..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  Active Trainer
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate(`/admin/trainers/${id}`)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
