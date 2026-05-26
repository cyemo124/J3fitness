import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { membershipAPI } from "../services/api";
import { toast } from "react-hot-toast";

export default function MembershipCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser, membership } = useAuth();

  const planId = searchParams.get("planId");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // ─── BLOCK: Already has active membership ───
  useEffect(() => {
    if (membership?.status === "active") {
      toast("You already have an active subscription", { icon: "✓" });
      navigate("/payments", { replace: true });
    }
  }, [membership, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/membership?planId=${planId}` } });
      return;
    }
    fetchPlan();
  }, [planId, isAuthenticated]);

  const fetchPlan = async () => {
    if (!planId) {
      setError("No plan selected");
      setLoading(false);
      return;
    }
    try {
      const response = await membershipAPI.getById(planId);
      const planData = response.data || response;
      setPlan(planData);
    } catch (err) {
      setError(err.message || "Failed to load plan details");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => `₦${price?.toLocaleString() || 0}`;

  const processDummyPayment = async () => {
    setPaymentProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const dummySubscription = {
        userId: user._id,
        planId: plan._id,
        planName: plan.name,
        accessLevel: plan.accessLevel,
        price: plan.price,
        durationMonths: plan.durationMonths,
        subscribedAt: new Date().toISOString(),
        expiresAt: new Date(
          Date.now() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        paymentMethod: "dummy_test_card_4242",
        transactionRef: `DUMMY_${Date.now()}`,
        status: "active",
      };

      localStorage.setItem(
        `membershipSubscription_${user._id}`,
        JSON.stringify(dummySubscription),
      );

      const paymentRecord = {
        _id: `dummy_pay_${Date.now()}`,
        userId: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        type: "membership",
        amount: plan.price,
        status: "successful",
        reference: dummySubscription.transactionRef,
        planName: plan.name,
        createdAt: dummySubscription.subscribedAt,
        isDummy: true,
      };

      const historyKey = `paymentHistory_${user._id}`;
      const existingHistory = JSON.parse(
        localStorage.getItem(historyKey) || "[]",
      );
      existingHistory.unshift(paymentRecord);
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));

      const updatedUser = {
        ...user,
        membership: dummySubscription,
      };
      updateUser(updatedUser);

      toast.success(`Successfully subscribed to ${plan.name}!`);
      setShowPaymentModal(false);
      navigate("/dashboard", { state: { newSubscription: true } });
    } catch (err) {
      toast.error(err.message || "Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error || "Plan not found"}
          </div>
          <button
            onClick={() => navigate("/pricing")}
            className="mt-4 text-red-600 hover:underline"
          >
            ← Back to Pricing
          </button>
        </div>
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
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-dark mb-2">
            Complete Your Subscription
          </h1>
          <p className="text-gray-600">
            Review your plan and proceed to payment
          </p>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-dark">{plan.name}</h2>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${
                  plan.accessLevel === "vip"
                    ? "bg-amber-100 text-amber-800"
                    : plan.accessLevel === "premium"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                }`}
              >
                {plan.accessLevel?.toUpperCase()}
              </span>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-red-600">
                {formatPrice(plan.price)}
              </p>
              <p className="text-gray-500 text-sm">
                for {plan.durationMonths} month
                {plan.durationMonths > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {plan.description && (
            <p className="text-gray-600 mb-4">{plan.description}</p>
          )}

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">
              Plan Includes:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span>
                  {plan.classesPerMonth === 999
                    ? "Unlimited classes"
                    : `${plan.classesPerMonth} classes/month`}
                </span>
              </li>
              {plan.benefits?.personalTrainingIncluded > 0 && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>
                    {plan.benefits.personalTrainingIncluded} PT sessions
                  </span>
                </li>
              )}
              {plan.benefits?.priorityBooking && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>Priority booking</span>
                </li>
              )}
              {plan.benefits?.guestPasses > 0 && (
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>{plan.benefits.guestPasses} guest passes</span>
                </li>
              )}
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(plan.price)}
            </span>
          </div>
        </motion.div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/pricing")}
            className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            ← Change Plan
          </button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPaymentModal(true)}
            className="flex-1 py-3 bg-red-700 text-white rounded-lg font-bold shadow-md hover:bg-red-800 transition"
          >
            Proceed to Payment
          </motion.button>
        </div>
      </div>

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
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded mb-4 text-center text-sm font-semibold">
                🧪 TEST MODE — No real money will be charged
              </div>

              <h2 className="text-xl font-bold mb-2">Complete Subscription</h2>
              <p className="text-gray-600 mb-4">
                You are subscribing to <strong>{plan.name}</strong>
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between mb-2">
                  <span>Plan Fee</span>
                  <span className="font-bold">{formatPrice(plan.price)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total</span>
                  <span className="text-red-600">
                    {formatPrice(plan.price)}
                  </span>
                </div>
              </div>

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
                  {paymentProcessing ? "Processing..." : "Pay & Subscribe"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
