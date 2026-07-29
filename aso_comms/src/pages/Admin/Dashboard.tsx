// src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import { repairsAPI } from '../../api/repairs';
import { complaintsAPI } from '../../api/complaints';
import { expensesAPI } from '../../api/expenses';

interface DashboardStats {
  totalComplaints: number;
  activeRepairs: number;
  slaAdherence: string;
  csatIndex: string;
  pendingComplaints: number;
  totalExpenses: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('7d');
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    activeRepairs: 0,
    slaAdherence: '94.2%',
    csatIndex: '4.8',
    pendingComplaints: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [repairsRes, complaintsRes, expensesRes] = await Promise.all([
        repairsAPI.getAll(),
        complaintsAPI.getAll(),
        expensesAPI.getAll()
      ]);

      const repairs = repairsRes.repairs || repairsRes.data || [];
      const complaints = complaintsRes.complaints || complaintsRes.data || [];
      const expenses = expensesRes.expenses || expensesRes.data || [];

      // Calculate stats
      const activeRepairs = repairs.filter((r: any) => r.status !== 'Collected' && r.status !== 'Resolved').length;
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter((c: any) => c.status === 'Open' || c.status === 'Pending').length;
      const totalExpenses = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      // Get recent complaints
      const recent = complaints.slice(0, 3).map((c: any) => ({
        id: c._id || c.id,
        title: c.subject || c.title || 'Complaint',
        customer: c.customerName || c.customer || 'Customer',
        status: c.status?.toLowerCase() || 'pending',
        time: new Date(c.createdAt || c.date).toLocaleDateString(),
        severity: c.severity || 'Medium'
      }));

      setStats({
        totalComplaints,
        activeRepairs,
        slaAdherence: '94.2%',
        csatIndex: '4.8',
        pendingComplaints,
        totalExpenses
      });
      setRecentComplaints(recent);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = [
    { label: 'TOTAL COMPLAINTS', value: stats.totalComplaints.toString(), icon: 'chat', trend: { value: '+12.4%', direction: 'up' as const } },
    { label: 'ACTIVE REPAIRS', value: stats.activeRepairs.toString(), icon: 'build', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { label: 'SLA ADHERENCE', value: stats.slaAdherence, icon: 'check_circle', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { label: 'CSAT INDEX', value: stats.csatIndex, icon: 'star', color: 'text-amber-500', bgColor: 'bg-amber-50' }
  ];

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
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Overview of all operations and customer complaints</p>
        </div>

        {/* Time Range Filter Pill */}
        <div className="flex items-center gap-1.5 bg-slate-200/60 p-1 rounded-2xl w-fit">
          {(['7d', '30d', 'ytd'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? '30 Days' : 'YTD'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Quick Actions Bar */}
      <div className="mb-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/admin/repairs"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-2 hover:bg-slate-50/80 hover:border-slate-300 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">build</span>
            </div>
            <p className="text-xs font-bold text-slate-800 text-center">Manage Repairs</p>
          </Link>

          <Link
            to="/admin/expenses"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-2 hover:bg-slate-50/80 hover:border-slate-300 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
            <p className="text-xs font-bold text-slate-800 text-center">Manage Expenses</p>
          </Link>

          <Link
            to="/admin/complaints"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-2 hover:bg-slate-50/80 hover:border-slate-300 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">chat</span>
            </div>
            <p className="text-xs font-bold text-slate-800 text-center">Resolve Complaints</p>
          </Link>

          <Link
            to="/admin/financials"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex flex-col items-center justify-center gap-2 hover:bg-slate-50/80 hover:border-slate-300 transition-all group active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <span className="material-symbols-outlined text-xl">trending_up</span>
            </div>
            <p className="text-xs font-bold text-slate-800 text-center">View Financials</p>
          </Link>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xs border border-slate-200/80">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Complaints</h3>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
          >
            View All
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </Link>
        </div>

        <div className="space-y-2.5">
          {recentComplaints.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-symbols-outlined text-3xl text-slate-400">inbox</span>
              <p className="text-sm text-slate-500 mt-2">No complaints found</p>
            </div>
          ) : (
            recentComplaints.map((complaint) => (
              <div
                key={complaint.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl border border-slate-200/60 transition-colors gap-3 cursor-pointer"
                onClick={() => navigate(`/admin/complaints?id=${complaint.id}`)}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        complaint.severity === 'Critical' || complaint.severity === 'high' 
                          ? 'bg-red-600' 
                          : complaint.severity === 'Medium' || complaint.severity === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                      }`}
                    ></span>
                    <p className="text-sm font-bold text-slate-900 truncate">{complaint.title}</p>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{complaint.customer}</span>
                    <span>•</span>
                    <span>{complaint.time}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50">
                  <span
                    className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                      complaint.severity === 'Critical' || complaint.severity === 'high'
                        ? 'bg-red-50 text-red-700 border-red-200/60'
                        : complaint.severity === 'Medium' || complaint.severity === 'medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-200/60'
                          : 'bg-blue-50 text-blue-700 border-blue-200/60'
                    }`}
                  >
                    {complaint.severity}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Material Symbols Styling */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;