// src/components/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isLoggedIn?: boolean;
  userType?: 'customer' | 'admin' | null;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn = false, userType = null }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Hide navbar on landing page, login, and register
  const hideNav = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-otp';

  if (hideNav) return null;

  // Determine user role from context or prop
  const userRole = user?.role || userType;
  const isAdmin = userRole === 'manager' || userRole === 'ceo';
  const isCustomer = userRole === 'customer';
  const isLoggedInUser = !!user || isLoggedIn;

  // ✅ Hide hamburger menu when logged in (customer or admin)
  const showHamburger = !isLoggedInUser;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-[#e1e2ed]/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isLoggedInUser ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#004ac6] text-2xl">precision_manufacturing</span>
            <span className="text-xl font-bold text-[#004ac6] tracking-tight">AsoComms</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedInUser ? (
              // Public Nav - NOT LOGGED IN
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
                    }`}
                >
                  Home
                </Link>
                <Link
                  to="/track"
                  className={`text-sm font-medium transition-colors ${isActive('/track') ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
                    }`}
                >
                  Track Status
                </Link>
                <Link to="/login" className="text-sm font-semibold text-[#004ac6] hover:opacity-80 transition-opacity">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#004ac6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity active:scale-95"
                >
                  Get Started
                </Link>
              </>
            ) : isCustomer ? (
              // Customer Nav - LOGGED IN AS CUSTOMER (No logout, no hamburger)
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
                    }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/complaints"
                  className={`text-sm font-medium transition-colors ${isActive('/complaints') ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
                    }`}
                >
                  My Complaints
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-[#004ac6]' : 'text-[#434655] hover:text-[#004ac6]'
                    }`}
                >
                  Profile
                </Link>
                <div className="w-8 h-8 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </>
            ) : isAdmin ? (
              // Admin/CEO/Manager Nav - LOGGED IN AS ADMIN (No logout, no hamburger)
              <>
                <div className="w-8 h-8 rounded-full bg-[#004ac6] flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </>
            ) : null}
          </div>

          {/* ✅ Mobile Menu Button - ONLY SHOW WHEN NOT LOGGED IN */}
          {showHamburger && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#434655] hover:bg-[#f3f3fe] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}
        </div>

        {/* ✅ Mobile Menu - ONLY SHOW WHEN NOT LOGGED IN */}
        {showHamburger && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#e1e2ed]/20 space-y-3">
            {!isLoggedInUser ? (
              // Public Mobile Nav
              <>
                <Link to="/" className="block text-sm font-medium text-[#434655] hover:text-[#004ac6] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/track" className="block text-sm font-medium text-[#434655] hover:text-[#004ac6] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Track Status
                </Link>
                <Link to="/login" className="block text-sm font-semibold text-[#004ac6] hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center bg-[#004ac6] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            ) : null}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;