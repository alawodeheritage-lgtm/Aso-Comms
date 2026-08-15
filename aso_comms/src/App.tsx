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
import VerifyOTP from './pages/Auth/VerifyOTP';

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

// 404
const NotFound: React.FC = () => { /* ... keep as is */ };

// ============================================
// 📦 LAYOUT WRAPPER (with Sidebar)
// ============================================
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = window.location.pathname;

  // ✅ ADD public pages where you DON'T want Navbar / Sidebar
  const hideNavAndSidebar = location === '/' ||
    location === '/login' ||
    location === '/register' ||
    location === '/forgot-password' ||
    location === '/reset-password' ||
    location === '/verify-otp' ||
    location === '/track' ||
    location.startsWith('/track/') ||
    location.startsWith('/profile/') ||
    location === '/support' ||        // ✅ added
    location === '/contact' ||        // ✅ added
    location === '/privacy' ||        // ✅ added
    location === '/terms';            // ✅ added

  if (hideNavAndSidebar) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar />   {/* ✅ Uses the new humanised Sidebar */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
};

// ============================================
// 🔒 PROTECTED ROUTE (unchanged)
// ============================================
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'manager' | 'ceo')[];
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) { /* ... */ }

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