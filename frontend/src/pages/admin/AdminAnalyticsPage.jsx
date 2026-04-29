import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { adminAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    newSignups: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedBookings: 0,
  });
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getAnalytics();

      // Map backend fields to frontend structure
      const data = response.data;
      setStats({
        totalMembers: data.totalMembers || 0,
        activeMembers: data.activeMembers || 0,
        newSignups: data.newSignups || 0, // Backend doesn't send this yet
        totalRevenue: data.totalRevenue || 0,
        pendingPayments: data.pendingPayments || 0, // Backend doesn't send this yet
        completedBookings: data.totalBookings || 0, // Mapped from totalBookings
      });

      setRevenueData(data.revenueData || []); // Backend doesn't send this yet
    } catch (error) {
      setError("Failed to load dashboard data");
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: "easeOut" },
    },
  };

  const StatCard = ({ title, value, icon }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className="card border border-red-200 rounded-lg p-5 shadow-sm hover:shadow-lg transition"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-red-600">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      className="min-h-screen bg-light py-12"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="container mx-auto px-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        <motion.div className="mb-8" variants={itemVariants}>
          <h1 className="text-4xl font-bold text-dark mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
        >
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon="👥"
          />
          <StatCard
            title="Active Members"
            value={stats.activeMembers}
            icon="✓"
          />
          <StatCard title="New Signups" value={stats.newSignups} icon="🆕" />
          <StatCard
            title="Total Revenue"
            value={`₦${stats.totalRevenue.toLocaleString()}`}
            icon="💰"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon="⏳"
          />
          <StatCard
            title="Completed Bookings"
            value={stats.completedBookings}
            icon="✅"
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="card border border-red-200 rounded-lg p-6 shadow-sm mb-8"
          variants={itemVariants}
          whileHover={{ y: -2 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-dark">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/admin/members")}
              className="bg-red-600 text-white py-3 rounded-lg shadow-md hover:bg-red-700 transition"
            >
              Manage Members
            </button>

            <button
              onClick={() => navigate("/admin/classes")}
              className="border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              Manage Classes
            </button>

            <button
              onClick={() => navigate("/admin/bookings")}
              className="border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              View Bookings
            </button>

            <button
              onClick={() => navigate("/admin/payments")}
              className="border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
            >
              View Payments
            </button>
          </div>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          className="card border border-red-200 rounded-lg p-6 shadow-sm"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold mb-4 text-dark">
            Revenue Trend (Last 30 Days)
          </h2>

          <div className="bg-gray-50 p-8 rounded-lg text-center">
            {revenueData.length === 0 ? (
              <p className="text-gray-600">No revenue data available</p>
            ) : (
              <div className="flex justify-center items-end gap-2 h-40">
                {revenueData.map((item, idx) => {
                  const max = Math.max(...revenueData.map((d) => d.revenue));
                  const height = max ? (item.revenue / max) * 100 : 0;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${height}%`, opacity: 1 }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-8 bg-red-600 rounded-t"></div>
                      <p className="text-xs text-gray-600 mt-2">{item.date}</p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
