import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ToastProvider } from './context/ToastContext';

// User Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import { UserLayout } from './components/Layout';
import HomePage from './pages/user/HomePage';
import WithdrawPage from './pages/user/WithdrawPage';
import SupportPage from './pages/user/SupportPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminWithdrawalsPage from './pages/admin/AdminWithdrawalsPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-800">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user || !user.is_admin) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      {/* Admin Login - separate route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      
      {/* Protected User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserLayout>
              <HomePage />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/withdraw"
        element={
          <ProtectedRoute>
            <UserLayout>
              <WithdrawPage />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/support"
        element={
          <ProtectedRoute>
            <UserLayout>
              <SupportPage />
            </UserLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Protected Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/withdrawals"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminWithdrawalsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminTicketsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtectedRoute>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </AdminProtectedRoute>
        }
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <AppRoutes />
          </AdminAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
