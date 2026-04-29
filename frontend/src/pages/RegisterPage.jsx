import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authAPI } from "../services/api";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear previous errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register(formData);

      // CHANGED: pass both tokens as object
      login(
        {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
        },
        response.user,
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-light">
        <motion.div
          className="card w-full max-w-md p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.h1
            className="text-2xl font-bold mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Register
          </motion.h1>

          {error && (
            <motion.div
              className="alert alert-error mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              <motion.div
                className="form-group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div
                className="form-group"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </motion.div>

            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <label className="form-label">Password</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input pr-10 w-full"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {!showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div
              className="form-group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? "text" : "password"}
                  name="passwordConfirm"
                  className="form-input pr-10 w-full"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {!showPasswordConfirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </motion.button>
          </form>

          <motion.p
            className="text-center mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Already have an account?{" "}
            <Link to="/login" className="text-red-600 font-bold">
              Login here
            </Link>
          </motion.p>

          <motion.p
            className="text-center mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Register as a trainer{" "}
            <Link to="/register-trainer" className="text-red-600 font-bold">
              Here
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
