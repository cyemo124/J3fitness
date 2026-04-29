import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Outlet } from "react-router-dom";
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
} from "lucide-react";

export default function AdminLayout() {
  const { logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition ${
      isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

          <nav className="space-y-2">
            <NavLink to="/admin" end className={linkClass}>
              <LayoutDashboard size={18} />
              Dashboard
            </NavLink>

            <NavLink to="/admin/analytics" className={linkClass}>
              <BarChart3 size={18} />
              Analytics
            </NavLink>

            <NavLink to="/admin/memberships" className={linkClass}>
              <BarChart3 size={18} />
              Memberships
            </NavLink>

            <NavLink to="/admin/trainers" className={linkClass}>
              <UserCheck size={18} />
              Trainers
            </NavLink>

            <NavLink to="/admin/applications" className={linkClass}>
              <ClipboardList size={18} />
              Applications
            </NavLink>

            <NavLink to="/admin/members" className={linkClass}>
              <Users size={18} />
              Members
            </NavLink>

            <NavLink to="/admin/classes" className={linkClass}>
              <Dumbbell size={18} />
              Classes
            </NavLink>

            <NavLink to="/admin/payments" className={linkClass}>
              <CreditCard size={18} />
              Payments
            </NavLink>
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="space-y-3">
          <NavLink to="/dashboard" className={linkClass}>
            <Repeat size={18} />
            Switch to User
          </NavLink>

          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-lg w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
