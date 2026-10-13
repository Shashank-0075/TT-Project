import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { PublicLayout } from './layouts/PublicLayout';

// Common Components
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProfilePage } from './pages/ProfilePage';

// Student & Staff Dashboards
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';

// Shared Complaint Operations
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailPage } from './pages/student/ComplaintDetailPage';
import { ComplaintHistoryPage } from './pages/student/ComplaintHistoryPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { EscalatedComplaintsPage } from './pages/admin/EscalatedComplaintsPage';
import { UsersManagementPage } from './pages/admin/UsersManagementPage';
import { CategoriesPage } from './pages/admin/CategoriesPage';
import { LocationsPage } from './pages/admin/LocationsPage';
import { EscalationSettingsPage } from './pages/admin/EscalationSettingsPage';

// Maintenance Pages
import { MaintenanceDashboard } from './pages/maintenance/MaintenanceDashboard';
import { MaintenanceComplaintsPage } from './pages/maintenance/MaintenanceComplaintsPage';
import { ResolutionHistoryPage } from './pages/maintenance/ResolutionHistoryPage';

// Redirect helper component based on user role
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'MAINTENANCE') return <Navigate to="/maintenance/dashboard" replace />;
  if (user.role === 'STAFF') return <Navigate to="/staff/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App = () => {
  return (
    <Routes>
      {/* ================= PUBLIC ROUTES ================= */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Role-based dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleBasedRedirect />
          </ProtectedRoute>
        }
      />

      {/* ================= STUDENT DEDICATED DASHBOARD ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'STUDENT_STAFF']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/dashboard" element={<StudentDashboard />} />
      </Route>

      {/* ================= STAFF DEDICATED DASHBOARD ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['STAFF', 'STUDENT_STAFF']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
      </Route>

      {/* ================= COMPLAINT ACTIONS (STUDENT & STAFF) ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'STUDENT_STAFF']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/student/submit" element={<SubmitComplaintPage />} />
        <Route path="/student/my-complaints" element={<MyComplaintsPage />} />
        <Route path="/student/history" element={<ComplaintHistoryPage />} />
      </Route>

      {/* ================= ADMIN PROTECTED ROUTES ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/complaints" element={<AllComplaintsPage />} />
        <Route path="/admin/escalated" element={<EscalatedComplaintsPage />} />
        <Route path="/admin/users" element={<UsersManagementPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/locations" element={<LocationsPage />} />
        <Route path="/admin/escalation-settings" element={<EscalationSettingsPage />} />
      </Route>

      {/* ================= MAINTENANCE PROTECTED ROUTES ================= */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['MAINTENANCE']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/maintenance/dashboard" element={<MaintenanceDashboard />} />
        <Route path="/maintenance/complaints" element={<MaintenanceComplaintsPage />} />
        <Route path="/maintenance/resolutions" element={<ResolutionHistoryPage />} />
      </Route>

      {/* ================= SHARED AUTHENTICATED ROUTES ================= */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
export default App;
