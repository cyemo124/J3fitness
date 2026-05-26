import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { paymentAPI, membershipAPI } from "../services/api";
import {
  CheckCircle,
  X,
  Calendar,
  CreditCard,
  ArrowRight,
  Loader2,
  Crown,
} from "lucide-react";

export default function PaymentHistoryPage() {
  const navigate = useNavigate();
  const { user, membership, cancelMembership, getPaymentHistory, updateUser } =
    useAuth();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ─── Plan change state ───
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState(null);
  const [changePlanProcessing, setChangePlanProcessing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [filter, page]);

  const showToast = (type, message) => {
    if (type === "success") {
      setError("");
      setSuccess(message);
      setTimeout(() => setSuccess(""), 4000);
    }
    if (type === "error") {
      setSuccess("");
      setError(message);
      setTimeout(() => setError(""), 4000);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      let allPayments = [];
      try {
        const response = await paymentAPI.getHistory(
          page,
          12,
          filter === "all" ? null : filter,
        );
        allPayments = response.data || [];
      } catch (backendErr) {
        console.log("Backend payments not available, using dummy data");
      }

      const dummyPayments = getPaymentHistory();
      const merged = [...allPayments, ...dummyPayments].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      const filtered =
        filter === "all" ? merged : merged.filter((p) => p.status === filter);
      const pageSize = 12;
      const start = (page - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);

      setPayments(paginated);
      setPagination({
        page,
        pages: Math.ceil(filtered.length / pageSize) || 1,
        total: filtered.length,
      });
    } catch (error) {
      showToast("error", "Failed to load payment history");
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await cancelMembership();
      showToast("success", "Membership cancelled successfully");
      setShowCancelConfirm(false);
      fetchPayments();
    } catch (err) {
      showToast("error", err.message || "Failed to cancel membership");
    } finally {
      setCancelling(false);
    }
  };

  // ─── FETCH AVAILABLE PLANS FOR CHANGE ───
  const handleOpenChangePlan = async () => {
    setShowChangePlan(true);
    setPlansLoading(true);
    try {
      const response = await membershipAPI.getAll();
      const plans = response.data || response || [];
      // Filter out current plan
      setAvailablePlans(
        plans.filter(
          (p) => p._id !== membership?.planId && p._id !== membership?.planId,
        ),
      );
    } catch (err) {
      showToast("error", "Failed to load plans");
      console.error(err);
    } finally {
      setPlansLoading(false);
    }
  };

  // ─── PROCESS PLAN CHANGE ───
  const handleConfirmChangePlan = async () => {
    if (!selectedNewPlan) {
      showToast("error", "Select a plan first");
      return;
    }

    setChangePlanProcessing(true);

    try {
      // Simulate payment processing (1.5s delay)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Calculate new expiry (extend from now or keep existing?)
      // Option: Reset expiry based on new plan duration
      const newExpiresAt = new Date(
        Date.now() + selectedNewPlan.durationMonths * 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const updatedSubscription = {
        ...membership,
        planId: selectedNewPlan._id,
        planName: selectedNewPlan.name,
        accessLevel: selectedNewPlan.accessLevel,
        price: selectedNewPlan.price,
        durationMonths: selectedNewPlan.durationMonths,
        expiresAt: newExpiresAt,
        transactionRef: `DUMMY_CHANGE_${Date.now()}`,
        changedAt: new Date().toISOString(),
      };

      // Update localStorage
      localStorage.setItem(
        `membershipSubscription_${user._id}`,
        JSON.stringify(updatedSubscription),
      );

      // Add payment record for the change
      const paymentRecord = {
        _id: `dummy_change_${Date.now()}`,
        userId: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        type: "membership",
        amount: selectedNewPlan.price,
        status: "successful",
        reference: updatedSubscription.transactionRef,
        planName: selectedNewPlan.name,
        createdAt: new Date().toISOString(),
        isDummy: true,
        note: `Plan change from ${membership.planName}`,
      };

      const historyKey = `paymentHistory_${user._id}`;
      const existingHistory = JSON.parse(
        localStorage.getItem(historyKey) || "[]",
      );
      existingHistory.unshift(paymentRecord);
      localStorage.setItem(historyKey, JSON.stringify(existingHistory));

      // Update auth context
      const updatedUser = { ...user, membership: updatedSubscription };
      updateUser(updatedUser);

      showToast("success", `Successfully changed to ${selectedNewPlan.name}!`);
      setShowChangePlan(false);
      setSelectedNewPlan(null);
      fetchPayments();
    } catch (err) {
      showToast("error", err.message || "Failed to change plan");
    } finally {
      setChangePlanProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      successful: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeLabel = (type) => {
    const labels = {
      membership: "Membership",
      "single-class": "Single Class",
      "trainer-session": "Trainer Session",
      other: "Other",
    };
    return labels[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price) => `₦${price?.toLocaleString() || 0}`;

  const daysUntilExpiry = membership?.expiresAt
    ? Math.ceil(
        (new Date(membership.expiresAt) - new Date()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark mb-2">Payment History</h1>
          <p className="text-gray-600">
            Track all your transactions and receipts
          </p>
        </div>

        {/* SUCCESS TOAST */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{success}</span>
              </div>
              <button
                onClick={() => setSuccess("")}
                className="hover:bg-green-200 rounded-full p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ERROR TOAST */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <X className="w-5 h-5" />
                <span className="font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError("")}
                className="hover:bg-red-200 rounded-full p-1 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE SUBSCRIPTION */}
        {membership?.status === "active" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl p-6 mb-8 border-2 ${
              membership.paymentMethod?.includes("dummy")
                ? "bg-yellow-50 border-yellow-300"
                : "bg-green-50 border-green-300"
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    membership.paymentMethod?.includes("dummy")
                      ? "bg-yellow-100"
                      : "bg-green-100"
                  }`}
                >
                  <CheckCircle
                    className={`w-6 h-6 ${
                      membership.paymentMethod?.includes("dummy")
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-dark">
                    Active Subscription
                    {membership.paymentMethod?.includes("dummy") && (
                      <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                        TEST MODE
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    <span className="font-semibold">{membership.planName}</span>{" "}
                    &bull;{" "}
                    <span className="uppercase text-xs font-bold bg-gray-200 px-2 py-0.5 rounded">
                      {membership.accessLevel}
                    </span>
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Expires{" "}
                      {new Date(membership.expiresAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="w-4 h-4" />
                      {formatPrice(membership.price)}
                    </span>
                    {daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                      <span className="text-red-600 font-semibold">
                        Expires in {daysUntilExpiry} day
                        {daysUntilExpiry !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={handleOpenChangePlan}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                >
                  Change Plan
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowCancelConfirm(true)}
                  disabled={cancelling}
                  className="flex-1 md:flex-none px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  {cancelling ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* NO SUBSCRIPTION */}
        {!membership && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 mb-8 text-center"
          >
            <p className="text-gray-600 text-lg mb-4">No active subscription</p>
            <button
              onClick={() => navigate("/pricing")}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold"
            >
              View Plans →
            </button>
          </motion.div>
        )}

        {/* FILTER */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            {["all", "successful", "pending", "failed"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === status
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : payments.length > 0 ? (
          <>
            {/* PAYMENTS TABLE */}
            <div className="card overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Reference
                    </th>
                    <th className="text-right py-3 px-4 font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        {getTypeLabel(payment.type)}
                        {payment.isDummy && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                            TEST
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">
                        {payment.reference || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">
                        ₦{payment.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {payment.receiptUrl ? (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm font-semibold"
                          >
                            View Receipt
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
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
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">No payments found</p>
            {!membership && (
              <button
                onClick={() => navigate("/pricing")}
                className="text-red-600 hover:underline font-semibold"
              >
                View Plans →
              </button>
            )}
          </div>
        )}

        {/* ─── CHANGE PLAN MODAL ─── */}
        <AnimatePresence>
          {showChangePlan && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                    <Crown className="w-6 h-6 text-red-600" />
                    Change Your Plan
                  </h2>
                  <button
                    onClick={() => {
                      setShowChangePlan(false);
                      setSelectedNewPlan(null);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  Current: <strong>{membership?.planName}</strong> (
                  {membership?.accessLevel}) — {formatPrice(membership?.price)}
                </p>

                {plansLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-red-600" />
                  </div>
                ) : availablePlans.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {availablePlans.map((plan) => {
                      const isSelected = selectedNewPlan?._id === plan._id;
                      return (
                        <motion.button
                          key={plan._id}
                          onClick={() => setSelectedNewPlan(plan)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition ${
                            isSelected
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{plan.name}</h3>
                              <p className="text-sm text-gray-600">
                                {plan.durationMonths} month
                                {plan.durationMonths > 1 ? "s" : ""}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-red-600">
                                {formatPrice(plan.price)}
                              </p>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
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
                          </div>
                          {plan.features?.map((feature, idx) => (
                            <p
                              key={idx}
                              className="text-sm text-gray-600 mt-1 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </p>
                          ))}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No other plans available.
                  </p>
                )}

                {selectedNewPlan && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl p-4 mb-6"
                  >
                    <h3 className="font-bold mb-2">Change Summary</h3>
                    <div className="flex justify-between text-sm mb-1">
                      <span>From</span>
                      <span className="font-medium">
                        {membership?.planName}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>To</span>
                      <span className="font-medium">
                        {selectedNewPlan.name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>New Price</span>
                      <span className="font-bold text-red-600">
                        {formatPrice(selectedNewPlan.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>New Expiry</span>
                      <span className="font-medium">
                        {new Date(
                          Date.now() +
                            selectedNewPlan.durationMonths *
                              30 *
                              24 *
                              60 *
                              60 *
                              1000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowChangePlan(false);
                      setSelectedNewPlan(null);
                    }}
                    className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                  >
                    Keep Current Plan
                  </button>
                  <button
                    onClick={handleConfirmChangePlan}
                    disabled={!selectedNewPlan || changePlanProcessing}
                    className="flex-1 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {changePlanProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Change
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CANCEL CONFIRM MODAL */}
        <AnimatePresence>
          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
              >
                <h2 className="text-2xl font-bold text-dark mb-3">
                  Cancel Membership?
                </h2>
                <p className="text-gray-600 mb-6">
                  You'll lose access to your membership immediately after
                  cancellation.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                  >
                    Keep Membership
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="flex-1 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {cancelling ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
