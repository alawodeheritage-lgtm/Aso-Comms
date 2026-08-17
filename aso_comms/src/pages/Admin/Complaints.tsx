// src/pages/Admin/Complaints.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { complaintsAPI } from '../../api/complaints';

interface Complaint {
  _id: string;
  ticketId: string;
  subject: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  description: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
  submittedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  resolvedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  resolvedAt?: string;
  repair?: {
    ticketId: string;
    deviceModel: string;
    status: string;
  };
  statusHistory?: Array<{
    status: string;
    notes: string;
    changedAt: string;
    changedBy: {
      username: string;
    };
  }>;
}

const STATUS_OPTIONS = [
  { value: 'Open', label: 'Open', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Under Review', label: 'Under Review', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Escalated', label: 'Escalated', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'Resolved', label: 'Resolved', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
];

const AdminComplaints: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [viewingResolved, setViewingResolved] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // console.log('🔄 Fetching complaints from backend...');
      const response = await complaintsAPI.getAll();
      // console.log('✅ Raw API response:', response);

      let complaintsData = [];
      if (response.complaints) {
        complaintsData = response.complaints;
      } else if (response.data) {
        complaintsData = response.data;
      } else if (Array.isArray(response)) {
        complaintsData = response;
      } else {
        complaintsData = [];
      }

      // console.log(`📊 Found ${complaintsData.length} complaints`);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (err: any) {
      // console.error('❌ Failed to fetch complaints:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load complaints. Please refresh.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const getSeverityColor = (severity: Complaint['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200/60';
      case 'medium': return 'bg-amber-50 text-amber-800 border-amber-200/60';
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under Review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Escalated': return 'bg-red-50 text-red-700 border-red-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    setSubmitLoading(true);
    try {
      const response = await complaintsAPI.updateStatus(id, {
        status: status as 'Open' | 'Under Review' | 'Escalated' | 'Resolved',
        resolutionNotes: notes || resolutionNotes || `Status updated to ${status}`
      });
      // console.log('Status updated:', response);

      setComplaints((prev) =>
        prev.map((c) =>
          c._id === id
            ? {
              ...c,
              status: status as Complaint['status'],
              resolutionNotes: notes || resolutionNotes || c.resolutionNotes,
              resolvedBy: status === 'Resolved' ? response.complaint?.resolvedBy : c.resolvedBy,
              resolvedAt: status === 'Resolved' ? new Date().toISOString() : c.resolvedAt
            }
            : c
        )
      );

      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint({
          ...selectedComplaint,
          status: status as Complaint['status'],
          resolutionNotes: notes || resolutionNotes || selectedComplaint.resolutionNotes
        });
      }

      setToast({
        message: status === 'Resolved' ? 'Complaint resolved successfully!' : `Status updated to: ${status}`,
        type: 'success'
      });

      setIsModalOpen(false);
      setSelectedComplaint(null);
      setResolutionNotes('');
      await fetchComplaints();
    } catch (err: any) {
      // console.error('Failed to update status:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to update status.',
        type: 'error'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResolveComplaint = async (id: string) => {
    if (!resolutionNotes.trim()) {
      setToast({ message: 'Please add resolution notes before resolving.', type: 'error' });
      return;
    }
    await handleStatusUpdate(id, 'Resolved', resolutionNotes.trim());
  };

  const handleOpenModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResolutionNotes(complaint.resolutionNotes || '');
    setSelectedStatus(complaint.status);
    setViewingResolved(complaint.status === 'Resolved');
    setIsModalOpen(true);
  };

  const filteredComplaints =
    activeFilter === 'all'
      ? complaints
      : complaints.filter((c) => c.status?.toLowerCase() === activeFilter.toLowerCase() || c.status === activeFilter);

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const underReviewComplaints = complaints.filter(c => c.status === 'Under Review').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated').length;

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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">
            Complaints Resolution
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Review, resolve, and escalate customer complaints across all service channels.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="material-symbols-outlined text-[#1A365D] text-2xl">chat</span>
            </div>
            <p className="text-2xl font-bold text-[#1A365D] mt-1">{totalComplaints}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Open</span>
              <span className="material-symbols-outlined text-blue-600 text-2xl">pending</span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-1">{openComplaints}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Under Review</span>
              <span className="material-symbols-outlined text-amber-600 text-2xl">review</span>
            </div>
            <p className="text-2xl font-bold text-amber-600 mt-1">{underReviewComplaints}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Escalated</span>
              <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
            </div>
            <p className="text-2xl font-bold text-red-600 mt-1">{escalatedComplaints}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Resolved</span>
              <span className="material-symbols-outlined text-emerald-600 text-2xl">check_circle</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{resolvedComplaints}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/60 pb-2">
          {['all', 'Open', 'Under Review', 'Escalated', 'Resolved'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter
                ? 'bg-[#1A365D] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-[#1A365D]'
                }`}
            >
              {filter === 'all' ? 'All' : filter}
            </button>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filteredComplaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <span className="material-symbols-outlined text-3xl text-slate-300">inbox</span>
              <p className="text-sm font-bold text-slate-700 mt-2">No complaints found</p>
              <p className="text-xs text-slate-500">Try adjusting your filter.</p>
            </div>
          ) : (
            filteredComplaints.map((complaint) => (
              <div
                key={complaint._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(complaint.severity || 'medium')}`}>
                        {complaint.severity || 'medium'}
                      </span>
                      {complaint.ticketId && (
                        <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                          {complaint.ticketId}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-display font-bold text-[#1A365D] mt-1">{complaint.subject}</h3>
                    <p className="text-sm text-slate-600 mt-1">{complaint.description}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                        {complaint.customerName}
                      </span>
                      {complaint.submittedBy && (
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm text-slate-400">alternate_email</span>
                          {complaint.submittedBy.username}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
                        {formatDate(complaint.createdAt)}
                      </span>
                    </div>

                    {complaint.status === 'Resolved' && complaint.resolutionNotes && (
                      <div className="mt-3 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Resolution notes
                        </p>
                        <p className="mt-1 text-sm text-emerald-800/90">{complaint.resolutionNotes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 lg:flex-col">
                    {complaint.status === 'Resolved' ? (
                      <button
                        onClick={() => handleOpenModal(complaint)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-[#1A365D] hover:bg-slate-50 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        View Details
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenModal(complaint)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1A365D] px-4 py-2 text-sm font-medium text-white hover:bg-[#2D4A6B] transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">task_alt</span>
                          Resolve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(complaint._id, 'Escalated')}
                          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D97706]/40 bg-[#D97706]/10 px-4 py-2 text-sm font-medium text-[#D97706] hover:bg-[#D97706]/20 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">trending_up</span>
                          Escalate
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedComplaint(null);
            setResolutionNotes('');
            setViewingResolved(false);
          }}
          title={viewingResolved ? 'Complaint Resolution Details' : 'Complaint Resolution'}
          size="lg"
        >
          {selectedComplaint && (
            <div className="space-y-5">
              {/* Status update buttons (only if not resolved) */}
              {!viewingResolved && (
                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          if (status.value === 'Resolved' && !resolutionNotes.trim()) {
                            setToast({ message: 'Please add resolution notes before resolving.', type: 'error' });
                            return;
                          }
                          handleStatusUpdate(selectedComplaint._id, status.value);
                        }}
                        disabled={selectedComplaint.status === status.value || submitLoading}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedComplaint.status === status.value
                          ? `${status.color} cursor-default opacity-70`
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Complaint info */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Customer</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedComplaint.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Category</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Severity</p>
                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getSeverityColor(selectedComplaint.severity || 'medium')}`}>
                    {selectedComplaint.severity || 'Medium'}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-slate-500">Ticket ID</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.ticketId || 'N/A'}</p>
                </div>
                {selectedComplaint.submittedBy && (
                  <div className="col-span-2">
                    <p className="text-xs font-semibold text-slate-500">Submitted By</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.submittedBy.username}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500">Issue Description</p>
                <p className="text-sm font-medium text-slate-800 mt-1 bg-white p-3 rounded-lg border border-slate-200">
                  {selectedComplaint.description}
                </p>
              </div>

              {/* Resolution notes */}
              {viewingResolved ? (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                  <p className="text-sm text-slate-700 mt-1">{selectedComplaint.resolutionNotes || 'No notes provided'}</p>
                  {selectedComplaint.resolvedBy && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Resolved by: {selectedComplaint.resolvedBy.username} at {formatDate(selectedComplaint.resolvedAt || '')}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Resolution Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    className="w-full min-h-[110px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                    placeholder="Describe the steps taken to resolve this complaint..."
                  />
                </div>
              )}

              {/* Action buttons */}
              {!viewingResolved && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleResolveComplaint(selectedComplaint._id)}
                    disabled={submitLoading || !resolutionNotes.trim()}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Resolving...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Mark as Resolved
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (selectedStatus && selectedStatus !== selectedComplaint.status) {
                        handleStatusUpdate(selectedComplaint._id, selectedStatus);
                      } else {
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
                  >
                    {selectedStatus && selectedStatus !== selectedComplaint.status ? 'Update Status' : 'Close'}
                  </button>
                </div>
              )}

              {viewingResolved && (
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </Modal>

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

export default AdminComplaints;