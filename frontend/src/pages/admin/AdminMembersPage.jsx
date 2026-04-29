import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { adminAPI } from "../../services/api";
import { motion } from "framer-motion";

export default function AdminMembersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMembers();
  }, [page, filter, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getMembers(page, 12, {
        status: filter === "all" ? null : filter,
        search: searchTerm,
      });
      setMembers(response.data);
      setPagination(response.pagination || {});
    } catch (error) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to suspend this member?"))
      return;
    try {
      await adminAPI.updateMember(memberId, { status: "suspended" });
      fetchMembers();
    } catch {
      setError("Failed to suspend member");
    }
  };

  const handleMakeAdmin = async (memberId) => {
    if (!window.confirm("Promote this user to admin?")) return;
    try {
      await adminAPI.makeAdmin(memberId);
      fetchMembers();
    } catch {
      setError("Failed to promote user");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      suspended: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

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
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-dark mb-2">
            Member Management
          </h1>
          <p className="text-gray-600">
            Manage gym members and their memberships
          </p>
        </motion.div>

        {/* Error */}
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

        {/* Search + Filter */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="card border border-gray-200 rounded-lg p-5 shadow-sm mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search members..."
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />

            <select
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Members</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <button
              onClick={fetchMembers}
              className="bg-red-600 text-white rounded-lg py-3 hover:bg-red-700 transition shadow-md"
            >
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : members.length > 0 ? (
          <>
            {/* Table */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="card border border-gray-200 rounded-lg shadow-sm overflow-x-auto mb-6"
            >
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Email</th>
                    <th className="text-left py-3 px-4">Role</th>
                    <th className="text-left py-3 px-4">Membership</th>
                    <th className="text-left py-3 px-4">Joined</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {members.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.05,
                      }}
                      className="border-b hover:bg-gray-50"
                    >
                      <td className="py-3 px-4 font-semibold text-dark">
                        {member.firstName} {member.lastName}
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {member.email}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-xs font-bold ${
                            member.role === "admin"
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {member.role?.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-600">
                        {member.membership?.planId?.name || "No membership"}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-500">
                        {formatDate(member.createdAt)}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                            member.status || "active",
                          )}`}
                        >
                          {(member.status || "active").toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center space-x-3">
                        <button
                          onClick={() =>
                            navigate(`/admin/members/${member._id}`)
                          }
                          className="text-red-600 hover:underline text-sm font-semibold"
                        >
                          View
                        </button>

                        {member.status !== "suspended" && (
                          <button
                            onClick={() => handleSuspendMember(member._id)}
                            className="text-red-600 hover:underline text-sm font-semibold"
                          >
                            Suspend
                          </button>
                        )}

                        {member.role !== "admin" && member._id !== user.id && (
                          <button
                            onClick={() => handleMakeAdmin(member._id)}
                            className="text-red-600 hover:underline text-sm font-semibold"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex justify-center items-center gap-4"
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-gray-600">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(page + 1)}
                  className="border border-red-600 text-red-600 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white transition disabled:opacity-50"
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
            className="card border border-gray-200 rounded-lg text-center py-12 shadow-sm"
          >
            <p className="text-gray-600 text-lg">No members found</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
