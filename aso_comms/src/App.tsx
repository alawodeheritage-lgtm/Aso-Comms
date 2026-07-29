// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

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

// Admin Pages - ✅ All default imports
import AdminDashboard from './pages/Admin/Dashboard';
import AdminRepairs from './pages/Admin/Repairs';
import AdminExpenses from './pages/Admin/Expenses';
import AdminComplaints from './pages/Admin/Complaints';
import Financials from './pages/Admin/Financials';
import AdminProfile from './pages/Admin/Profile';

// Layout wrapper
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

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-[#faf8ff]">
          <AppLayout>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/track" element={<TrackStatus />} />
              <Route path="/track/:id" element={<TrackStatus />} />
              <Route path="/profile/:id" element={<ShowProfile />} />
              <Route path="/support" element={<Support />} />
              <Route path="/contact" element={<Contact />} />

              {/* Customer Routes */}
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/complaints" element={<CustomerComplaints />} />
              <Route path="/complaints/new" element={<CustomerComplaints />} />
              <Route path="/complaints/:id" element={<CustomerComplaints />} />
              <Route path="/profile" element={<CustomerProfile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/repairs" element={<AdminRepairs />} />
              <Route path="/admin/expenses" element={<AdminExpenses />} />
              <Route path="/admin/complaints" element={<AdminComplaints />} />
              <Route path="/admin/financials" element={<Financials />} />
              <Route path="/admin/profile" element={<AdminProfile />} />

              {/* Repair Route */}
              <Route path="/repairs" element={<AdminRepairs />} />
            </Routes>
          </AppLayout>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;