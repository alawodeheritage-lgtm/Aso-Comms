// src/App.tsx or src/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user } = useAuth();

  // Hide sidebar on public pages
  const hideSidebar = location.pathname === '/' ||
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/track';

  return (
    <div className="min-h-screen bg-[#F8F6F1]">
      <Navbar />
      <div className="flex pt-16">
        {!hideSidebar && <Sidebar userType={user?.role === 'customer' ? 'customer' : 'admin'} />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;