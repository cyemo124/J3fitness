// src/layouts/AdminLayout.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Dumbbell,
  CreditCard,
  LogOut,
  Repeat,
  ClipboardList,
  UserCheck,
  Menu,
  X,
} from "lucide-react";

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
      isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800"
    }`;

  const navItems = [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { to: "/admin/memberships", icon: BarChart3, label: "Memberships" },
    { to: "/admin/trainers", icon: UserCheck, label: "Trainers" },
    { to: "/admin/applications", icon: ClipboardList, label: "Applications" },
    { to: "/admin/members", icon: Users, label: "Members" },
    { to: "/admin/classes", icon: Dumbbell, label: "Classes" },
    { to: "/admin/payments", icon: CreditCard, label: "Payments" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-black text-white p-5 flex-col justify-between fixed h-screen">
        <div>
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={linkClass}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="space-y-3">
          <NavLink to="/dashboard" className={linkClass}>
            <Repeat size={18} />
            Switch to User
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-black text-white px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-800 rounded-lg transition"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Slide-out menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-black text-white p-5 flex flex-col justify-between z-50"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Admin Panel</h2>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-gray-800 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <nav className="space-y-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={linkClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </nav>
              </div>

              <div className="space-y-3">
                <NavLink
                  to="/dashboard"
                  className={linkClass}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Repeat size={18} />
                  Switch to User
                </NavLink>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg w-full"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 p-4 md:p-6 pt-16 md:pt-6">
        <Outlet />
      </div>
    </div>
  );
}
