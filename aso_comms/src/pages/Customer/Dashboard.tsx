import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface Complaint {
  id: string;
  title: string;
  reference: string;
  status: 'pending' | 'in-progress' | 'under-review' | 'resolved' | 'escalated' | 'closed';
  date: string;
  icon: string;
  description: string;
}

interface Activity {
  id: string;
  type: 'complaint' | 'update' | 'resolution';
  title: string;
  time: string;
  icon: string;
  color: string;
}

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [logout, user] = useAuth({
    name: 'Olabisi',
    status: 'Premium Member',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdKMvUNF8dKx8IjYJdFH9ZmD3pI5itD7N70OgPIHEWPRLNPCHHvr-tvOvg00eAfvH19rHwF2FciXe4TNxYaVIknk9NIHkcyZjV62lRi-MfTYOZNqNVMShj9Yo8anYJKMWPQQ_czRAtqSNHPwlKjWUNX3lk_PBGdiDAlq-0RwKZs9gk82mOEV7dwk4aqVL8g_ddJYI3V9Wa4NmxT4VORX1togTgcz8V7RBw32uO8tkHsjo0F5sgvbf3tdImWQOL0DQaSh7h10taKHk',
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [complaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Screen Replacement',
      reference: '#REC-2045',
      status: 'pending',
      date: 'Logged Dec 12, 2023',
      icon: 'smartphone',
      description: 'Cracked screen, touch not working properly',
    },
    {
      id: '2',
      title: 'Battery Swap',
      reference: '#REC-2030',
      status: 'in-progress',
      date: 'Logged Dec 10, 2023',
      icon: 'battery_charging_full',
      description: 'Battery draining fast, needs replacement',
    },
    {
      id: '3',
      title: 'Charging Port Repair',
      reference: '#REC-2018',
      status: 'in-progress',
      date: 'Logged Dec 8, 2023',
      icon: 'usb',
      description: 'Charging port loose, intermittent charging',
    },
  ]);

  const [recentActivity] = useState<Activity[]>([
    {
      id: '1',
      type: 'update',
      title: 'Status updated to In Progress for #REC-2045',
      time: '2 hours ago',
      icon: 'update',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      id: '2',
      type: 'resolution',
      title: 'Issue resolved for #REC-2018 - Ready for pickup',
      time: '5 hours ago',
      icon: 'check_circle',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: '3',
      type: 'complaint',
      title: 'New complaint logged: Battery Swap #REC-2030',
      time: '1 day ago',
      icon: 'chat',
      color: 'bg-amber-50 text-amber-600',
    },
  ]);

  const stats = [
    {
      label: 'Active Complaints',
      value: complaints
        .filter((c) => c.status !== 'resolved' && c.status !== 'closed')
        .length.toString(),
      icon: 'assignment',
    },
    {
      label: 'Resolved (This Month)',
      value: '12',
      icon: 'task_alt',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      label: 'Open Escalations',
      value: '0',
      icon: 'warning',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const getStatusDotColor = (status: Complaint['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-red-500';
      case 'in-progress':
        return 'bg-blue-600';
      case 'under-review':
        return 'bg-amber-500';
      case 'resolved':
        return 'bg-emerald-500';
      case 'escalated':
        return 'bg-red-600';
      case 'closed':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Welcome Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-3">
              <span className="material-symbols-outlined text-blue-600 text-sm">verified</span>
              <span className="text-[10px] font-bold text-blue-700 tracking-wider uppercase">
                ACCOUNT STATUS
              </span>
              <span className="text-xs font-extrabold text-blue-800">{user.status}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              Welcome back, {user.name} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
              Track your complaints, view real-time updates, or lodge a new request.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/complaints/new"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all text-sm"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Lodge Complaint
            </Link>
            <Link
              to="/complaints"
              className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all text-sm shadow-xs"
            >
              <span className="material-symbols-outlined text-lg">list_alt</span>
              View All
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((stat, index) => (
          <MetricCard key={index} {...stat} />
        ))}
      </section>

      {/* Service Status & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Status */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">System & Service Status</p>
              <p className="text-xs text-slate-500 mt-0.5">All Systems Operational</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
            Quick Actions
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/complaints')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <span className="material-symbols-outlined text-base text-blue-600">
                track_changes
              </span>
              Track
            </button>
            <button
              onClick={() => navigate('/support')}
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <span className="material-symbols-outlined text-base text-blue-600">
                support_agent
              </span>
              Help
            </button>
            <a
              href="tel:+1234567890"
              className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
            >
              <span className="material-symbols-outlined text-base text-blue-600">call</span>
              Call
            </a>
          </div>
        </div>
      </div>

      {/* Active Complaints */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Active Complaints</h3>
          <Link
            to="/complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            View All
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="space-y-3">
          {complaints
            .filter((c) => c.status !== 'resolved' && c.status !== 'closed')
            .map((complaint) => (
              <Link
                key={complaint.id}
                to={`/complaints/${complaint.id}`}
                className="block bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-blue-600 text-lg">
                        {complaint.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {complaint.title}
                        </h4>
                        <StatusBadge status={complaint.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {complaint.reference} • {complaint.date}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(
                        complaint.status
                      )}`}
                    ></div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-lg">
                      chevron_right
                    </span>
                  </div>
                </div>
              </Link>
            ))}
        </div>

        {complaints.filter((c) => c.status !== 'resolved' && c.status !== 'closed').length ===
          0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">No Active Complaints</h4>
              <p className="text-xs text-slate-500">
                You have no active complaints. Everything is resolved!
              </p>
              <Link
                to="/complaints/new"
                className="inline-block mt-3 text-blue-600 text-xs font-bold hover:underline"
              >
                Lodge a new complaint
              </Link>
            </div>
          )}
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
            View History
          </button>
        </div>

        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-3 hover:bg-slate-50/50 transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}
              >
                <span className="material-symbols-outlined text-lg">{activity.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                  {activity.title}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{activity.time}</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-lg">
                chevron_right
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Helpful Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          to="/complaints"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">search</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Track Status
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Check complaint progress</p>
          </div>
        </Link>

        <Link
          to="/complaints/new"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">add_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Lodge Complaint
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Submit a new issue</p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              My Profile
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">View and edit details</p>
          </div>
           <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
        </Link>
      </section>

      {/* Global CSS for Material Icons */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;