import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membership, setMembership] = useState(null);

  // ─── Resolve membership from user object (now from backend) ───
  const resolveMembership = useCallback(() => {
    if (user?.membership?.status === "active") {
      return user.membership;
    }
    return null;
  }, [user]);

  useEffect(() => {
    setMembership(resolveMembership());
  }, [resolveMembership]);

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedAccess && storedRefresh && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAccessToken(storedAccess);
        setUser(parsedUser);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((tokens, userData) => {
    const { accessToken, refreshToken } = tokens;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setAccessToken(accessToken);
    setUser(userData);
    setError(null);
  }, []);

  const register = useCallback(async (data) => {
    try {
      const res = await axios.post("/api/v1/auth/register", data);
      const { accessToken, refreshToken, user } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
      setAccessToken(accessToken);
      setUser(user);
      setError(null);
      return user;
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed, try again later";
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await axios.post("/api/v1/auth/logout", { refreshToken });
      }
    } catch (err) {
      console.warn("Logout API call failed:", err.message);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setAccessToken(null);
      setUser(null);
      setMembership(null);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await axios.get("/api/v1/users/profile", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const freshUser = res.data?.data || res.data;
      localStorage.setItem("user", JSON.stringify(freshUser));
      setUser(freshUser);
      return freshUser;
    } catch (err) {
      console.warn("refreshUser failed:", err.message);
      return null;
    }
  }, []);

  const hasMembershipAccess = useCallback(
    (minimumLevel = "basic") => {
      const levels = { basic: 1, premium: 2, vip: 3, none: 0 };
      const current = membership?.accessLevel || "none";
      return levels[current] >= levels[minimumLevel];
    },
    [membership],
  );

  // ─── NEW: Cancel membership via backend ───
  const cancelMembership = useCallback(async () => {
    try {
      // Try backend cancel first (works for both real and dummy now)
      await axios.delete("/api/v1/users/dummy-membership", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // Refresh user to get updated state
      await refreshUser();

      return { success: true, message: "Membership cancelled successfully" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel membership";
      throw new Error(msg);
    }
  }, [refreshUser]);

  // ─── NEW: Renew membership via backend ───
  const renewMembership = useCallback(async () => {
    if (!membership) throw new Error("No active membership to renew");
    try {
      // Try real backend renewal first
      const res = await axios.put(
        "/api/v1/users/membership/renew",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        },
      );
      await refreshUser();
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to renew membership";
      throw new Error(msg);
    }
  }, [membership, refreshUser]);

  const setAuthError = useCallback((errorMsg) => setError(errorMsg), []);
  const clearError = useCallback(() => setError(null), []);

  const hasRole = useCallback((role) => user?.role === role, [user]);
  const hasAnyRole = useCallback(
    (roles) => user && roles.includes(user.role),
    [user],
  );

  const value = {
    user,
    accessToken,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    setAuthError,
    clearError,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
    membership,
    hasMembershipAccess,
    cancelMembership,
    renewMembership,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
