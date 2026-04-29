import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserInitials } from "../utils/authGuard";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      setMobileMenuOpen(false);
      setAccountOpen(false);
    };
  }, []);

  useEffect(() => {
    setHasMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname.startsWith("/admin")) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileMenuOpen(false);
    setAccountOpen(false);
  };

  const navLinkClass = ({ isActive }) =>
    `relative text-white text-sm lg:text-base transition
     after:content-[''] after:absolute after:left-0 after:-bottom-1
     after:h-[2px] after:bg-red-600 after:transition-all
     ${isActive ? "after:w-full" : "after:w-0 hover:after:w-full"}`;

  const mobileNavClass = ({ isActive }) =>
    `block px-4 py-3 text-sm text-white ${
      isActive ? "bg-red-700 text-white" : "hover:bg-gray-800"
    }`;

  const dropdownClass = ({ isActive }) =>
    `block px-4 py-2 text-sm ${
      isActive ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
    }`;

  const navItems = ["/", "/classes", "/trainers", "/pricing", "/contact"];

  return (
    <>
      <motion.nav
        initial={hasMounted ? false : { y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-black/85 backdrop-blur-md shadow-lg"
            : "bg-black shadow-lg"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5 }}
              >
                <img
                  src="/j3.png"
                  alt="logo"
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <motion.span
                className="font-bold text-lg sm:text-xl lg:text-2xl hidden sm:inline text-red-600 drop-shadow-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              >
                FITNESS GYM
              </motion.span>
            </Link>

            {/* Desktop Nav */}
            <motion.div
              className="hidden md:flex items-center space-x-4 lg:space-x-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            >
              {navItems.map((path, index) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.3 + index * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <NavLink to={path} className={navLinkClass}>
                    {path === "/"
                      ? "Home"
                      : path.replace("/", "").charAt(0).toUpperCase() +
                        path.slice(2)}
                  </NavLink>
                </motion.div>
              ))}
            </motion.div>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Desktop Auth */}
              <div className="hidden md:flex items-center space-x-4">
                {isAuthenticated ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.6,
                        ease: "easeOut",
                      }}
                    >
                      <NavLink to="/dashboard" className={navLinkClass}>
                        Dashboard
                      </NavLink>
                    </motion.div>

                    <motion.div
                      className="relative group"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.7,
                        ease: "easeOut",
                      }}
                    >
                      <button className="flex items-center space-x-2 hover:text-red-500 transition-colors">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <span className="text-black text-sm font-bold">
                            {getUserInitials()}
                          </span>
                        </div>
                        <span className="text-sm text-white">
                          {user?.firstName}
                        </span>
                      </button>

                      <div className="absolute right-0 mt-0 w-48 bg-white text-black rounded-lg shadow-lg hidden group-hover:block z-50">
                        <NavLink to="/profile" className={dropdownClass}>
                          My Profile
                        </NavLink>
                        <NavLink to="/history" className={dropdownClass}>
                          Workout History
                        </NavLink>
                        <NavLink to="/my-bookings" className={dropdownClass}>
                          My Bookings
                        </NavLink>
                        <NavLink to="/membership" className={dropdownClass}>
                          Membership
                        </NavLink>

                        {["admin", "super_admin"].includes(user?.role) && (
                          <NavLink to="/admin" className={dropdownClass}>
                            Switch to Admin
                          </NavLink>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                ) : (
                  <motion.div
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6, ease: "easeOut" }}
                  >
                    <NavLink to="/login" className={navLinkClass}>
                      Login
                    </NavLink>
                    <Link
                      to="/register"
                      className="bg-red-600 px-3 py-2 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Mobile Avatar + Dropdown */}
              {isAuthenticated && (
                <div className="relative md:hidden">
                  <button onClick={() => setAccountOpen((prev) => !prev)}>
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-black text-sm font-bold">
                        {getUserInitials()}
                      </span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {accountOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg z-50"
                      >
                        <div className="px-4 py-2 border-b">
                          <p className="text-xs text-gray-500">Signed in as</p>
                          <p className="font-semibold text-sm">
                            {user?.firstName}
                          </p>
                        </div>

                        <NavLink
                          to="/profile"
                          className={dropdownClass}
                          onClick={() => setAccountOpen(false)}
                        >
                          My Profile
                        </NavLink>
                        <NavLink
                          to="/history"
                          className={dropdownClass}
                          onClick={() => setAccountOpen(false)}
                        >
                          Workout History
                        </NavLink>
                        <NavLink
                          to="/my-bookings"
                          className={dropdownClass}
                          onClick={() => setAccountOpen(false)}
                        >
                          My Bookings
                        </NavLink>
                        <NavLink
                          to="/membership"
                          className={dropdownClass}
                          onClick={() => setAccountOpen(false)}
                        >
                          Membership
                        </NavLink>

                        {["admin", "super_admin"].includes(user?.role) && (
                          <NavLink
                            to="/admin"
                            className={dropdownClass}
                            onClick={() => setAccountOpen(false)}
                          >
                            Switch to Admin
                          </NavLink>
                        )}

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hamburger */}
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="md:hidden overflow-hidden pb-2"
              >
                <div className="flex flex-col divide-y divide-gray-800">
                  {navItems.map((path) => (
                    <NavLink
                      key={path}
                      to={path}
                      className={mobileNavClass}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {path === "/"
                        ? "Home"
                        : path.replace("/", "").charAt(0).toUpperCase() +
                          path.slice(2)}
                    </NavLink>
                  ))}

                  {isAuthenticated ? (
                    <>
                      <NavLink
                        to="/dashboard"
                        className={mobileNavClass}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </NavLink>

                      <button
                        onClick={handleLogout}
                        className="text-left px-4 py-3 text-red-500 hover:bg-gray-800"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink to="/login" className={mobileNavClass}>
                        Login
                      </NavLink>
                      <NavLink to="/register" className={mobileNavClass}>
                        Sign Up
                      </NavLink>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
