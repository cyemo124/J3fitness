import { useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for your message!");
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container">
          {/* Page Header */}
          <motion.h1
            className="text-4xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Contact Us
          </motion.h1>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.25 } },
            }}
          >
            {/* Contact Info */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Address</h3>
                  <p>Rock Base Mall, News Engineering, Dawaki, Abuja</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Phone</h3>
                  <p>+234 (0) 123 456 7890</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Email</h3>
                  <p>j3fitnessgym@gmail.com</p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Hours</h3>
                  <p>Monday - Friday: 6am - 9pm</p>
                  <p>Saturday: 7am - 9pm</p>
                  <p>Sunday: 3pm - 8pm</p>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              className="card p-6"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-300 disabled:opacity-50"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
