import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { adminAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await adminAPI.getDashboard();
        setDashboard(response.data.data);
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="min-h-screen bg-light py-12"
      initial="hidden"
      animate="show"
      variants={containerVariants}
    >
      <div className="container mx-auto px-4">
        <motion.h1
          className="text-4xl font-bold mb-8 text-dark"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* Stats */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Members",
              value: dashboard?.totalMembers || 0,
              color: "text-red-600",
            },
            {
              label: "Active Members",
              value: dashboard?.activeMembers || 0,
              color: "text-green-600",
            },
            {
              label: "Total Classes",
              value: dashboard?.totalClasses || 0,
              color: "text-blue-600",
            },
            {
              label: "Total Revenue",
              value: `₦${dashboard?.totalRevenue || 0}`,
              color: "text-red-600",
            },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              className="card border border-red-200 shadow-sm hover:shadow-lg p-4 rounded-lg transition"
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: "0px 8px 20px rgba(0,0,0,0.1)" }}
            >
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions & Recent Bookings */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="card border border-red-200 rounded-lg p-6 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-dark">Quick Actions</h2>
            <div className="space-y-3">
              <NavLink
                to="/admin/members"
                className="w-full block text-center bg-red-600 text-white py-3 rounded-lg shadow-md hover:bg-red-700 transition"
              >
                Manage Members
              </NavLink>

              <NavLink
                to="/admin/classes"
                className="w-full block text-center border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Manage Classes
              </NavLink>

              <NavLink
                to="/admin/trainers"
                className="w-full block text-center border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                Manage Trainers
              </NavLink>

              <NavLink
                to="/admin/payments"
                className="w-full block text-center border border-red-600 text-red-600 py-3 rounded-lg hover:bg-red-600 hover:text-white transition"
              >
                View Payments
              </NavLink>
            </div>
          </motion.div>

          <motion.div
            className="card border border-red-200 rounded-lg p-6 shadow-sm"
            variants={cardVariants}
            whileHover={{ y: -3 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-dark">
              Recent Bookings
            </h2>
            <div className="space-y-2">
              {dashboard?.recentBookings?.slice(0, 5).length > 0 ? (
                dashboard.recentBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking._id}
                    className="border-b border-gray-200 pb-2"
                  >
                    <p className="font-bold text-sm text-dark">
                      {booking.userId?.firstName} {booking.userId?.lastName}
                    </p>
                    <p className="text-xs text-gray-600">
                      {booking.classId?.name}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600">No recent bookings</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
