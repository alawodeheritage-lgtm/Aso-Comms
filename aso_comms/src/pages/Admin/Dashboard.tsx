// src/pages/Admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
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
  revenue: number;
  outstanding: number;
  repairStatusCounts: { status: string; count: number }[];
  paymentStatusCounts: { status: string; count: number }[];
  monthlyTrends: { month: string; repairs: number; revenue: number }[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('7d');
  const [stats, setStats] = useState<DashboardStats>({
    totalComplaints: 0,
    activeRepairs: 0,
    slaAdherence: '94.2%',
    csatIndex: '4.8',
    pendingComplaints: 0,
    totalExpenses: 0,
    revenue: 0,
    outstanding: 0,
    repairStatusCounts: [],
    paymentStatusCounts: [],
    monthlyTrends: []
  });
  const [loading, setLoading] = useState(true);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [recentRepairs, setRecentRepairs] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [repairsRes, complaintsRes, expensesRes] = await Promise.all([
        repairsAPI.getAll(),
        complaintsAPI.getAll(),
        expensesAPI.getAll()
      ]);

      const repairs = repairsRes.repairs || repairsRes.data || [];
      const complaints = complaintsRes.complaints || complaintsRes.data || [];
      const expenses = expensesRes.expenses || expensesRes.data || [];

      // Financials
      const totalEstimate = repairs.reduce((sum: number, r: any) => sum + (r.financials?.totalEstimate || 0), 0);
      const totalPaid = repairs.reduce((sum: number, r: any) => sum + (r.financials?.amountPaid || 0), 0);
      const totalBalance = repairs.reduce((sum: number, r: any) => sum + (r.financials?.balanceDue || 0), 0);
      const totalExpensesSum = expenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      // Repair Status Counts
      const statusMap: Record<string, number> = {};
      repairs.forEach((r: any) => {
        const s = r.status || 'Unknown';
        statusMap[s] = (statusMap[s] || 0) + 1;
      });
      const repairStatusCounts = Object.entries(statusMap).map(([status, count]) => ({ status, count }));

      // Payment Status Counts
      const paymentMap: Record<string, number> = {};
      repairs.forEach((r: any) => {
        const ps = r.financials?.paymentStatus || 'Unknown';
        paymentMap[ps] = (paymentMap[ps] || 0) + 1;
      });
      const paymentStatusCounts = Object.entries(paymentMap).map(([status, count]) => ({ status, count }));

      // Monthly Trends (mock for now)
      const monthlyTrends = [
        { month: 'Jan', repairs: 12, revenue: 450000 },
        { month: 'Feb', repairs: 18, revenue: 720000 },
        { month: 'Mar', repairs: 15, revenue: 600000 },
        { month: 'Apr', repairs: 22, revenue: 880000 },
        { month: 'May', repairs: 20, revenue: 810000 },
        { month: 'Jun', repairs: 25, revenue: 1020000 },
      ];

      // Complaints
      const totalComplaints = complaints.length;
      const pendingComplaints = complaints.filter((c: any) => c.status === 'Open' || c.status === 'Pending').length;

      // Recent complaints (last 3)
      const recent = complaints.slice(0, 3).map((c: any) => ({
        id: c._id || c.id,
        title: c.subject || c.title || 'Complaint',
        customer: c.customerName || c.customer || 'Customer',
        status: c.status?.toLowerCase() || 'pending',
        time: new Date(c.createdAt || c.date).toLocaleDateString(),
        severity: c.severity || 'Medium'
      }));

      // Recent repairs (last 3)
      const recentRepairsList = repairs.slice(0, 3).map((r: any) => ({
        id: r._id || r.id,
        device: r.deviceModel || 'Device',
        customer: r.customerName || 'Customer',
        status: r.status || 'Pending',
        ticketId: r.ticketId || 'N/A',
        time: new Date(r.dateLogged || r.createdAt).toLocaleDateString(),
      }));

      setStats({
        totalComplaints,
        activeRepairs: repairs.filter((r: any) => r.status !== 'Collected' && r.status !== 'Resolved' && r.status !== 'Completed').length,
        slaAdherence: '94.2%',
        csatIndex: '4.8',
        pendingComplaints,
        totalExpenses: totalExpensesSum,
        revenue: totalPaid,
        outstanding: totalBalance,
        repairStatusCounts,
        paymentStatusCounts,
        monthlyTrends
      });

      setRecentComplaints(recent);
      setRecentRepairs(recentRepairsList);

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">Operational overview & financial health</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl shadow-sm border border-slate-200/80 w-fit">
            {(['7d', '30d', 'ytd'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${timeRange === range
                    ? 'bg-[#1A365D] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#1A365D] hover:bg-slate-50'
                  }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? '30 Days' : 'YTD'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue (Estimates)</p>
            <p className="text-2xl font-bold text-[#1A365D] mt-1">₦{(stats.revenue + stats.outstanding).toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Based on all repair estimates</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash in Hand (Received)</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₦{stats.revenue.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Total payments collected</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Receivables</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">₦{stats.outstanding.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">Unpaid balance</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1A365D] mb-4">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="repairs" stroke="#1A365D" strokeWidth={2} name="Repairs" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue (₦)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Repair Status Distribution */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm font-bold text-[#1A365D] mb-4">Repair Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats.repairStatusCounts}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.repairStatusCounts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-bold text-[#1A365D] mb-4">Payment Status</h3>
          <div className="flex flex-wrap gap-3">
            {stats.paymentStatusCounts.map((item) => (
              <div
                key={item.status}
                className={`px-4 py-2 rounded-full text-sm font-bold border ${item.status === 'Paid in Full'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.status === 'Partial / Deposit Logged'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
              >
                {item.status}: {item.count}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Complaints */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1A365D]">Recent Complaints</h3>
              <Link
                to="/admin/complaints"
                className="text-xs font-medium text-[#D97706] hover:text-[#b85f00] flex items-center gap-0.5 transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            {recentComplaints.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <span className="material-symbols-outlined text-3xl text-slate-300">inbox</span>
                <p className="text-sm mt-2">No complaints found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-[#1A365D]/20"
                    onClick={() => navigate(`/admin/complaints?id=${c.id}`)}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-500">{c.customer} • {c.time}</p>
                    </div>
                    <StatusBadge status={c.status} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Repairs */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1A365D]">Recent Repairs</h3>
              <Link
                to="/admin/repairs"
                className="text-xs font-medium text-[#D97706] hover:text-[#b85f00] flex items-center gap-0.5 transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </Link>
            </div>
            {recentRepairs.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <span className="material-symbols-outlined text-3xl text-slate-300">build</span>
                <p className="text-sm mt-2">No repairs found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentRepairs.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-[#1A365D]/20"
                    onClick={() => navigate(`/admin/repairs?id=${r.id}`)}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{r.device} <span className="font-mono text-xs text-slate-400 ml-1">({r.ticketId})</span></p>
                      <p className="text-xs text-slate-500">{r.customer} • {r.time}</p>
                    </div>
                    <StatusBadge status={r.status.toLowerCase()} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/admin/repairs"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1A365D]/10 text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">build</span>
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#1A365D] transition-colors">Manage Repairs</p>
          </Link>
          <Link
            to="/admin/expenses"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1A365D]/10 text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#1A365D] transition-colors">Manage Expenses</p>
          </Link>
          <Link
            to="/admin/complaints"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1A365D]/10 text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">chat</span>
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#1A365D] transition-colors">Resolve Complaints</p>
          </Link>
          <Link
            to="/admin/financials"
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all flex flex-col items-center justify-center gap-2 group active:scale-95"
          >
            <div className="w-12 h-12 rounded-xl bg-[#1A365D]/10 text-[#1A365D] group-hover:bg-[#1A365D] group-hover:text-white transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
            <p className="text-xs font-bold text-slate-800 group-hover:text-[#1A365D] transition-colors">View Financials</p>
          </Link>
        </div>

      </div>

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

export default AdminDashboard;