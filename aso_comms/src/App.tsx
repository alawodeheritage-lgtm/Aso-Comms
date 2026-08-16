// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyOTP from './pages/Auth/verifyOTP';

// Public Pages
import LandingPage from './components/LandingPage';
import TrackStatus from './pages/Public/TrackStatus';
import ShowProfile from './pages/Public/ShowProfile';
import Support from './pages/Public/Support';
import Contact from './pages/Public/Contact';
import PrivacyPolicy from './pages/Public/PrivacyPolicy';
import TermsOfService from './pages/Public/TermsOfService';

// Customer Pages
import CustomerDashboard from './pages/Customer/Dashboard';
import CustomerComplaints from './pages/Customer/Complaints';
import CustomerProfile from './pages/Customer/Profile';
import Notifications from './pages/Customer/Notifications';
import Settings from './pages/Customer/Settings';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminRepairs from './pages/Admin/Repairs';
import AdminExpenses from './pages/Admin/Expenses';
import AdminComplaints from './pages/Admin/Complaints';
import Financials from './pages/Admin/Financials';
import AdminProfile from './pages/Admin/Profile';
import CreateStaff from './pages/Admin/CreateStaff';

// ✅ ADD MISSING 404 COMPONENT
const NotFound: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#1A365D]">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mt-4">Page Not Found</h2>
        <p className="text-slate-500 mt-2">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-[#1A365D] text-white rounded-xl font-bold hover:bg-[#2D4A6B] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

// ============================================
// 📦 LAYOUT WRAPPER (with Sidebar)
// ============================================
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = window.location.pathname;

  // ✅ Public pages where you DON'T want Navbar / Sidebar
  const hideNavAndSidebar = location === '/' ||
    location === '/login' ||
    location === '/register' ||
    location === '/forgot-password' ||
    location === '/reset-password' ||
    location === '/verify-otp' ||
    location === '/track' ||
    location.startsWith('/track/') ||
    location.startsWith('/profile/') ||
    location === '/support' ||
    location === '/contact' ||
    location === '/privacy' ||
    location === '/terms';

  if (hideNavAndSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
};

// ============================================
// 🔒 PROTECTED ROUTE
// ============================================
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'manager' | 'ceo')[];
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'customer') return <Navigate to="/dashboard" replace />;
    if (user.role === 'manager' || user.role === 'ceo') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ============================================
// 🚀 MAIN APP
// ============================================
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
          <AppLayout>
            <Routes>
              {/* Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/track" element={<TrackStatus />} />
              <Route path="/track/:id" element={<TrackStatus />} />
              <Route path="/profile/:id" element={<ShowProfile />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />

              {/* Customer (protected) */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/*"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              {/* Admin (protected) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/repairs"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminRepairs />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/expenses"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminExpenses />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/financials"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <Financials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/create-staff"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <CreateStaff />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;