// src/pages/Admin/ComplaintResolution.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../../api/complaints';
import Toast from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';

interface Complaint {
  _id: string;
  ticketId: string;
  subject: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  description: string;
  resolutionNotes: string;
  createdAt: string;
  resolvedAt?: string;
  submittedBy: {
    _id: string;
    username: string;
    email: string;
  };
  resolvedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  repair?: {
    ticketId: string;
    deviceModel: string;
    status: string;
  };
  statusHistory: Array<{
    status: string;
    notes: string;
    changedAt: string;
    changedBy: {
      username: string;
    };
  }>;
}

const ComplaintResolution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Complaint['status']>('Open');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchComplaint();
    }
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const response = await complaintsAPI.getOne(id!);
      const complaintData = response.complaint;
      setComplaint(complaintData);
      setSelectedStatus(complaintData.status);
      setResolutionNotes(complaintData.resolutionNotes || '');
    } catch (err: any) {
      console.error('❌ Failed to fetch complaint:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load complaint.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint) return;

    // If resolving, ensure resolution notes are provided
    if (selectedStatus === 'Resolved' && !resolutionNotes.trim()) {
      setToast({
        message: 'Please provide resolution notes before marking as resolved.',
        type: 'error'
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await complaintsAPI.updateStatus(complaint._id, {
        status: selectedStatus,
        resolutionNotes: resolutionNotes.trim() || undefined
      });

      setToast({
        message: response.message || `Complaint status updated to: ${selectedStatus}`,
        type: 'success'
      });

      // Refresh the complaint data
      await fetchComplaint();
    } catch (err: any) {
      console.error('❌ Failed to update status:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to update status.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!complaint) return;

    if (!resolutionNotes.trim()) {
      setToast({
        message: 'Please provide resolution notes.',
        type: 'error'
      });
      return;
    }

    setUpdating(true);
    try {
      const response = await complaintsAPI.updateStatus(complaint._id, {
        status: 'Resolved',
        resolutionNotes: resolutionNotes.trim()
      });

      setToast({
        message: 'Complaint marked as resolved successfully!',
        type: 'success'
      });

      setSelectedStatus('Resolved');
      await fetchComplaint();
    } catch (err: any) {
      console.error('❌ Failed to resolve complaint:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to resolve complaint.',
        type: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Escalated':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading complaint...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Complaint not found</p>
        <button
          onClick={() => navigate('/admin/complaints')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to Complaints
        </button>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';
  return (
    <div className="min-h-screen bg-[#F8F6F1] font-sans text-slate-700">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ backgroundColor: NAVY }}
            >
              <span className="material-symbols-outlined" aria-hidden>
                admin_panel_settings
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-[#1A365D]">Admin Dashboard</h1>
              <p className="text-sm text-slate-500">Overview of operations & finances</p>
            </div>
          </div>

          <div
            className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white p-1 shadow-sm"
            role="group"
            aria-label="Time range filter"
          >
            {timeRanges.map((r) => {
              const active = r === range
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={active}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A365D]/40 ${active ? "text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  style={active ? { backgroundColor: NAVY } : undefined}
                >
                  {r}
                </button>
              )
            })}
          </div>
        </header>

        {/* Metric cards */}
        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${m.tint}14`, color: m.tint }}
              >
                <span className="material-symbols-outlined" aria-hidden>
                  {m.icon}
                </span>
              </div>
              <p className="mt-4 font-display text-2xl font-bold text-[#1A365D]">{m.value}</p>
              <p className="mt-1 text-sm text-slate-500">{m.label}</p>
            </div>
          ))}
        </section>

        {/* Charts */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Line/bar chart placeholder */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#1A365D]">Monthly Activity</h2>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: NAVY }} />
                  Repairs
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: AMBER }} />
                  Revenue
                </span>
              </div>
            </div>
            <div className="mt-6 flex h-52 items-end justify-between gap-3">
              {monthly.map((d) => (
                <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-44 w-full items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t-md transition-all"
                      style={{ height: `${d.repairs}%`, backgroundColor: NAVY }}
                      title={`Repairs: ${d.repairs}`}
                    />
                    <div
                      className="w-1/2 rounded-t-md transition-all"
                      style={{ height: `${d.revenue}%`, backgroundColor: AMBER }}
                      title={`Revenue: ${d.revenue}`}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-500">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie chart placeholder */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-[#1A365D]">Repair Status</h2>
            <div className="mt-6 flex flex-col items-center">
              <div
                className="relative h-40 w-40 rounded-full"
                style={{ background: pieGradient() }}
                role="img"
                aria-label="Repair status distribution"
              >
                <div className="absolute inset-[22%] flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="font-display text-xl font-bold text-[#1A365D]">100</span>
                  <span className="text-[11px] text-slate-500">Total</span>
                </div>
              </div>
              <ul className="mt-6 w-full space-y-2">
                {repairStatus.map((r) => (
                  <li key={r.label} className="flex items-center justify-between text-sm">
                    <span className="inline-flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.label}
                    </span>
                    <span className="font-medium text-[#1A365D]">{r.value}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Payment status pills */}
        <section className="mt-6 flex flex-wrap gap-3">
          {paymentStatus.map((p) => (
            <div
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white px-4 py-2 shadow-sm"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.dot }} />
              <span className="text-sm text-slate-600">{p.label}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#1A365D]">
                {p.count}
              </span>
            </div>
          ))}
        </section>

        {/* Two-column: Complaints & Repairs */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#1A365D]">Recent Complaints</h2>
              <button className="text-sm font-medium text-[#D97706] hover:underline">View all</button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {complaints.map((c) => (
                <li key={c.ref} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{c.subject}</p>
                    <p className="text-xs text-slate-400">{c.ref}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ color: c.tone, backgroundColor: c.bg }}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#1A365D]">Recent Repairs</h2>
              <button className="text-sm font-medium text-[#D97706] hover:underline">View all</button>
            </div>
            <ul className="mt-4 divide-y divide-slate-100">
              {repairs.map((r) => (
                <li key={r.ref} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-800">{r.device}</p>
                    <p className="text-xs text-slate-400">{r.ref}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ color: r.tone, backgroundColor: r.bg }}
                  >
                    {r.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-6">
          <h2 className="font-display text-lg font-semibold text-[#1A365D]">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {quickActions.map((a) => (
              <button
                key={a.label}
                type="button"
                className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A365D]/40"
              >
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${NAVY}0F`, color: NAVY }}
                >
                  <span className="material-symbols-outlined" aria-hidden>
                    {a.icon}
                  </span>
                </span>
                <span className="text-sm font-medium text-slate-700">{a.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default ComplaintResolution;