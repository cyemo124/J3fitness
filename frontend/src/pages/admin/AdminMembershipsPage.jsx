// frontend/src/pages/admin/AdminMembershipsPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/api";
import PageWrapper from "../../components/PageWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

export default function AdminMembershipsPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationMonths: 1,
    price: "",
    features: "",
    classesPerMonth: "",
    accessLevel: "basic",
    guestPasses: 0,
    priorityBooking: false,
    personalTrainingIncluded: 0,
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getMemberships();
      setPlans(response.data || []);
    } catch (err) {
      setError("Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      durationMonths: 1,
      price: "",
      features: "",
      classesPerMonth: "",
      accessLevel: "basic",
      guestPasses: 0,
      priorityBooking: false,
      personalTrainingIncluded: 0,
      displayOrder: 0,
      isActive: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setFormData({
      ...plan,
      features: (plan.features || []).join("\n"),
      guestPasses: plan.benefits?.guestPasses || 0,
      priorityBooking: plan.benefits?.priorityBooking || false,
      personalTrainingIncluded: plan.benefits?.personalTrainingIncluded || 0,
    });
    setEditingId(plan._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price),
        durationMonths: parseInt(formData.durationMonths),
        classesPerMonth: parseInt(formData.classesPerMonth) || 0,
        displayOrder: parseInt(formData.displayOrder) || 0,
        features: formData.features
          .split("\n")
          .map((f) => f.trim())
          .filter(Boolean),
        benefits: {
          guestPasses: parseInt(formData.guestPasses) || 0,
          priorityBooking: formData.priorityBooking,
          personalTrainingIncluded:
            parseInt(formData.personalTrainingIncluded) || 0,
          unlimitedClasses:
            formData.classesPerMonth === 999 ||
            formData.classesPerMonth === "999",
        },
      };

      if (editingId) {
        await adminAPI.updateMembership(editingId, payload);
        setSuccess("Plan updated successfully!");
      } else {
        await adminAPI.createMembership(payload);
        setSuccess("Plan created successfully!");
      }

      resetForm();
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save plan");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this plan?")) return;

    try {
      await adminAPI.deleteMembership(id);
      setSuccess("Plan deleted!");
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete");
    }
  };

  const getAccessColor = (level) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      vip: "bg-amber-100 text-amber-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-6 sm:py-8 md:py-12">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          {/* Header - Stack on mobile, side-by-side on sm+ */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-3xl font-bold text-dark">
                Membership Plans
              </h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Manage pricing and features
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="w-full sm:w-auto bg-red-600 text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2 min-h-[44px]"
            >
              {showForm ? (
                <X className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {showForm ? "Cancel" : "Add Plan"}
            </button>
          </div>

          {/* Alerts - Full width with responsive padding */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-green-100 border border-green-400 text-green-700 px-3 sm:px-4 py-3 rounded mb-4 sm:mb-6 text-sm sm:text-base"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form - Responsive grid and spacing */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="card mb-6 sm:mb-8 overflow-hidden mx-0"
              >
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
                    {editingId ? "Edit Plan" : "Create New Plan"}
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Grid: 1 col mobile, 2 col sm+, adaptive gaps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Plan Name
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                          placeholder="e.g. Premium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Access Level
                        </label>
                        <select
                          value={formData.accessLevel}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              accessLevel: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px] bg-white"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Price (₦)
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                          placeholder="49999"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Duration (months)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.durationMonths}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              durationMonths: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Classes Per Month
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.classesPerMonth}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              classesPerMonth: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                          placeholder="999 for unlimited"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Display Order
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.displayOrder}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              displayOrder: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                        placeholder="Short description of the plan"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Features (one per line)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.features}
                        onChange={(e) =>
                          setFormData({ ...formData, features: e.target.value })
                        }
                        className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none text-sm sm:text-base"
                        placeholder="Unlimited gym access&#10;4 classes per month&#10;Basic support"
                      />
                    </div>

                    {/* Benefits grid: 1 col mobile, 3 col md+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          Guest Passes
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.guestPasses}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              guestPasses: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-gray-700">
                          PT Sessions
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.personalTrainingIncluded}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              personalTrainingIncluded: e.target.value,
                            })
                          }
                          className="w-full px-3 sm:px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm sm:text-base min-h-[44px]"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-0 sm:pt-6 min-h-[44px]">
                        <input
                          type="checkbox"
                          id="priorityBooking"
                          checked={formData.priorityBooking}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              priorityBooking: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-red-600 rounded cursor-pointer"
                        />
                        <label
                          htmlFor="priorityBooking"
                          className="text-sm font-medium text-gray-700 cursor-pointer select-none"
                        >
                          Priority Booking
                        </label>
                      </div>
                    </div>

                    {/* Buttons: Stack on mobile, row on sm+ */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <button
                        type="button"
                        onClick={resetForm}
                        className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base min-h-[44px]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm sm:text-base min-h-[44px]"
                      >
                        {editingId ? "Update Plan" : "Create Plan"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Plans List - Responsive grid */}
          {loading ? (
            <div className="flex justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
              No membership plans found. Click "Add Plan" to create one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {plans.map((plan) => (
                <motion.div
                  key={plan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card border-2 ${
                    plan.accessLevel === "basic"
                      ? "border-blue-200"
                      : plan.accessLevel === "premium"
                        ? "border-purple-200"
                        : "border-amber-200"
                  } p-4 sm:p-6`}
                >
                  <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
                    <h3 className="text-lg sm:text-xl font-bold truncate pr-2">
                      {plan.name}
                    </h3>
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getAccessColor(plan.accessLevel)}`}
                    >
                      {plan.accessLevel.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-bold">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {" "}
                      / {plan.durationMonths}mo
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 sm:mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes</span>
                      <span className="font-medium">
                        {plan.classesPerMonth === 999
                          ? "Unlimited"
                          : plan.classesPerMonth + "/mo"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guest Passes</span>
                      <span className="font-medium">
                        {plan.benefits?.guestPasses || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">PT Sessions</span>
                      <span className="font-medium">
                        {plan.benefits?.personalTrainingIncluded || 0}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons: Stack on very small, row on sm+ */}
                  <div className="flex flex-col xs:flex-row gap-2 pt-3 sm:pt-4 border-t">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 text-sm min-h-[44px]"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm min-h-[44px]"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
