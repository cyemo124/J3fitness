import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "./ProtectedRoute";
import RootLayout from "../pages/Root";
import { AuthProvider } from "../context/AuthContext";

// Pages
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RegisterTrainerPage from "../pages/RegisterTrainerPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ClassesPage from "../pages/ClassesPage";
import ClassDetailPage from "../pages/ClassDetailPage";
import TrainersPage from "../pages/TrainersPage";
import TrainerDetailPage from "../pages/TrainerDetailPage";
import PricingPage from "../pages/PricingPage";
import ContactPage from "../pages/ContactPage";
import ProfilePage from "../pages/ProfilePage";
import DashboardPage from "../pages/DashboardPage";
import BookingsPage from "../pages/BookingsPage";
import MembershipPage from "../pages/MembershipPage";

import AdminLayout from "./AdminLayout";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminMembersPage from "../pages/admin/AdminMembersPage";
import AdminAnalyticsPage from "../pages/admin/AdminAnalyticsPage";
import AdminClassesPage from "../pages/admin/AdminClassesPage";
import AdminPaymentsPage from "../pages/admin/AdminPaymentsPage";
import MakeTrainersPage from "../pages/admin/ManageTrainersPage";
import AdminTrainerApplicationsPage from "../pages/admin/AdminTrainerApplicationsPage";
import AdminTrainerDetailPage from "../pages/admin/AdminTrainerDetailPage";
import AdminCreateClassPage from "../pages/admin/AdminCreateClassPage";
import AdminEditClassPage from "../pages/admin/AdminEditClassPage";
import AdminTrainerEditPage from "../pages/admin/AdminTrainerEditPage";
import AdminMembershipsPage from "../pages/admin/AdminMembershipsPage";

import UnauthorizedPage from "../pages/UnauthorizedPage";
import ApplicationSubmittedPage from "../pages/ApplicationSubmittedPage";
import NotFoundPage from "../pages/NotFoundPage";
import WorkoutPage from "../pages/WorkoutPage";
import RoutineBuilderPage from "../pages/RoutineBuilderPage";
import WorkoutHistoryPage from "../pages/WorkoutHistoryPage";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes location={location}>
          <Route path="/" element={<RootLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-trainer" element={<RegisterTrainerPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/:id" element={<ClassDetailPage />} />
            <Route path="/trainers" element={<TrainersPage />} />
            <Route path="/trainers/:id" element={<TrainerDetailPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route
              path="/application-submitted"
              element={<ApplicationSubmittedPage />}
            />

            {/* Protected Member Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workout"
              element={
                <ProtectedRoute>
                  <WorkoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routines"
              element={
                <ProtectedRoute>
                  <RoutineBuilderPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <WorkoutHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membership"
              element={
                <ProtectedRoute>
                  <MembershipPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboardPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="memberships" element={<AdminMembershipsPage />} />
              <Route path="members" element={<AdminMembersPage />} />
              <Route path="classes" element={<AdminClassesPage />} />
              <Route path="classes/new" element={<AdminCreateClassPage />} />
              <Route path="classes/:id" element={<AdminEditClassPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="trainers" element={<MakeTrainersPage />} />
              <Route path="trainers/:id" element={<AdminTrainerDetailPage />} />
              <Route
                path="trainers/:id/edit"
                element={<AdminTrainerEditPage />}
              />
              <Route
                path="applications"
                element={<AdminTrainerApplicationsPage />}
              />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}
