// src/pages/Customer/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
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
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  dateLogged: string;
  images?: string[];
  financials?: {
    totalEstimate: number;
    amountPaid: number;
    balanceDue: number;
    paymentStatus: 'Unpaid' | 'Partial / Deposit Logged' | 'Paid in Full';
  };
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
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);

  const userData = {
    name: user?.username || 'Olabisi',
    email: user?.email || 'customer@asocomms.com',
    phone: user?.phoneNumber || 'Not provided',
    status: user?.status || 'Premium Member',
    userId: user?._id || '',
    avatar: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdKMvUNF8dKx8IjYJdFH9ZmD3pI5itD7N70OgPIHEWPRLNPCHHvr-tvOvg00eAfvH19rHwF2FciXe4TNxYaVIknk9NIHkcyZjV62lRi-MfTYOZNqNVMShj9Yo8anYJKMWPQQ_czRAtqSNHPwlKjWUNX3lk_PBGdiDAlq-0RwKZs9gk82mOEV7dwk4aqVL8g_ddJYI3V9Wa4NmxT4VORX1togTgcz8V7RBw32uO8tkHsjo0F5sgvbf3tdImWQOL0DQaSh7h10taKHk'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching dashboard data...');
        console.log('👤 Current user:', user);

        // Link unlinked repairs
        try {
          const linkResponse = await api.get('/dashboard/link-repairs');
          console.log('🔗 Link Repairs Response:', linkResponse.data);
        } catch (linkErr) {
          console.log('⚠️ Link repairs error:', linkErr.response?.data || linkErr.message);
        }

        const repairsRes = await api.get('/dashboard');
        console.log('📊 Dashboard Response:', repairsRes.data);

        const repairsData = repairsRes.data.repairs || [];
        console.log('📊 Repairs found:', repairsData.length);
        setRepairs(repairsData);

        const userTicketIds = repairsData.map((r: any) => r.ticketId).filter(Boolean);
        console.log('🎫 User Ticket IDs:', userTicketIds);

        const complaintsRes = await complaintsAPI.getAll();
        const complaintsData = complaintsRes.complaints || complaintsRes.data || [];

        const userComplaints = complaintsData.filter((c: any) => {
          const ticketMatch = c.ticketId && userTicketIds.includes(c.ticketId);
          const emailMatch = c.customerEmail && user?.email &&
            c.customerEmail.toLowerCase() === user.email.toLowerCase();
          const phoneMatch = c.customerPhone && user?.phoneNumber &&
            c.customerPhone === user.phoneNumber;
          const nameMatch = c.customerName && user?.username &&
            c.customerName.toLowerCase() === user.username.toLowerCase();
          return ticketMatch || emailMatch || phoneMatch || nameMatch;
        });

        console.log('📊 Filtered Complaints:', userComplaints.length);
        setComplaints(userComplaints.slice(0, 3));

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

        const activities: Activity[] = [];

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

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200/60';
      case 'medium': return 'text-amber-800 bg-amber-50 border-amber-200/60';
      case 'low': return 'text-slate-600 bg-slate-100 border-slate-200';
      default: return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid in Full': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Partial / Deposit Logged': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Unpaid': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const openRepairDetails = (repair: Repair) => {
    setSelectedRepair(repair);
    setIsRepairModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">
              Welcome back, {userData.name} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Here's a snapshot of your repairs and complaints.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/complaints"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#1A365D] hover:text-[#2D4A6B] transition-colors px-4 py-2 rounded-xl border border-slate-200 hover:border-[#1A365D]/30 hover:shadow-sm"
            >
              <span className="material-symbols-outlined text-base">list_alt</span>
              View all
            </Link>
            <Link
              to="/complaints/new"
              className="inline-flex items-center gap-1.5 bg-[#1A365D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-sm shadow-[#1A365D]/20 text-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Lodge Complaint
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Active</span>
              <span className="material-symbols-outlined text-[#1A365D] text-2xl">assignment</span>
            </div>
            <p className="text-3xl font-bold text-[#1A365D] mt-2">{stats.activeComplaints}</p>
            <p className="text-sm text-slate-500">Complaints</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Resolved</span>
              <span className="material-symbols-outlined text-emerald-600 text-2xl">task_alt</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.resolvedThisMonth}</p>
            <p className="text-sm text-slate-500">This month</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Escalated</span>
              <span className="material-symbols-outlined text-amber-600 text-2xl">warning</span>
            </div>
            <p className="text-3xl font-bold text-amber-600 mt-2">{stats.openEscalations}</p>
            <p className="text-sm text-slate-500">Open escalations</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-sm font-medium">Repairs</span>
              <span className="material-symbols-outlined text-[#1A365D] text-2xl">build</span>
            </div>
            <p className="text-3xl font-bold text-[#1A365D] mt-2">{stats.totalRepairs}</p>
            <p className="text-sm text-slate-500">Total logged</p>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-center gap-4">
          <span className="material-symbols-outlined text-emerald-600 text-3xl">check_circle</span>
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">System &amp; Service Status</h3>
            <p className="text-sm text-emerald-700">All systems operational. No outages reported.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/track"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex items-center gap-4 group"
          >
            <span className="w-11 h-11 rounded-xl bg-[#1A365D]/10 text-[#1A365D] flex items-center justify-center group-hover:bg-[#1A365D] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">search</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1A365D] transition-colors">Track Status</p>
              <p className="text-xs text-slate-500">Check complaint progress</p>
            </div>
          </Link>
          <Link
            to="/complaints/new"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex items-center gap-4 group"
          >
            <span className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">add_circle</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1A365D] transition-colors">Lodge Complaint</p>
              <p className="text-xs text-slate-500">Submit a new issue</p>
            </div>
          </Link>
          <Link
            to="/profile"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex items-center gap-4 group"
          >
            <span className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-[#1A365D] group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-2xl">person</span>
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1A365D] transition-colors">My Profile</p>
              <p className="text-xs text-slate-500">View and edit details</p>
            </div>
          </Link>
        </div>

        {/* Two-column: Complaints + Repairs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Complaints */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A365D]">Recent Complaints</h2>
              <Link to="/complaints" className="text-sm font-medium text-[#D97706] hover:text-[#b85f00] flex items-center gap-0.5">
                View all
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            {complaints.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No complaints yet.</p>
            ) : (
              <ul className="space-y-3">
                {complaints.map((c) => (
                  <li key={c._id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-[#1A365D]/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900">{c.subject}</p>
                      <StatusBadge status={mapStatusToBadge(c.status)} size="sm" />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {formatDate(c.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Your Repairs */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-[#1A365D]">Your Repairs</h2>
            </div>
            {repairs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No repairs found.</p>
            ) : (
              <ul className="space-y-3">
                {repairs.slice(0, 3).map((r) => (
                  <li
                    key={r._id}
                    onClick={() => openRepairDetails(r)}
                    className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:border-[#1A365D]/20 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#1A365D]">
                      <span className="material-symbols-outlined">smartphone</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{r.deviceModel || 'Device'}</p>
                      <p className="text-xs text-slate-500">
                        {r.ticketId} • {formatDate(r.dateLogged)}
                      </p>
                    </div>
                    <StatusBadge status={r.status?.toLowerCase() || 'pending'} size="sm" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h2 className="text-base font-semibold text-[#1A365D] mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((act) => (
                <li key={act.id} className="flex items-start gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#1A365D]" aria-hidden="true" />
                  <div>
                    <p className="text-sm text-slate-800">{act.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center text-xs text-slate-400 pt-4">
          <p>Need help? <Link to="/support" className="text-[#D97706] hover:underline">Contact support</Link></p>
        </div>

      </div>

      {/* ✅ Repair Details Modal with Full Info */}
      <Modal
        isOpen={isRepairModalOpen}
        onClose={() => {
          setIsRepairModalOpen(false);
          setSelectedRepair(null);
        }}
        title="Repair Details"
        size="lg"
      >
        {selectedRepair && (
          <div className="space-y-5">
            {/* Header: Ticket ID & Status */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                  {selectedRepair.ticketId}
                </span>
                <StatusBadge status={selectedRepair.status?.toLowerCase() || 'pending'} size="sm" />
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(selectedRepair.priority || 'medium')}`}>
                  {selectedRepair.priority || 'medium'}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                {formatDate(selectedRepair.dateLogged)}
              </span>
            </div>

            {/* Device & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device</p>
                <p className="text-sm font-bold text-slate-800">{selectedRepair.deviceModel || 'Unknown'}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</p>
                <p className="text-sm font-bold text-slate-800">{selectedRepair.assignedTo || 'Unassigned'}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Issue Description</p>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                {selectedRepair.issueDescription || 'No description provided.'}
              </p>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                <p className="text-sm font-bold text-slate-800">{selectedRepair.customerName}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-sm font-bold text-slate-800">{selectedRepair.phoneNumber}</p>
              </div>
            </div>

            {/* Financials */}
            {selectedRepair.financials && (
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Financial Details</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400">Total Estimate</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(selectedRepair.financials.totalEstimate)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400">Amount Paid</p>
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(selectedRepair.financials.amountPaid)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400">Balance</p>
                    <p className={`text-sm font-bold ${selectedRepair.financials.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {formatCurrency(selectedRepair.financials.balanceDue)}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getPaymentStatusColor(selectedRepair.financials.paymentStatus)}`}>
                    {selectedRepair.financials.paymentStatus}
                  </span>
                </div>
              </div>
            )}

            {/* Images */}
            {selectedRepair.images && selectedRepair.images.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Device Photos</p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedRepair.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
                    >
                      <img src={img} alt={`Device photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Owner (if any) */}
            {selectedRepair.owner && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged By</p>
                <p className="text-sm font-bold text-slate-800">{selectedRepair.owner.username}</p>
              </div>
            )}

            {/* Close */}
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setIsRepairModalOpen(false);
                  setSelectedRepair(null);
                }}
                className="bg-[#1A365D] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#2D4A6B] transition-colors shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .font-display {
          font-family: 'Space Grotesk', system-ui, sans-serif;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
          display: inline-block;
          line-height: 1;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CustomerDashboard;