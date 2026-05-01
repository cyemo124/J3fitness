// src/pages/SitemapPage.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";
import {
  Home,
  Dumbbell,
  Users,
  CreditCard,
  Calendar,
  UserCircle,
  FileText,
  Shield,
  Map,
  HelpCircle,
  Phone,
  LogIn,
  UserPlus,
} from "lucide-react";

const sitemapSections = [
  {
    title: "Main Pages",
    icon: Home,
    links: [
      { to: "/", label: "Home", icon: Home },
      { to: "/classes", label: "Classes", icon: Dumbbell },
      { to: "/trainers", label: "Personal Trainers", icon: Users },
      { to: "/pricing", label: "Membership Plans", icon: CreditCard },
    ],
  },
  {
    title: "Member Area",
    icon: UserCircle,
    links: [
      { to: "/dashboard", label: "Dashboard", icon: UserCircle },
      { to: "/my-bookings", label: "My Bookings", icon: Calendar },
      { to: "/routines", label: "Workout Routines", icon: Dumbbell },
      { to: "/workout", label: "Start Workout", icon: Dumbbell },
      { to: "/profile", label: "Profile Settings", icon: UserCircle },
    ],
  },
  {
    title: "Account",
    icon: LogIn,
    links: [
      { to: "/login", label: "Login", icon: LogIn },
      { to: "/register", label: "Register", icon: UserPlus },
    ],
  },
  {
    title: "Legal & Info",
    icon: Shield,
    links: [
      { to: "/privacy", label: "Privacy Policy", icon: Shield },
      { to: "/terms", label: "Terms of Service", icon: FileText },
      { to: "/sitemap", label: "Sitemap", icon: Map },
    ],
  },
  {
    title: "Support",
    icon: HelpCircle,
    links: [
      { to: "/contact", label: "Contact Us", icon: Phone },
      { to: "/faq", label: "FAQ", icon: HelpCircle },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function SitemapPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              Sitemap
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find your way around the J³ Gym website. All pages organized by
              category for easy navigation.
            </p>
          </motion.div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sitemapSections.map((section, sectionIndex) => {
              const SectionIcon = section.icon;
              return (
                <motion.div
                  key={sectionIndex}
                  variants={itemVariants}
                  className="card"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Section Header */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                      <SectionIcon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-dark">
                      {section.title}
                    </h2>
                  </div>

                  {/* Links */}
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => {
                      const LinkIcon = link.icon;
                      return (
                        <motion.li
                          key={linkIndex}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link
                            to={link.to}
                            className="flex items-center gap-3 text-gray-600 hover:text-red-600 transition-colors group"
                          >
                            <LinkIcon className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" />
                            <span className="group-hover:underline">
                              {link.label}
                            </span>
                          </Link>
                        </motion.li>
                      );
                    })}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            {[
              { label: "Total Pages", value: "15+" },
              { label: "Main Sections", value: "5" },
              { label: "Member Features", value: "5" },
              { label: "Support Pages", value: "3" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 text-center border border-gray-200"
              >
                <p className="text-2xl font-bold text-red-600">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Footer Note */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-gray-500 text-sm">
              Can't find what you're looking for?{" "}
              <Link to="/contact" className="text-red-600 hover:underline">
                Contact our support team
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
