import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI, trainerAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion } from "framer-motion";

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

export default function AdminCreateClassPage() {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const response = await trainerAPI.getAll(1, 100);
      const trainersData = response.data?.data || response.data || [];
      setTrainers(trainersData);
      if (trainersData.length > 0) {
        setFormData((prev) => ({ ...prev, trainerId: trainersData[0]._id }));
      }
    } catch (err) {
      console.error("Error fetching trainers:", err);
      setError("Failed to load trainers. Please refresh.");
    }
  };

  // Handle number inputs properly - allow empty string temporarily
  const handleNumberInput = (e, fieldPath) => {
    const { value } = e.target;
    const numValue = value === "" ? "" : parseInt(value) || 0;

    if (fieldPath.includes("schedule.")) {
      const field = fieldPath.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [field]: numValue },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [fieldPath]: numValue }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("schedule.")) {
      const scheduleField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        schedule: { ...prev.schedule, [scheduleField]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setImageFile(file);
    setError(""); // Clear error

    // Create preview
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

    // Minimum loading time (1.5 seconds) so users see "Creating..."
    const minLoadingTime = new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      if (!formData.trainerId) {
        throw new Error("Please select a trainer");
      }

      const start = new Date(`2000-01-01T${formData.schedule.startTime}`);
      const end = new Date(`2000-01-01T${formData.schedule.endTime}`);
      const durationMs = end - start;
      const durationMinutes = Math.round(durationMs / 60000);

      // Set default image if none provided
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = imagePreview;
      } else if (!imageUrl) {
        const defaultImages = {
          Yoga: "/yoga.png",
          Cardio: "/cardio.png",
          Strength: "/strength.png",
          Pilates: "/pilates.png",
          CrossFit: "/crossfit.png",
          Dance: "/dance.png",
          Boxing: "/boxing.png",
          Swimming: "/swimming.png",
        };
        imageUrl = defaultImages[formData.category] || "/default-class.png";
      }

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

      // Run both the API call and minimum timer, wait for both
      const [response] = await Promise.all([
        adminAPI.createClass(payload),
        minLoadingTime,
      ]);

      setSuccess("Class created successfully!");

      setTimeout(() => {
        navigate("/admin/classes");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
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
            <h1 className="text-4xl font-bold text-dark mb-2">
              Create New Class
            </h1>
            <p className="text-gray-600">
              Add a new fitness class to the schedule
            </p>
          </motion.div>

          {/* Messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center gap-2"
            >
              <span>✅</span>
              {success}
            </motion.div>
          )}

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                    placeholder="e.g., Morning Yoga Flow"
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
                    placeholder="Describe the class..."
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    {LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trainer - No placeholder option, first trainer selected by default */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-dark mb-4">Trainer</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Trainer *
                  </label>
                  {trainers.length === 0 ? (
                    <p className="text-red-600">
                      No trainers available. Please create a trainer first.
                    </p>
                  ) : (
                    <select
                      name="trainerId"
                      required
                      value={formData.trainerId}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      {trainers.map((trainer) => (
                        <option key={trainer._id} value={trainer._id}>
                          {trainer.userId?.firstName} {trainer.userId?.lastName}
                          ({trainer.specializations?.join(", ") || "General"})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="border-t pt-6">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
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
              <div className="border-t pt-6">
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
                      placeholder="e.g., Studio A"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t pt-6">
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
                    <div className="relative w-48 h-32 rounded-lg overflow-hidden">
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
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Max file size: 5MB. Recommended: 800x600px
                  </p>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t pt-6">
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

              {/* Submit Buttons with Loading State */}
              <div className="border-t pt-6 flex gap-4">
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
                  disabled={loading || trainers.length === 0}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    "Create Class"
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
