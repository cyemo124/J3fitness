import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageWrapper from "../../components/PageWrapper";
import { adminAPI } from "../../services/api";

export default function AdminTrainerApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getTrainerApplications({ status: "pending" });
      setApplications(res.data);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const approve = async (id) => {
    try {
      await adminAPI.approveTrainer(id);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async (id) => {
    try {
      await adminAPI.rejectTrainer(id);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light p-6">
        <motion.h1
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Trainer Applications
        </motion.h1>

        {loading && <p className="text-gray-500">Loading applications...</p>}

        {error && <div className="alert alert-error mb-4">{error}</div>}

        {!loading && applications.length === 0 && (
          <p className="text-gray-500">No pending applications</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app, index) => (
            <motion.div
              key={app._id}
              className="card p-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <h2 className="text-lg font-semibold mb-1">
                {app.firstName} {app.lastName}
              </h2>

              <p className="text-sm text-gray-500 mb-2">{app.email}</p>

              <div className="text-sm space-y-1 mb-4">
                <p>
                  <span className="font-medium">Specialization:</span>{" "}
                  {app.specialization}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {app.experience} years
                </p>
                <p>
                  <span className="font-medium">Bio:</span> {app.bio}
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => approve(app._id)}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Approve
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => reject(app._id)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Reject
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
