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

// Status options
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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching complaints from backend...');
      const response = await complaintsAPI.getAll();
      console.log('✅ Raw API response:', response);

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

      console.log(`📊 Found ${complaintsData.length} complaints`);
      setComplaints(Array.isArray(complaintsData) ? complaintsData : []);
    } catch (err: any) {
      console.error('❌ Failed to fetch complaints:', err);
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
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200/60';
      case 'medium':
        return 'bg-amber-50 text-amber-800 border-amber-200/60';
      case 'low':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
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

  const handleStatusUpdate = async (id: string, status: string, notes?: string) => {
    setSubmitLoading(true);
    try {
      const response = await complaintsAPI.updateStatus(id, {
        status: status as 'Open' | 'Under Review' | 'Escalated' | 'Resolved',
        resolutionNotes: notes || resolutionNotes || `Status updated to ${status}`
      });
      console.log('Status updated:', response);

      // Update local state
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
      console.error('Failed to update status:', err);
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

  // Calculate stats
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const underReviewComplaints = complaints.filter(c => c.status === 'Under Review').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated').length;

  // Format date
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
          <p className="mt-3 text-sm font-medium text-slate-500">Loading complaints...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Complaints Resolution
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage and resolve customer complaints efficiently
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80">
          <p className="text-xl font-bold text-blue-600">{totalComplaints}</p>
          <p className="text-[10px] font-semibold text-slate-500">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
          <p className="text-xl font-bold text-blue-600">{openComplaints}</p>
          <p className="text-[10px] font-semibold text-blue-700">Open</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
          <p className="text-xl font-bold text-amber-600">{underReviewComplaints}</p>
          <p className="text-[10px] font-semibold text-amber-700">Under Review</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
          <p className="text-xl font-bold text-red-600">{escalatedComplaints}</p>
          <p className="text-[10px] font-semibold text-red-700">Escalated</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
          <p className="text-xl font-bold text-emerald-600">{resolvedComplaints}</p>
          <p className="text-[10px] font-semibold text-emerald-700">Resolved</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {['all', 'Open', 'Under Review', 'Escalated', 'Resolved'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === filter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
              inbox
            </span>
            <p className="text-sm font-semibold text-slate-700">No complaints found</p>
            <p className="text-xs text-slate-400 mt-0.5">There are no items matching this filter category.</p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <div
              key={complaint._id}
              className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {complaint.subject}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    {complaint.ticketId && (
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                        {complaint.ticketId}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">{complaint.customerName}</span>
                    <span>•</span>
                    <span>{complaint.category}</span>
                    <span>•</span>
                    <span>{formatDate(complaint.createdAt)}</span>
                  </p>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    {complaint.description}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(
                        complaint.severity || 'medium'
                      )}`}
                    >
                      {complaint.severity || 'Medium'}
                    </span>
                    {complaint.submittedBy && (
                      <span className="text-[10px] text-slate-400">
                        By: {complaint.submittedBy.username}
                      </span>
                    )}
                    {complaint.status === 'Resolved' && complaint.resolvedBy && (
                      <span className="text-[10px] text-emerald-600">
                        ✓ Resolved by: {complaint.resolvedBy.username}
                      </span>
                    )}
                  </div>

                  {/* Show resolution notes if resolved */}
                  {complaint.status === 'Resolved' && complaint.resolutionNotes && (
                    <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                      <p className="text-xs text-slate-700 mt-0.5">{complaint.resolutionNotes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 self-start md:self-center pt-2 md:pt-0 border-t md:border-0 border-slate-100 w-full md:w-auto justify-end">
                  {complaint.status !== 'Resolved' ? (
                    <>
                      <button
                        onClick={() => handleOpenModal(complaint)}
                        className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(complaint._id, 'Escalated')}
                        className="px-3.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors"
                      >
                        Escalate
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenModal(complaint)}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
                    >
                      View Details
                    </button>
                  )}
                  <Link
                    to={`/track?id=${complaint._id}`}
                    className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                    title="View Public Tracking Page"
                  >
                    <span className="material-symbols-outlined text-lg">open_in_new</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
          setResolutionNotes('');
          setViewingResolved(false);
        }}
        title={viewingResolved ? "Complaint Resolution Details" : "Complaint Resolution"}
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-5">
            {/* Status Section - Only show if not resolved */}
            {!viewingResolved && (
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => {
                        setSelectedStatus(status.value);
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

            {/* Complaint Info */}
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
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getSeverityColor(
                    selectedComplaint.severity || 'medium'
                  )}`}
                >
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

            {/* Resolution Notes - Show if resolved or allow input if not */}
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

            {/* Action Buttons */}
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

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
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

export default AdminComplaints;