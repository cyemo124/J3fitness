import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { adminAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function AdminPaymentsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState("all");
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchPayments();
  }, [page, filter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      let allPayments = [];
      let backendPagination = {};

      try {
        const response = await adminAPI.getPayments(page, 12, {
          status: filter === "all" ? null : filter,
        });
        allPayments = response.data || [];
        backendPagination = response.pagination || {};
        setStats(response.stats || {});
      } catch (backendErr) {
        console.log("Backend payments not available, using dummy data");
      }

      const dummyPayments = [];
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("paymentHistory_")) {
          const userHistory = JSON.parse(localStorage.getItem(key) || "[]");
          dummyPayments.push(...userHistory);
        }
      });

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

      setStats({
        totalRevenue: merged
          .filter((p) => p.status === "successful")
          .reduce((sum, p) => sum + (p.amount || 0), 0),
        successfulCount: merged.filter((p) => p.status === "successful").length,
        pendingCount: merged.filter((p) => p.status === "pending").length,
      });
    } catch (error) {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      successful: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-light py-12">
      <div className="container mx-auto px-4">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-dark mb-2">
            Payment Management
          </h1>
          <p className="text-gray-600">Track and manage all gym payments</p>
        </motion.div>

        {error && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-6"
          >
            {error}
          </motion.div>
        )}

        {Object.keys(stats).length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            <div className="card border border-gray-200">
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold text-primary">
                ₦{(stats.totalRevenue || 0).toLocaleString()}
              </p>
            </div>

            <div className="card border border-gray-200">
              <p className="text-gray-500 text-sm">Successful Payments</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.successfulCount || 0}
              </p>
            </div>

            <div className="card border border-gray-200">
              <p className="text-gray-500 text-sm">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-600">
                {stats.pendingCount || 0}
              </p>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="card border border-gray-200 mb-6 flex flex-wrap gap-2"
        >
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
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin h-10 w-10 border-b-2 border-primary rounded-full"></div>
          </div>
        ) : payments.length > 0 ? (
          <>
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="card border border-gray-200 overflow-x-auto mb-6"
            >
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">User</th>
                    <th className="text-left py-3 px-4">Type</th>
                    <th className="text-right py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Reference</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment, index) => (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.04,
                      }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(payment.createdAt)}
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold">
                          {payment.userId?.firstName} {payment.userId?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.userId?.email}
                        </p>
                        {payment.isDummy && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded mt-1 inline-block">
                            TEST
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {getTypeLabel(payment.type)}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-primary">
                        ₦{payment.amount.toLocaleString()}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">
                        {payment.reference || payment.invoiceNumber || "N/A"}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() =>
                            navigate(`/admin/payments/${payment._id}`)
                          }
                          className="text-primary hover:underline text-sm font-semibold"
                        >
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {pagination.pages > 1 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex justify-center gap-3"
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="flex items-center px-3 text-gray-600">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-40"
                >
                  Next
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="card border border-gray-200 text-center py-12"
          >
            <p className="text-gray-600">No payments found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
