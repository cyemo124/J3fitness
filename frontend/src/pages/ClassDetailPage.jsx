import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { classAPI, bookingAPI, userAPI } from "../services/api"; // CHANGED: added userAPI
import { motion, AnimatePresence } from "framer-motion"; // CHANGED: added AnimatePresence
import ImageWithFallBack from "../components/ImageWithFallBack";
import PageWrapper from "../components/PageWrapper";

export default function ClassDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // NEW: Payment & enrollment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    fetchClassDetails();
    if (isAuthenticated) {
      checkExistingBooking();
    }
  }, [id, isAuthenticated]);

  const fetchClassDetails = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getById(id);
      setClassData(response.data);
    } catch (error) {
      setError("Failed to load class details.");
      console.error("Error fetching class:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Check if user already booked this class
  const checkExistingBooking = async () => {
    try {
      const response = await userAPI.getBookings();
      const bookings = response.data || [];
      setUserBookings(bookings);

      const enrolled = bookings.some(
        (b) =>
          b.classId?._id === id &&
          ["upcoming", "confirmed", "active"].includes(b.status),
      );
      setAlreadyEnrolled(enrolled);
    } catch (err) {
      console.error("Failed to check existing bookings:", err);
    }
  };

  // NEW: Open payment modal instead of booking directly
  const handleBookClass = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (alreadyEnrolled) {
      setError("You are already enrolled in this class.");
      return;
    }
    setShowPaymentModal(true);
  };

  // NEW: Dummy payment flow
  const processDummyPayment = async () => {
    setPaymentProcessing(true);
    setError("");

    // Simulate Paystack/network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate payment success (in production, this would be Paystack callback)
    setPaymentProcessing(false);
    setShowPaymentModal(false);

    // Now actually book the class
    await createBooking();
  };

  const createBooking = async () => {
    try {
      setBooking(true);
      setError("");

      const bookingData = {
        classId: id,
        classDate: classData?.schedule?.dayOfWeek
          ? getNextClassDate(classData.schedule.dayOfWeek)
          : new Date(),
      };

      await bookingAPI.create(bookingData);
      setAlreadyEnrolled(true);
      setSuccess("Class booked successfully!");
      setTimeout(() => {
        navigate("/my-bookings");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book class");
    } finally {
      setBooking(false);
    }
  };

  // Helper to get next occurrence of a weekday
  const getNextClassDate = (dayName) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const targetDay = days.indexOf(dayName);
    const today = new Date();
    const diff = (targetDay + 7 - today.getDay()) % 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + (diff === 0 ? 7 : diff));
    return nextDate;
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

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-screen bg-light">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-b-2 border-primary"
          />
        </div>
      </PageWrapper>
    );
  }

  if (!classData) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-light py-12">
          <div className="container mx-auto text-center">
            <motion.p
              className="text-lg text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Class not found
            </motion.p>
            <motion.button
              onClick={() => navigate("/classes")}
              className="btn btn-primary mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            >
              Back to Classes
            </motion.button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const isFull = classData.currentEnrollment >= classData.capacity;
  const availableSlots = classData.capacity - classData.currentEnrollment;
  const capacityStatus = getCapacityStatus(
    classData.currentEnrollment,
    classData.capacity,
  );

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12 relative">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <motion.button
            onClick={() => navigate("/classes")}
            className="text-red-600 hover:text-red-700 hover:underline mb-6 flex items-center gap-2 font-semibold transition-colors duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            ← Back to Classes
          </motion.button>

          {/* Success Message */}
          {success && (
            <motion.div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {success}
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <ImageWithFallBack
                  src={classData.image}
                  alt={classData.name}
                  className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${capacityStatus.color}`}
                  >
                    {capacityStatus.text}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Details Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            >
              <motion.h1
                className="text-4xl font-bold text-dark mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
              >
                {classData.name}
              </motion.h1>

              {classData.description && (
                <motion.p
                  className="text-lg text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                >
                  {classData.description}
                </motion.p>
              )}

              {/* Category & Level Tags */}
              <motion.div
                className="flex gap-2 mb-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
              >
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                  {classData.category}
                </span>
                <span className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded">
                  {classData.level}
                </span>
              </motion.div>

              {/* Class Details Card */}
              <motion.div
                className="card mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
              >
                <h3 className="text-lg font-bold mb-4">Class Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Category</span>
                    <span>{classData.category}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Level</span>
                    <span>{classData.level}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Duration</span>
                    <span>{classData.schedule?.duration || 60} minutes</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Schedule</span>
                    <span>
                      {classData.schedule?.dayOfWeek},{" "}
                      {classData.schedule?.startTime}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-semibold">Location</span>
                    <span>{classData.location}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold">Price</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatPrice(classData.price)}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Capacity Section */}
              <motion.div
                className="card mb-6 shadow-sm hover:shadow-md transition-shadow duration-300"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.7, ease: "easeOut" }}
              >
                <h3 className="text-lg font-bold mb-4">Enrollment Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Capacity</span>
                    <span>
                      {classData.currentEnrollment}/{classData.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <motion.div
                      className={`h-4 rounded-full ${isFull ? "bg-red-500" : "bg-primary"}`}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min(
                          (classData.currentEnrollment / classData.capacity) *
                            100,
                          100,
                        )}%`,
                      }}
                      transition={{
                        duration: 1.2,
                        delay: 0.9,
                        ease: "easeOut",
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {isFull
                      ? "Class is full"
                      : `${availableSlots} slots available`}
                  </p>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.button
                onClick={handleBookClass}
                disabled={isFull || booking || alreadyEnrolled}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
                whileTap={
                  !isFull && !booking && !alreadyEnrolled ? { scale: 0.98 } : {}
                }
                className={`w-full py-3 text-lg font-bold text-white rounded transition-all duration-300 ${
                  isFull || alreadyEnrolled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                }`}
              >
                {booking
                  ? "Processing..."
                  : alreadyEnrolled
                    ? "Already Enrolled"
                    : isFull
                      ? "Class is Full"
                      : `Enroll — ${formatPrice(classData.price)}`}
              </motion.button>

              {!isAuthenticated && (
                <motion.p
                  className="text-center text-sm text-gray-600 mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
                >
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary hover:underline"
                  >
                    Login to book a class
                  </button>
                </motion.p>
              )}
            </motion.div>
          </div>
        </div>

        {/* NEW: Dummy Payment Modal */}
        <AnimatePresence>
          {showPaymentModal && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Test Mode Banner */}
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-4 text-center text-sm font-semibold">
                  🧪 TEST MODE — No real money will be charged
                </div>

                <h2 className="text-xl font-bold mb-2">Complete Enrollment</h2>
                <p className="text-gray-600 mb-4">
                  You are enrolling in <strong>{classData.name}</strong>
                </p>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Class Fee</span>
                    <span className="font-bold">
                      {formatPrice(classData.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-red-600">
                      {formatPrice(classData.price)}
                    </span>
                  </div>
                </div>

                {/* Dummy Card UI */}
                <div className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      defaultValue="4242 4242 4242 4242"
                      readOnly
                      className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry
                      </label>
                      <input
                        type="text"
                        defaultValue="12/30"
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        defaultValue="123"
                        readOnly
                        className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    disabled={paymentProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={processDummyPayment}
                    disabled={paymentProcessing}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 font-semibold"
                  >
                    {paymentProcessing ? "Processing..." : "Pay & Enroll"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
