import axios from "axios";

// Create an axios instance with default settings
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Optional: attach token automatically if stored
// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Handle expired access tokens automatically
let isRefreshing = false;
let refreshSubscribers = [];

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      const message = error.response?.data?.message;

      // If it's not an expired token, force logout immediately
      if (message !== "Token expired, please refresh") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL || "/api/v1"}/auth/refresh-token`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        onTokenRefreshed(accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear everything and redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Helper for multipart uploads (images)
const uploadWithImage = async (method, url, data, imageFile) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === "object") {
      formData.append(key, JSON.stringify(data[key]));
    } else {
      formData.append(key, data[key]);
    }
  });

  if (imageFile) {
    formData.append("image", imageFile);
    console.log("📤 Uploading image:", imageFile.name, imageFile.size); // ADD THIS
  } else {
    console.log("⚠️ No image file provided"); // ADD THIS
  }

  const response = await api[method](url, formData);
  return response.data;
};

// Helper to get paginated data
const paginate = (data, page = 1, limit = 10) => {
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = data.slice(start, end);
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit),
    },
  };
};

// AUTH API
export const authAPI = {
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";
      throw new Error(message);
    }
  },

  applyTrainer: async (data) => {
    try {
      const response = await api.post("/trainers/apply", data);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Application failed";
      throw new Error(message);
    }
  },

  login: async (data) => {
    try {
      const response = await api.post("/auth/login", data);
      // CHANGED: store both tokens
      if (response.data.accessToken) {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Invalid credentials");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return Promise.resolve({ message: "Logged out" });
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch {
      throw new Error("Failed to send reset email");
    }
  },

  resetPassword: async (token, data) => {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, data);
      return response.data;
    } catch {
      throw new Error("Password reset failed");
    }
  },
};

// USER API
export const userAPI = {
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load profile");
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put("/users/profile", data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update profile",
      );
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.put("/users/password", data); // Note: /password not /change-password
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to change password",
      );
    }
  },

  getBookings: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await api.get("/users/bookings", { params });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load bookings");
    }
  },

  getMembership: async () => {
    try {
      const response = await api.get("/users/membership");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load membership",
      );
    }
  },

  renewMembership: async () => {
    // Note: Your route doesn't take planId param in URL, check if it's in body
    try {
      const response = await api.put("/users/membership/renew");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to renew membership",
      );
    }
  },

  getPaymentHistory: async () => {
    // Note: Your route doesn't have pagination params in backend
    try {
      const response = await api.get("/users/payment-history");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load payments");
    }
  },

  // Workouts are separate routes, not under /users
  createWorkout: async (data) => {
    try {
      const response = await api.post("/workouts", data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create workout",
      );
    }
  },

  getTodayWorkout: async () => {
    try {
      const response = await api.get("/workouts/today");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load today's workout",
      );
    }
  },

  getWorkouts: async () => {
    try {
      const response = await api.get("/workouts");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load workouts");
    }
  },

  getDashboard: async () => {
    try {
      const response = await api.get("/users/dashboard");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load dashboard",
      );
    }
  },
};

// CLASS API
export const classAPI = {
  getAll: async (page = 1, limit = 10, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await api.get("/classes", { params });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load classes");
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/classes/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Class not found");
    }
  },

  search: async (query, filters = {}) => {
    try {
      const params = { q: query, ...filters };
      const response = await api.get("/classes/search", { params });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Search failed");
    }
  },

  create: async (data) => {
    try {
      const response = await api.post("/classes", data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create class");
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/classes/${id}`, data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update class");
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/classes/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete class");
    }
  },
};

// BOOKING API (updated - removed getUserBookings)
export const bookingAPI = {
  create: async (data) => {
    try {
      const response = await api.post("/bookings", data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create booking",
      );
    }
  },

  cancel: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/cancel`);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to cancel booking",
      );
    }
  },

  checkIn: async (id) => {
    try {
      const response = await api.patch(`/bookings/${id}/checkin`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to check in");
    }
  },
};

// TRAINER API
export const trainerAPI = {
  getAll: async (page = 1, limit = 12) => {
    try {
      const response = await api.get("/trainers", {
        params: { page, limit },
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load trainers");
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/trainers/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Trainer not found");
    }
  },

  applyTrainer: async (data) => {
    try {
      const response = await api.post("/trainers/apply", data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Application failed");
    }
  },
};

// MEMBERSHIP API
export const membershipAPI = {
  getAll: async () => {
    try {
      const response = await api.get("/memberships");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load memberships",
      );
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/memberships/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Membership not found");
    }
  },
};

// PAYMENT API
export const paymentAPI = {
  initialize: async (data) => {
    try {
      const response = await api.post("/payments/initialize", data);
      return response.data; // Should return { authorizationUrl, reference }
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to initialize payment",
      );
    }
  },

  verify: async (reference) => {
    try {
      const response = await api.get(`/payments/verify/${reference}`);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Payment verification failed",
      );
    }
  },

  getHistory: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/payments/history", {
        params: { page, limit },
      });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load payment history",
      );
    }
  },
};

// ROUTINE API
export const routineAPI = {
  saveRoutine: async (routineData) => {
    try {
      const response = await api.post("/routines", routineData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to save routine");
    }
  },

  getRoutine: async () => {
    try {
      const response = await api.get("/routines");
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load routine");
    }
  },

  // Optional: Add these if your backend supports them
  getRoutineById: async (id) => {
    try {
      const response = await api.get(`/routines/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load routine");
    }
  },

  updateRoutine: async (id, routineData) => {
    try {
      const response = await api.put(`/routines/${id}`, routineData);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update routine",
      );
    }
  },

  deleteRoutine: async (id) => {
    try {
      const response = await api.delete(`/routines/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to delete routine",
      );
    }
  },
};

// ADMIN API
export const adminAPI = {
  // Promote member to admin
  makeAdmin: async (userId) => {
    try {
      const response = await api.patch(`/admin/make-admin/${userId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to make admin");
    }
  },

  getMemberships: async () => {
    try {
      const response = await api.get("/memberships");
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load memberships",
      );
    }
  },

  createMembership: async (data) => {
    try {
      const response = await api.post("/memberships", data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create membership",
      );
    }
  },

  updateMembership: async (id, data) => {
    try {
      const response = await api.put(`/memberships/${id}`, data);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update membership",
      );
    }
  },

  deleteMembership: async (id) => {
    try {
      const response = await api.delete(`/memberships/${id}`);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to delete membership",
      );
    }
  },

  // Fetch paginated members with optional filters
  getMembers: async (page = 1, limit = 12, filters = {}) => {
    try {
      const response = await api.get("/admin/members", {
        params: { page, limit, ...filters },
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load members");
    }
  },

  // Update a member (status, etc.)
  updateMember: async (memberId, data) => {
    try {
      const response = await api.put(`/admin/members/${memberId}`, data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update member");
    }
  },

  // Dashboard stats
  getDashboard: async () => {
    return api.get("/admin/dashboard");
  },

  getClasses: async (page = 1, limit = 12) => {
    try {
      const response = await api.get("/classes", {
        params: { page, limit },
      });
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to load classes");
    }
  },

  createClass: async (data) => {
    try {
      const response = await api.post("/classes", data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to create class");
    }
  },

  updateClass: async (classId, data) => {
    try {
      const response = await api.put(`/classes/${classId}`, data);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to update class");
    }
  },

  deleteClass: async (classId) => {
    try {
      const response = await api.delete(`/classes/${classId}`);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to delete class");
    }
  },

  getTrainerApplications: async (params = {}) => {
    try {
      const response = await api.get("/admin/trainer-applications", {
        params,
      });
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to fetch applications",
      );
    }
  },

  approveTrainer: async (trainerId) => {
    try {
      const response = await api.patch(
        `/admin/trainer-applications/${trainerId}/approve`,
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to approve trainer",
      );
    }
  },

  rejectTrainer: async (trainerId) => {
    try {
      const response = await api.patch(
        `/admin/trainer-applications/${trainerId}/reject`,
      );
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to reject trainer",
      );
    }
  },

  createTrainer: async (data, imageFile) => {
    try {
      return await uploadWithImage("post", "/admin/trainers", data, imageFile);
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to create trainer",
      );
    }
  },

  updateTrainer: async (trainerId, data, imageFile) => {
    try {
      return await uploadWithImage(
        "put",
        `/admin/trainers/${trainerId}`,
        data,
        imageFile,
      );
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to update trainer",
      );
    }
  },

  deleteTrainer: async (trainerId) => {
    try {
      const response = await api.delete(`/admin/trainers/${trainerId}`);
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to delete trainer",
      );
    }
  },

  getAnalytics: async () => {
    try {
      const response = await api.get("/admin/dashboard"); // or /admin/analytics
      return response.data;
    } catch (err) {
      throw new Error(
        err.response?.data?.message || "Failed to load dashboard",
      );
    }
  },
};
