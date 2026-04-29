import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

export default function ApplicationSubmittedPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center bg-light p-6">
        <motion.div
          className="card w-full max-w-md p-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* ✅ Icon */}
          <motion.div
            className="flex justify-center mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
              <span className="text-green-600 text-2xl">✓</span>
            </div>
          </motion.div>

          {/* ✅ Title */}
          <motion.h1
            className="text-2xl font-bold mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Application Submitted
          </motion.h1>

          {/* ✅ Message */}
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Your trainer application has been received. Our team will review it
            and get back to you soon.
          </motion.p>

          {/* ✅ Actions */}
          <motion.div
            className="flex flex-col sm:flex-row gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/"
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition text-center"
            >
              Go Home
            </Link>

            <Link
              to="/login"
              className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
            >
              Login
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
