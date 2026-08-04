// src/pages/Customer/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { complaintsAPI } from '../../api/complaints';
import { repairsAPI } from '../../api/repairs';
import { api } from '../../api/axios';

interface Complaint {
  _id: string;
  ticketId: string;
  subject: string;
  customerName: string;
  customerPhone: string;
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  createdAt: string;
  category: string;
  description: string;
  repair?: {
    _id: string;
    ticketId: string;
    deviceModel: string;
  };
}

interface Repair {
  _id: string;
  ticketId: string;
  customerName: string;
  phoneNumber: string;
  customerEmail: string;
  deviceModel: string;
  issueDescription: string;
  status: string;
  dateLogged: string;
  owner?: {
    _id: string;
    username: string;
    email: string;
  };
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [stats, setStats] = useState({
    activeComplaints: '0',
    resolvedThisMonth: '0',
    openEscalations: '0',
    totalRepairs: '0',
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Default user data if not logged in
  const userData = {
    name: user?.username || 'Olabisi',
    email: user?.email || 'customer@asocomms.com',
    phone: user?.phoneNumber || 'Not provided',
    status: user?.status || 'Premium Member',
    userId: user?._id || '',
    avatar: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdKMvUNF8dKx8IjYJdFH9ZmD3pI5itD7N70OgPIHEWPRLNPCHHvr-tvOvg00eAfvH19rHwF2FciXe4TNxYaVIknk9NIHkcyZjV62lRi-MfTYOZNqNVMShj9Yo8anYJKMWPQQ_czRAtqSNHPwlKjWUNX3lk_PBGdiDAlq-0RwKZs9gk82mOEV7dwk4aqVL8g_ddJYI3V9Wa4NmxT4VORX1togTgcz8V7RBw32uO8tkHsjo0F5sgvbf3tdImWQOL0DQaSh7h10taKHk'
  };

  // Fetch data from database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching dashboard data...');
        console.log('👤 Current user:', user);

        // First, try to link any unlinked repairs
        try {
          const linkResponse = await api.get('/dashboard/link-repairs');
          console.log('🔗 Link Repairs Response:', linkResponse.data);
        } catch (linkErr) {
          console.log('⚠️ Link repairs error:', linkErr.response?.data || linkErr.message);
        }

        // Fetch the dashboard data (repairs)
        const repairsRes = await api.get('/dashboard');
        console.log('📊 Dashboard Response:', repairsRes.data);

        const repairsData = repairsRes.data.repairs || [];
        console.log('📊 Repairs found:', repairsData.length);
        setRepairs(repairsData);

        // Get all ticket IDs from the user's repairs
        const userTicketIds = repairsData.map((r: any) => r.ticketId).filter(Boolean);
        console.log('🎫 User Ticket IDs:', userTicketIds);

        // Fetch complaints
        const complaintsRes = await complaintsAPI.getAll();
        const complaintsData = complaintsRes.complaints || complaintsRes.data || [];

        // 🔒 STRICT FILTER: Only complaints that match the user's repairs
        // AND match the user's name, email, or phone
        const userComplaints = complaintsData.filter((c: any) => {
          // Check if complaint has a ticketId that matches user's repairs
          const ticketMatch = c.ticketId && userTicketIds.includes(c.ticketId);

          // Also check if complaint matches user's details directly
          const emailMatch = c.customerEmail && user?.email &&
            c.customerEmail.toLowerCase() === user.email.toLowerCase();
          const phoneMatch = c.customerPhone && user?.phoneNumber &&
            c.customerPhone === user.phoneNumber;
          const nameMatch = c.customerName && user?.username &&
            c.customerName.toLowerCase() === user.username.toLowerCase();

          // Complaint must either be linked to a repair OR match user details directly
          return ticketMatch || emailMatch || phoneMatch || nameMatch;
        });

        console.log('📊 Filtered Complaints:', userComplaints.length);
        setComplaints(userComplaints.slice(0, 3));

        // Calculate stats from filtered complaints
        const activeComplaints = userComplaints.filter(
          (c: any) => c.status !== 'Resolved' && c.status !== 'Closed'
        ).length;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const resolvedThisMonth = userComplaints.filter((c: any) => {
          const createdAt = new Date(c.createdAt);
          return c.status === 'Resolved' && createdAt >= startOfMonth;
        }).length;

        const escalatedComplaints = userComplaints.filter(
          (c: any) => c.status === 'Escalated'
        ).length;

        setStats({
          activeComplaints: activeComplaints.toString(),
          resolvedThisMonth: resolvedThisMonth.toString(),
          openEscalations: escalatedComplaints.toString(),
          totalRepairs: repairsData.length.toString(),
        });

        // Build recent activity
        const activities: Activity[] = [];

        // Add complaint activities
        userComplaints.slice(0, 2).forEach((c: any) => {
          activities.push({
            id: `complaint-${c._id}`,
            type: 'complaint',
            title: `New complaint logged: ${c.subject}`,
            time: new Date(c.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: 'chat',
            color: 'bg-amber-50 text-amber-600',
          });
        });

        // Add repair activities
        repairsData.slice(0, 2).forEach((r: any) => {
          activities.push({
            id: `repair-${r._id}`,
            type: 'update',
            title: `${r.deviceModel || 'Device'} - ${r.ticketId || 'No Ticket'} (${r.status || 'Pending'})`,
            time: new Date(r.dateLogged || r.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            icon: 'build',
            color: 'bg-blue-50 text-blue-600',
          });
        });

        if (activities.length === 0) {
          activities.push({
            id: 'default',
            type: 'update',
            title: 'Welcome to your dashboard! Start by lodging a complaint or booking a repair.',
            time: 'Just now',
            icon: 'info',
            color: 'bg-slate-50 text-slate-600',
          });
        }

        setRecentActivity(activities.slice(0, 3));

      } catch (err: any) {
        console.error('❌ Failed to fetch dashboard data:', err);
        setStats({
          activeComplaints: '0',
          resolvedThisMonth: '0',
          openEscalations: '0',
          totalRepairs: '0',
        });
        setComplaints([]);
        setRepairs([]);
        setRecentActivity([
          {
            id: '1',
            type: 'update',
            title: 'Welcome to your dashboard! Start by lodging a complaint.',
            time: 'Just now',
            icon: 'info',
            color: 'bg-slate-50 text-slate-600',
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const getStatusDotColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Open': return 'bg-red-500';
      case 'Under Review': return 'bg-amber-500';
      case 'Escalated': return 'bg-red-600';
      case 'Resolved': return 'bg-emerald-500';
      default: return 'bg-slate-400';
    }
  };

  const mapStatusToBadge = (status: Complaint['status']) => {
    switch (status) {
      case 'Open': return 'pending';
      case 'Under Review': return 'under-review';
      case 'Escalated': return 'escalated';
      case 'Resolved': return 'resolved';
      default: return 'pending';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-xs font-extrabold text-blue-800">{userData.status}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
              Welcome back, {userData.name} 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg">
              Track your complaints, view real-time updates, or lodge a new request.
            </p>

            {/* Customer Info Cards */}
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200/60">
                <span className="material-symbols-outlined text-sm text-slate-400">email</span>
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white px-3 py-1.5 rounded-full border border-slate-200/60">
                <span className="material-symbols-outlined text-sm text-slate-400">phone</span>
                <span>{userData.phone}</span>
              </div>
              {repairs.length > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  <span className="material-symbols-outlined text-sm">build</span>
                  <span>{repairs.length} repairs</span>
                </div>
              )}
            </div>
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
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricCard label="Active Complaints" value={stats.activeComplaints} icon="assignment" />
        <MetricCard label="Resolved (This Month)" value={stats.resolvedThisMonth} icon="task_alt" color="text-emerald-600" bgColor="bg-emerald-50" />
        <MetricCard label="Open Escalations" value={stats.openEscalations} icon="warning" color="text-red-600" bgColor="bg-red-50" />
        <MetricCard label="Total Repairs" value={stats.totalRepairs} icon="build" color="text-blue-600" bgColor="bg-blue-50" />
      </section>

      {/* Service Status & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/80 flex flex-col justify-between">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Quick Actions</p>
          <div className="flex gap-2">
            <button onClick={() => navigate('/complaints')} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60">
              <span className="material-symbols-outlined text-base text-blue-600">track_changes</span> Track
            </button>
            <button onClick={() => navigate('/support')} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60">
              <span className="material-symbols-outlined text-base text-blue-600">support_agent</span> Help
            </button>
            <button onClick={() => navigate('/profile')} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60">
              <span className="material-symbols-outlined text-base text-blue-600">person</span> Profile
            </button>
          </div>
        </div>
      </div>

      {/* Active Complaints */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Complaints</h3>
          <Link to="/complaints" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
            View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">inbox</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">No Complaints</h4>
              <p className="text-xs text-slate-500">You haven't lodged any complaints yet.</p>
              <Link to="/complaints/new" className="inline-block mt-3 text-blue-600 text-xs font-bold hover:underline">
                Lodge your first complaint
              </Link>
            </div>
          ) : (
            complaints.map((complaint) => (
              <Link key={complaint._id} to={`/complaints/${complaint._id}`} className="block bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-blue-600 text-lg">chat</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                          {complaint.subject}
                        </h4>
                        <StatusBadge status={mapStatusToBadge(complaint.status)} size="sm" />
                        {complaint.ticketId && (
                          <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                            {complaint.ticketId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {complaint.customerName} • {formatDate(complaint.createdAt)}
                      </p>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
                        {complaint.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusDotColor(complaint.status)}`}></div>
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-lg">
                      chevron_right
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Show Repairs */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Your Repairs</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View All</button>
        </div>

        <div className="space-y-3">
          {repairs.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200/80 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-2xl">build</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">No Repairs Found</h4>
              <p className="text-xs text-slate-500">You don't have any repair records yet.</p>
              <Link to="/" className="inline-block mt-3 text-blue-600 text-xs font-bold hover:underline">
                Book a repair
              </Link>
            </div>
          ) : (
            repairs.slice(0, 3).map((repair) => (
              <div key={repair._id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 hover:border-blue-300 transition-all">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-blue-600 text-lg">smartphone</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{repair.deviceModel || 'Device'}</h4>
                      <StatusBadge status={repair.status?.toLowerCase() || 'pending'} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {repair.ticketId || 'No Ticket ID'} • {formatDate(repair.dateLogged || repair.createdAt)}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                      {repair.issueDescription || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
          <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View History</button>
        </div>

        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
              <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center shrink-0`}>
                <span className="material-symbols-outlined text-lg">{activity.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">{activity.title}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{activity.time}</p>
              </div>
              <span className="material-symbols-outlined text-slate-400 text-lg">chevron_right</span>
            </div>
          ))}
        </div>
      </section>

      {/* Helpful Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/complaints" className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">search</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Track Status</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Check complaint progress</p>
          </div>
        </Link>

        <Link to="/complaints/new" className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">add_circle</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Lodge Complaint</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Submit a new issue</p>
          </div>
        </Link>

        <Link to="/profile" className="bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">person</span>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">My Profile</p>
            <p className="text-[11px] text-slate-500 mt-0.5">View and edit details</p>
          </div>
        </Link>
      </section>

      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;