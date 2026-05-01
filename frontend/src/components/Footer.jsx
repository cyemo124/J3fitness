import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Social icons (lucide-react does not include brand icons)
const InstagramIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState("idle");

  const handleSubscribe = (e) => {
    e.preventDefault();
    setSubscribeStatus("success");
    setEmail("");

    setTimeout(() => {
      setSubscribeStatus("idle");
    }, 3000);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  const linkHover = {
    scale: 1.05,
    x: 5,
    transition: { duration: 0.2 },
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-black text-white pt-12 pb-6"
    >
      <div className="container px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
        >
          {/* Brand / Social */}
          <motion.div variants={itemVariants} className="text-center">
            <motion.h3
              className="text-red-700 font-bold text-2xl mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              J³ Gym
            </motion.h3>

            <div className="flex gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
              >
                <InstagramIcon size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: -5 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
              >
                <FacebookIcon size={20} />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors cursor-pointer"
              >
                <TwitterIcon size={20} />
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={itemVariants}
            className="text-center md:text-left"
          >
            <h4 className="font-bold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <motion.li whileHover={linkHover}>
                <Link
                  to="/classes"
                  className="hover:text-red-700 transition-colors block"
                >
                  Classes
                </Link>
              </motion.li>
              <motion.li whileHover={linkHover}>
                <Link
                  to="/trainers"
                  className="hover:text-red-700 transition-colors block"
                >
                  Personal Trainers
                </Link>
              </motion.li>
              <motion.li whileHover={linkHover}>
                <Link
                  to="/pricing"
                  className="hover:text-red-700 transition-colors block"
                >
                  Membership Plans
                </Link>
              </motion.li>
            </ul>
          </motion.div>

          {/* Contact Us */}
          <motion.div
            variants={itemVariants}
            className="text-center md:text-left"
          >
            <h4 className="font-bold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400 flex flex-col items-center md:items-start">
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <MapPin size={20} className="text-red-700 mt-1 shrink-0" />
                <span>
                  Rock Base Mall, News Engineering
                  <br />
                  Dawaki, Abuja
                </span>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Phone size={20} className="text-red-700 shrink-0" />
                <span>+234 800 123 4567</span>
              </motion.li>
              <motion.li
                className="flex items-center gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Mail size={20} className="text-red-700 shrink-0" />
                <span>info@j3gym.com</span>
              </motion.li>
              <motion.li
                className="flex items-start gap-3"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Clock size={20} className="text-red-700 mt-1 shrink-0" />
                <div>
                  <p>Mon-Fri: 6am - 9pm</p>
                  <p>Saturday: 7am - 9pm</p>
                  <p>Sunday: 3pm - 8pm</p>
                </div>
              </motion.li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            variants={itemVariants}
            className="text-center md:text-left"
          >
            <h4 className="font-bold text-lg mb-4">Newsletter</h4>
            <AnimatePresence mode="wait">
              {subscribeStatus === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-green-600/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Thanks for subscribing! Check your inbox soon.</span>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubscribe}
                  className="flex flex-col gap-2 max-w-xs mx-auto md:mx-0"
                >
                  <motion.input
                    whileFocus={{ scale: 1.02, borderColor: "#dc2626" }}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-700 transition-colors"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="bg-red-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    Subscribe
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="border-t border-gray-800 pt-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} J³ Gym. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/privacy-policy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/terms-of-service"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link
                  to="/sitemap"
                  className="hover:text-white transition-colors"
                >
                  Sitemap
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
