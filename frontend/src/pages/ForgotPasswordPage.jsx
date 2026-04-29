import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await authAPI.forgotPassword(email);
      setSuccess(
        "Password reset link has been sent to your email. Check your inbox.",
      );
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light">
      <motion.div
        className="card w-full max-w-md"
        initial={{ opacity: 0, y: 40, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.h1
          className="text-2xl font-bold mb-2 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Reset Password
        </motion.h1>

        <motion.p
          className="text-center text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Enter your email address and we'll send you a link to reset your
          password.
        </motion.p>

        {error && (
          <motion.div
            className="alert alert-error mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            className="alert alert-success mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <motion.div
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 disabled:opacity-50"
            disabled={loading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <motion.p
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Remember your password?{" "}
          <Link to="/login" className="text-red-600 font-bold hover:underline">
            Login here
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
}
