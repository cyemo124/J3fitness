import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

const DUMMY_SUB_PREFIX = "membershipSubscription_";
const PAYMENT_HISTORY_PREFIX = "paymentHistory_";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [membership, setMembership] = useState(null);

  const resolveMembership = useCallback(() => {
    if (user?.membership?.status === "active") {
      return user.membership;
    }
    if (!user?._id) return null;
    const raw = localStorage.getItem(`${DUMMY_SUB_PREFIX}${user._id}`);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (new Date(parsed.expiresAt) <= new Date()) {
        localStorage.removeItem(`${DUMMY_SUB_PREFIX}${user._id}`);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(`${DUMMY_SUB_PREFIX}${user._id}`);
      return null;
    }
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
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith(DUMMY_SUB_PREFIX) ||
            key.startsWith(PAYMENT_HISTORY_PREFIX)
          ) {
            localStorage.removeItem(key);
          }
        });
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
      // Object.keys(localStorage).forEach((key) => {
      //   if (
      //     key.startsWith(DUMMY_SUB_PREFIX) ||
      //     key.startsWith(PAYMENT_HISTORY_PREFIX)
      //   ) {
      //     localStorage.removeItem(key);
      //   }
      // });
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

  const getPaymentHistory = useCallback(() => {
    if (!user?._id) return [];
    const raw = localStorage.getItem(`${PAYMENT_HISTORY_PREFIX}${user._id}`);
    return raw ? JSON.parse(raw) : [];
  }, [user]);

  const cancelMembership = useCallback(async () => {
    try {
      if (
        user?.membership?.status === "active" &&
        !membership?.paymentMethod?.includes("dummy")
      ) {
        await axios.delete("/api/v1/users/membership", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
      }
      if (user?._id) {
        localStorage.removeItem(`${DUMMY_SUB_PREFIX}${user._id}`);
      }
      const { membership: _, ...userWithoutMembership } = user || {};
      updateUser(userWithoutMembership);
      return { success: true, message: "Membership cancelled successfully" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel membership";
      throw new Error(msg);
    }
  }, [user, membership, updateUser]);

  const renewMembership = useCallback(async () => {
    if (!membership) throw new Error("No active membership to renew");
    try {
      if (
        user?.membership?.status === "active" &&
        !membership?.paymentMethod?.includes("dummy")
      ) {
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
      }
      const newExpiresAt = new Date(
        Math.max(Date.now(), new Date(membership.expiresAt).getTime()) +
          membership.durationMonths * 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const renewed = {
        ...membership,
        expiresAt: newExpiresAt,
        renewedAt: new Date().toISOString(),
        transactionRef: `DUMMY_RENEW_${Date.now()}`,
      };
      localStorage.setItem(
        `${DUMMY_SUB_PREFIX}${user._id}`,
        JSON.stringify(renewed),
      );
      const updatedUser = { ...user, membership: renewed };
      updateUser(updatedUser);
      return { success: true, membership: renewed };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to renew membership";
      throw new Error(msg);
    }
  }, [user, membership, updateUser, refreshUser]);

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
    getPaymentHistory,
    cancelMembership,
    renewMembership,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
