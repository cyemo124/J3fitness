import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      if (user?.role === "admin" || "super_admin") {
        return <Navigate to="/admin" replace />;
      }

      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};
