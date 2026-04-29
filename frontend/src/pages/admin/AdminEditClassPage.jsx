import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminAPI, classAPI, trainerAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "Yoga",
  "Cardio",
  "Strength",
  "Pilates",
  "CrossFit",
  "Dance",
  "Boxing",
  "Swimming",
  "Other",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const FormSkeleton = () => (
  <div className="card animate-pulse">
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="md:col-span-2 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="border-t pt-6 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
      <div className="border-t pt-6 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex gap-4 pt-6 border-t">
        <div className="flex-1 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 h-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

export default function AdminEditClassPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Yoga",
    level: "Beginner",
    trainerId: "",
    schedule: {
      dayOfWeek: "Monday",
      startTime: "09:00",
      endTime: "10:00",
      duration: 60,
    },
    capacity: 20,
    price: 5000,
    location: "Main Gym",
    image: "",
    maxBookingsPerUser: 1,
    cancellationDeadlineHours: 24,
    isActive: true,
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    setFetchLoading(true);
    setError("");

    try {
      const [classRes, trainersRes] = await Promise.all([
        classAPI.getById(id),
        trainerAPI.getAll(1, 100),
      ]);

      const classData = classRes?.data?.data || classRes?.data || classRes;

      if (classData) {
        const formatTime = (t) => (t ? t.substring(0, 5) : "09:00");

        setFormData({
          name: classData.name || "",
          description: classData.description || "",
          category: classData.category || "Yoga",
          level: classData.level || "Beginner",
          trainerId: classData.trainerId?._id || classData.trainerId || "",
          schedule: {
            dayOfWeek: classData.schedule?.dayOfWeek || "Monday",
            startTime: formatTime(classData.schedule?.startTime),
            endTime: formatTime(classData.schedule?.endTime),
            duration: classData.schedule?.duration || 60,
          },
          capacity: classData.capacity || 20,
          price: classData.price || 0,
          location: classData.location || "Main Gym",
          image: classData.image || "",
          maxBookingsPerUser: classData.maxBookingsPerUser || 1,
          cancellationDeadlineHours: classData.cancellationDeadlineHours || 24,
          isActive: classData.isActive !== false,
        });

        if (classData.image) setImagePreview(classData.image);
      }

      const trainersData =
        trainersRes?.data?.data || trainersRes?.data || trainersRes || [];
      setTrainers(trainersData);
    } catch (err) {
      setError("Failed to load class data.");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleNumberInput = (e, fieldPath) => {
    setIsDirty(true);
    const value = parseInt(e.target.value) || 0;

    if (fieldPath.includes("schedule.")) {
      const field = fieldPath.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldPath]: value }));
    }
  };

  const handleChange = (e) => {
    setIsDirty(true);
    const { name, value, type, checked } = e.target;

    if (name.includes("schedule.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageChange = (e) => {
    setIsDirty(true);
    const file = e.target.files[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!formData.trainerId) {
        throw new Error("Please select a trainer");
      }

      const start = new Date(`2000-01-01T${formData.schedule.startTime}`);
      const end = new Date(`2000-01-01T${formData.schedule.endTime}`);
      const durationMinutes = Math.round((end - start) / 60000);

      let imageUrl = formData.image;
      if (imageFile) imageUrl = imagePreview;

      const payload = {
        ...formData,
        image: imageUrl,
        schedule: {
          ...formData.schedule,
          duration: durationMinutes > 0 ? durationMinutes : 60,
        },
        capacity: Number(formData.capacity) || 20,
        price: Number(formData.price) || 0,
        maxBookingsPerUser: Number(formData.maxBookingsPerUser) || 1,
        cancellationDeadlineHours:
          Number(formData.cancellationDeadlineHours) || 24,
      };

      await adminAPI.updateClass(id, payload);

      setSuccess("Class updated successfully!");
      setIsDirty(false);

      setTimeout(() => {
        navigate("/admin/classes");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to update class");
      setLoading(false); // Only reset on error
    }
  };

  if (fetchLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <FormSkeleton />
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2"
              >
                <span>✅</span>
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate("/admin/classes")}
              className="text-gray-600 hover:text-red-600 mb-4 flex items-center gap-2 transition"
            >
              ← Back to Classes
            </button>
            <h1 className="text-4xl font-bold text-dark mb-2">Edit Class</h1>
            <p className="text-gray-600">Update class details and schedule</p>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level *
                  </label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                  >
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trainer */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">Trainer</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Trainer *
                  </label>
                  {trainers.length === 0 ? (
                    <p className="text-red-600">No trainers available.</p>
                  ) : (
                    <select
                      name="trainerId"
                      required
                      value={formData.trainerId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                    >
                      <option value="">Select a trainer...</option>
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.userId?.firstName} {trainer.userId?.lastName}{" "}
                          ({trainer.specializations?.join(", ") || "General"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">Schedule</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day *
                    </label>
                    <select
                      name="schedule.dayOfWeek"
                      required
                      value={formData.schedule.dayOfWeek}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none bg-white"
                    >
                      {DAYS.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="schedule.startTime"
                      required
                      value={formData.schedule.startTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="schedule.endTime"
                      required
                      value={formData.schedule.endTime}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Capacity & Pricing */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">
                  Capacity & Pricing
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity *
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      min="1"
                      required
                      value={formData.capacity}
                      onChange={(e) => handleNumberInput(e, "capacity")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₦) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => handleNumberInput(e, "price")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">
                  Class Image
                </h3>
                <div className="space-y-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />

                  {imagePreview && (
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden group">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">
                  Advanced Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Bookings Per User
                    </label>
                    <input
                      type="number"
                      name="maxBookingsPerUser"
                      min="1"
                      value={formData.maxBookingsPerUser}
                      onChange={(e) =>
                        handleNumberInput(e, "maxBookingsPerUser")
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cancellation Deadline (hours)
                    </label>
                    <input
                      type="number"
                      name="cancellationDeadlineHours"
                      min="0"
                      value={formData.cancellationDeadlineHours}
                      onChange={(e) =>
                        handleNumberInput(e, "cancellationDeadlineHours")
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Class is active
                    </span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons - Working Logic */}
              <div className="border-t border-gray-200 pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/admin/classes")}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || trainers.length === 0 || !isDirty}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    "Update Class"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
