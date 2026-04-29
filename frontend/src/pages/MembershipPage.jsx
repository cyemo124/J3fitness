import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { membershipAPI } from "../services/api";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await membershipAPI.getAll();
      setPlans(response.data);
    } catch (error) {
      setError("Failed to load membership plans");
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    navigate(`/membership?planId=${plan._id}`);
  };

  const getAccessLevelColor = (level) => {
    const colors = {
      basic: "bg-blue-50 border-blue-200",
      premium: "bg-purple-50 border-purple-200",
      vip: "bg-amber-50 border-amber-200",
    };
    return colors[level] || "bg-gray-50 border-gray-200";
  };

  const getAccessLevelBadge = (level) => {
    const badges = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      vip: "bg-amber-100 text-amber-800",
    };
    return badges[level] || "bg-gray-100 text-gray-800";
  };

  // animations only (no styling changes)
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-light py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-dark mb-4">
            Membership Plans
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your fitness goals
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              No membership plans available at the moment.
            </p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {plans.map((plan) => (
              <motion.div
                key={plan._id}
                variants={cardVariants}
                whileHover={{ y: -4 }} // subtle, no style change
                className={`card border-2 hover:shadow-lg transition-all ${getAccessLevelColor(plan.accessLevel)}`}
              >
                {/* Badge */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-dark">
                      {plan.name}
                    </h3>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getAccessLevelBadge(plan.accessLevel)}`}
                  >
                    {plan.accessLevel.toUpperCase()}
                  </span>
                </div>

                {/* Description */}
                {plan.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                )}

                {/* Price */}
                <div className="mb-6">
                  <p className="text-5xl font-bold">
                    ₦{plan.price.toLocaleString()}
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    {plan.durationMonths} month
                    {plan.durationMonths > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Key Features */}
                <div className="mb-6 pb-6 border-b">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">⚡</span>
                      <span>
                        {plan.classesPerMonth === 999
                          ? "Unlimited classes"
                          : `${plan.classesPerMonth} classes/month`}
                      </span>
                    </div>
                    {plan.benefits?.unlimitedClasses && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Unlimited access</span>
                      </div>
                    )}
                    {plan.benefits?.personalTrainingIncluded > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>
                          {plan.benefits.personalTrainingIncluded} PT sessions
                        </span>
                      </div>
                    )}
                    {plan.benefits?.priorityBooking && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>Priority booking</span>
                      </div>
                    )}
                    {plan.benefits?.guestPasses > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{plan.benefits.guestPasses} guest passes</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* All Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3">
                      Includes:
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="text-green-500">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full bg-red-700 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-800 transition-colors"
                >
                  {isAuthenticated ? "Get Started" : "Login to Subscribe"}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => navigate("/classes")}
          className="mt-8 border border-red-600 text-red-600 px-6 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
        >
          ← Back to Classes
        </button>
      </motion.div>
    </motion.div>
  );
}
