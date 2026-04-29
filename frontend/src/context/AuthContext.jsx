import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session on mount
  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    const storedUser = localStorage.getItem("user");

    if (storedAccess && storedRefresh && storedUser) {
      try {
        setAccessToken(storedAccess);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  // Login from backend response
  const login = useCallback((tokens, user) => {
    const { accessToken, refreshToken } = tokens;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));

    setAccessToken(accessToken);
    setUser(user);
    setError(null);
  }, []);

  // Registration
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

  // Logout — tells backend to invalidate the refresh token
  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await axios.post("/api/v1/auth/logout", { refreshToken });
      }
    } catch (err) {
      // Ignore errors — still clear locally
      console.warn("Logout API call failed:", err.message);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setAccessToken(null);
      setUser(null);
      setError(null);
      window.location.href = "/login";
    }
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }, []);

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
    setAuthError,
    clearError,
    hasRole,
    hasAnyRole,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
