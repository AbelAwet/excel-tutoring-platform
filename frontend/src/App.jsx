import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './stores/authStore';
import socketService from './lib/socket';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Common Pages
import TutorList from './pages/tutors/TutorList';
import TutorProfile from './pages/tutors/TutorProfile';
import VideoSession from './pages/VideoSession';

// Student Dashboard
import StudentDashboard from './pages/student/Dashboard';
import StudentBookings from './pages/student/Bookings';
import StudentMessages from './pages/student/Messages';
import StudentProfile from './pages/student/Profile';
import StudentNotifications from './pages/student/Notifications';

// Tutor Dashboard
import TutorDashboard from './pages/tutor/Dashboard';
import TutorBookings from './pages/tutor/Bookings';
import TutorMessages from './pages/tutor/Messages';
import TutorProfilePage from './pages/tutor/Profile'; // Renamed to avoid conflict
import TutorNotifications from './pages/tutor/Notifications';
import TutorApplication from './pages/tutor/Application';

// Admin Dashboard
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTutors from './pages/admin/Tutors';
import AdminBookings from './pages/admin/Bookings';
import AdminPayments from './pages/admin/Payments';
import AdminReviews from './pages/admin/Reviews';
import AdminNotifications from './pages/admin/Notifications';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        socketService.connect(token);
      }
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:resettoken" element={<ResetPassword />} />
        <Route path="/tutors" element={<TutorList />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />
      </Route>

      {/* Email Verification */}
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <VerifyEmail />
          </ProtectedRoute>
        }
      />

      {/* Student Dashboard */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="bookings" element={<StudentBookings />} />
        <Route path="messages" element={<StudentMessages />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="notifications" element={<StudentNotifications />} />
      </Route>

      {/* Tutor Dashboard */}
      <Route
        path="/tutor"
        element={
          <ProtectedRoute allowedRoles={['tutor']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TutorDashboard />} />
        <Route path="apply" element={<TutorApplication />} />
        <Route path="bookings" element={<TutorBookings />} />
        <Route path="messages" element={<TutorMessages />} />
        <Route path="profile" element={<TutorProfilePage />} />
        <Route path="notifications" element={<TutorNotifications />} />
      </Route>

      {/* Tutor Application */}
      <Route
        path="/become-tutor"
        element={
          <ProtectedRoute>
            <TutorApplication />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="tutors" element={<AdminTutors />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="notifications" element={<AdminNotifications />} />
      </Route>

      {/* Video Session - Accessible by both students and tutors */}
      <Route
        path="/video-session/:bookingId"
        element={
          <ProtectedRoute allowedRoles={['student', 'tutor']}>
            <VideoSession />
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
