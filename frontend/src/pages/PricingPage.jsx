import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { membershipAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
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

          {plans.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-600 text-lg">
                No membership plans available at the moment.
              </p>
            </motion.div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.25 } },
              }}
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  className={`card border-2 hover:shadow-lg transition-all ${getAccessLevelColor(plan.accessLevel)}`}
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
                  <div className="mb-6 pb-6 border-b space-y-2">
                    {plan.classesPerMonth && (
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">⚡</span>
                        <span>
                          {plan.classesPerMonth === 999
                            ? "Unlimited classes"
                            : `${plan.classesPerMonth} classes/month`}
                        </span>
                      </div>
                    )}
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

                  {/* Features */}
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
                    onClick={() => handleSelectPlan(plan)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-red-700 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-800"
                  >
                    {isAuthenticated ? "Get Started" : "Login to Subscribe"}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* FAQ Section */}
          <motion.div
            className="mt-16 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <div className="card">
                <h4 className="font-bold mb-2">
                  Can I change my membership plan?
                </h4>
                <p className="text-gray-600 text-sm">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect on your next billing cycle.
                </p>
              </div>
              <div className="card">
                <h4 className="font-bold mb-2">Is there a cancellation fee?</h4>
                <p className="text-gray-600 text-sm">
                  No cancellation fees. You can cancel your membership anytime
                  through your dashboard.
                </p>
              </div>
              <div className="card">
                <h4 className="font-bold mb-2">Do you offer refunds?</h4>
                <p className="text-gray-600 text-sm">
                  We offer a 7-day money-back guarantee if you're not satisfied
                  with your membership.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
