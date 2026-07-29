// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  userType?: 'customer' | 'admin' | null;
}

const Sidebar: React.FC<SidebarProps> = ({ userType = 'customer' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Hide sidebar on landing page, auth pages, track, and profile
  const hideSidebar = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password' ||
    location.pathname === '/verify-otp' ||
    location.pathname === '/track' ||
    location.pathname.startsWith('/track/') ||
    location.pathname.startsWith('/profile/');

  if (hideSidebar) return null;

  const isActive = (path: string) => location.pathname === path;

  const userRole = user?.role || userType;
  const isAdmin = userRole === 'manager' || userRole === 'ceo';

  const customerLinks = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/complaints', icon: 'report_problem', label: 'My Complaints' },
    { path: '/complaints/new', icon: 'add_circle', label: 'Lodge Complaint' },
    { path: '/profile', icon: 'person', label: 'My Profile' }
  ];

  const adminLinks = [
    { path: '/admin', icon: 'dashboard', label: 'Overview' },
    { path: '/admin/repairs', icon: 'build', label: 'Repairs' },
    { path: '/admin/expenses', icon: 'payments', label: 'Expenses' },
    { path: '/admin/complaints', icon: 'chat', label: 'Complaints' },
    { path: '/admin/financials', icon: 'trending_up', label: 'Financials' },
    { path: '/admin/profile', icon: 'person', label: 'Profile' }
  ];

  let links = customerLinks;
  if (isAdmin) links = adminLinks;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden fixed bottom-20 right-4 z-50 bg-[#004ac6] text-white p-3 rounded-full shadow-lg"
      >
        <span className="material-symbols-outlined">
          {isCollapsed ? 'menu_open' : 'menu'}
        </span>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 bg-white border-r border-[#e1e2ed]/50 shadow-sm transition-all duration-300 ${
          isCollapsed ? 'left-0' : '-left-64 md:left-0'
        } w-64 h-[calc(100vh-4rem)] overflow-y-auto pt-4`}
      >
        <div className="px-4 pb-4 border-b border-[#e1e2ed]/20">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#dbe1ff] flex items-center justify-center text-[#004ac6] font-bold">
              {isAdmin ? 'AD' : user?.username?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-[#191b23]">
                {isAdmin ? 'Administrator' : user?.username || 'User'}
              </p>
              <p className="text-[10px] text-[#434655] capitalize">
                {isAdmin ? 'Admin' : user?.role || 'Customer'}
              </p>
            </div>
          </div>
        </div>

        <nav className="px-3 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-[#dbe1ff] text-[#004ac6]'
                  : 'text-[#434655] hover:bg-[#f3f3fe] hover:text-[#004ac6]'
              }`}
            >
              <span className="material-symbols-outlined text-base">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e1e2ed]/20">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ba1a1a] hover:bg-[#ffdad6]/20 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingOut ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
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
      {isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsCollapsed(false)}
        />
      )}
    </>
  );
};

export default Sidebar;