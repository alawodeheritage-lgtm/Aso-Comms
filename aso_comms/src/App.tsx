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

// Staff Management Page
import CreateStaff from './pages/Admin/CreateStaff';

// ============================================
// 📄 404 NOT FOUND PAGE
// ============================================
const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-slate-400">error</span>
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-2">404 - Page Not Found</h1>
      <p className="text-slate-500 max-w-md mb-6">
        The page you're looking for doesn't exist or you don't have permission to view it.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Go Back
        </button>
        <Link
          to="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-xs"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

// ============================================
// 📦 LAYOUT WRAPPER
// ============================================
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = window.location.pathname;

  const hideNavAndSidebar = location === '/' ||
    location === '/login' ||
    location === '/register' ||
    location === '/forgot-password' ||
    location === '/reset-password' ||
    location === '/verify-otp' ||
    location === '/track' ||
    location.startsWith('/track/') ||
    location.startsWith('/profile/');

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
// 🔒 PROTECTED ROUTE COMPONENT
// ============================================
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'manager' | 'ceo')[];
  redirectTo?: string;
}> = ({ children, allowedRoles, redirectTo = '/login' }) => {
  const { user, isLoading } = useAuth();

  console.log('🔒 ProtectedRoute: Checking auth...', { user: user?.username, role: user?.role, isLoading });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🔒 ProtectedRoute: No user, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('🔒 ProtectedRoute: User role not allowed', { userRole: user.role, allowedRoles });
    // User is logged in but doesn't have permission
    if (user.role === 'customer') {
      return <Navigate to="/dashboard" replace />;
    } else if (user.role === 'manager' || user.role === 'ceo') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('🔒 ProtectedRoute: Access granted');
  return <>{children}</>;
};

// ============================================
// 🚀 MAIN APP
// ============================================
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#faf8ff]">
          <AppLayout>
            <Routes>
              {/* ===== AUTH ROUTES ===== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* ===== PUBLIC ROUTES ===== */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/track" element={<TrackStatus />} />
              <Route path="/track/:id" element={<TrackStatus />} />
              <Route path="/profile/:id" element={<ShowProfile />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />

              {/* ===== CUSTOMER ROUTES (Protected) ===== */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaints/:id"
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

              {/* ===== ADMIN ROUTES (Protected - Manager/CEO only) ===== */}
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

              {/* Staff Management - Manager and CEO can access */}
              <Route
                path="/admin/create-staff"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <CreateStaff />
                  </ProtectedRoute>
                }
              />

              {/* ===== REPAIR ROUTE ===== */}
              <Route
                path="/repairs"
                element={
                  <ProtectedRoute allowedRoles={['manager', 'ceo']}>
                    <AdminRepairs />
                  </ProtectedRoute>
                }
              />

              {/* ===== 404 - Catch all ===== */}
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