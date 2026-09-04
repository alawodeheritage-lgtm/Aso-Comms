// src/components/Sidebar.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  userType?: 'customer' | 'admin' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ userType = 'customer' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, isLoading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // ✅ Toggle function
  const toggleSidebar = () => {
    setIsMobileOpen(prev => !prev);
  };

  // ✅ Close sidebar
  const closeSidebar = () => {
    setIsMobileOpen(false);
  };

  // ✅ Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const hamburgerBtn = document.getElementById('hamburger-btn');

      if (sidebarRef.current && !sidebarRef.current.contains(target)) {
        // Don't close if clicking the hamburger button
        if (hamburgerBtn && !hamburgerBtn.contains(target)) {
          setIsMobileOpen(false);
        }
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileOpen]);

  // ✅ Close sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // ✅ Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // ✅ Don't show sidebar on public pages
  const hideSidebar = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-otp' ||
    location.pathname === '/track' ||
    location.pathname.startsWith('/track/') ||
    location.pathname.startsWith('/profile/') ||
    location.pathname === '/support' ||
    location.pathname === '/contact' ||
    location.pathname === '/privacy' ||
    location.pathname === '/terms';

  // ✅ If on public page, don't render sidebar or hamburger
  if (hideSidebar) return null;

  // ✅ Loading state
  if (isLoading || !user) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const userRole = user?.role || userType || 'customer';
  const isAdmin = userRole === 'manager' || userRole === 'ceo';
  const isCEO = userRole === 'ceo';

  const customerLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/complaints', icon: 'report_problem', label: 'My Complaints' },
    { path: '/complaints/new', icon: 'add_circle', label: 'Lodge Complaint' },
    { path: '/profile', icon: 'person', label: 'My Profile' },
    { path: '/notifications', icon: 'notifications', label: 'Notifications' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];

  const adminLinks = [
    { path: '/admin', icon: 'dashboard', label: 'Overview' },
    { path: '/admin/repairs', icon: 'build', label: 'Repairs' },
    { path: '/admin/expenses', icon: 'payments', label: 'Expenses' },
    { path: '/admin/complaints', icon: 'chat', label: 'Complaints' },
    { path: '/admin/financials', icon: 'trending_up', label: 'Financials' },
    { path: '/admin/profile', icon: 'person', label: 'Profile' },
    { path: '/admin/create-staff', icon: 'person_add', label: 'Create Staff' },
  ];

  let links = isAdmin ? adminLinks : customerLinks;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* ✅ Mobile Hamburger Button - ALWAYS VISIBLE on mobile */}
      <button
        id="hamburger-btn"
        onClick={toggleSidebar}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-[#1A365D] text-white p-3.5 rounded-full shadow-lg shadow-[#1A365D]/25 hover:bg-[#2D4A6B] transition-colors active:scale-95 focus:outline-none"
        aria-label="Toggle menu"
      >
        <span className="material-symbols-outlined text-2xl">
          {isMobileOpen ? 'close' : 'menu'}
        </span>
      </button>

      {/* ✅ Sidebar */}
      <aside
        ref={sidebarRef}
        className={`
          fixed md:relative z-40 bg-white border-r border-slate-200/80 shadow-sm
          transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'left-0' : '-left-64 md:left-0'}
          w-64 self-stretch min-h-[calc(100vh-4rem)] h-[calc(100vh-4rem)] overflow-y-auto md:h-auto md:min-h-full md:overflow-visible flex flex-col
        `}
      >
        {/* Close button inside sidebar for mobile */}
        <button
          onClick={closeSidebar}
          className="md:hidden absolute top-4 right-4 text-slate-500 hover:text-slate-700 p-1"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        {/* User Profile */}
        <div className="px-4 pb-4 border-b border-slate-200/60 shrink-0 mt-2 md:mt-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A365D] to-[#2D4A6B] flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {isAdmin ? (isCEO ? 'C' : 'A') : user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#1A365D] truncate">
                {isAdmin ? (isCEO ? 'CEO' : 'Administrator') : user?.username || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {isAdmin ? (isCEO ? 'CEO' : 'Admin') : user?.role || 'Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1 flex-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive(link.path)
                  ? 'bg-[#1A365D]/10 text-[#1A365D] shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#1A365D]'
                }
              `}
              onClick={closeSidebar}
            >
              <span className="material-symbols-outlined text-base">{link.icon}</span>
              {link.label}
              {isActive(link.path) && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1A365D]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200/60 bg-white/80 backdrop-blur-sm shrink-0 mt-auto">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <span className="material-symbols-outlined text-base">logout</span>
                Logging out...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">logout</span>
                Logout
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
          display: inline-block;
          line-height: 1;
        }
      `}</style>
    </>
  );
};

export default Sidebar;