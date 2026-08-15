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

  const hideNav = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-otp';

  if (hideNav) return null;

  const userRole = user?.role || userType;
  const isAdmin = userRole === 'manager' || userRole === 'ceo';
  const isCustomer = userRole === 'customer';
  const isLoggedInUser = !!user || isLoggedIn;
  const showHamburger = !isLoggedInUser;

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to={isLoggedInUser ? (isAdmin ? '/admin' : '/dashboard') : '/'}
            className="flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[#1A365D] text-3xl font-display">precision_manufacturing</span>
            <span className="text-xl font-display font-bold text-[#1A365D] tracking-tight">AsoComms</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedInUser ? (
              <>
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-[#1A365D]' : 'text-slate-600 hover:text-[#1A365D]'}`}
                >
                  Home
                </Link>
                <Link
                  to="/track"
                  className={`text-sm font-medium transition-colors ${isActive('/track') ? 'text-[#1A365D]' : 'text-slate-600 hover:text-[#1A365D]'}`}
                >
                  Track Status
                </Link>
                <Link to="/login" className="text-sm font-semibold text-[#D97706] hover:opacity-80 transition-opacity">
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#1A365D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4A6B] transition-colors active:scale-95 shadow-sm shadow-[#1A365D]/20"
                >
                  Get Started
                </Link>
              </>
            ) : isCustomer ? (
              <>
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-[#1A365D]' : 'text-slate-600 hover:text-[#1A365D]'}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/complaints"
                  className={`text-sm font-medium transition-colors ${isActive('/complaints') ? 'text-[#1A365D]' : 'text-slate-600 hover:text-[#1A365D]'}`}
                >
                  My Complaints
                </Link>
                <Link
                  to="/profile"
                  className={`text-sm font-medium transition-colors ${isActive('/profile') ? 'text-[#1A365D]' : 'text-slate-600 hover:text-[#1A365D]'}`}
                >
                  Profile
                </Link>
                <div className="w-8 h-8 rounded-full bg-[#1A365D]/10 flex items-center justify-center text-[#1A365D] font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              </>
            ) : isAdmin ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#1A365D] flex items-center justify-center text-white font-bold text-sm">
                  {user?.username?.charAt(0)?.toUpperCase() || 'A'}
                </div>
              </>
            ) : null}
          </div>

          {showHamburger && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          )}
        </div>

        {showHamburger && isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200/60 space-y-3">
            {!isLoggedInUser ? (
              <>
                <Link to="/" className="block text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Home
                </Link>
                <Link to="/track" className="block text-sm font-medium text-slate-600 hover:text-[#1A365D] transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  Track Status
                </Link>
                <Link to="/login" className="block text-sm font-semibold text-[#D97706] hover:opacity-80 transition-opacity" onClick={() => setIsMobileMenuOpen(false)}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block text-center bg-[#1A365D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4A6B] transition-colors"
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