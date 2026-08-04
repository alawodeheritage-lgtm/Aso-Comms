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
    <div className="max-w-5xl mx-auto px-4 py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate('/admin/complaints')}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-1"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to Complaints
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Complaint Resolution</h1>
          <p className="text-sm text-slate-500">Ticket #{complaint.ticketId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(complaint.status)}`}>
            {complaint.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(complaint.severity)}`}>
            {complaint.severity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Complaint Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
            <h2 className="text-sm font-bold text-slate-700 mb-4">Complaint Details</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</p>
                <p className="text-base font-bold text-slate-800">{complaint.subject}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  {complaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-medium text-slate-700">{complaint.category}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                  <p className="text-sm font-medium text-slate-700">{complaint.customerName}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-medium text-slate-700">{complaint.customerPhone}</p>
                </div>
                {complaint.repair && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Repair Ticket</p>
                    <p className="text-sm font-medium text-slate-700">{complaint.repair.ticketId}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted</p>
                  <p className="text-sm font-medium text-slate-700">{formatDate(complaint.createdAt)}</p>
                </div>
                {complaint.resolvedAt && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved At</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(complaint.resolvedAt)}</p>
                  </div>
                )}
              </div>

              {complaint.resolvedBy && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved By</p>
                  <p className="text-sm font-medium text-slate-700">{complaint.resolvedBy.username}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status History */}
          {complaint.statusHistory && complaint.statusHistory.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Status History</h2>
              <div className="space-y-3">
                {complaint.statusHistory.map((entry, index) => (
                  <div key={index} className="flex items-start gap-3 border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${entry.status === 'Resolved' ? 'bg-emerald-500' :
                        entry.status === 'Open' ? 'bg-blue-500' :
                          entry.status === 'Under Review' ? 'bg-amber-500' : 'bg-red-500'
                      }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">{entry.status}</span>
                        <span className="text-xs text-slate-400">{formatDate(entry.changedAt)}</span>
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-slate-500 mt-0.5">{entry.notes}</p>
                      )}
                      {entry.changedBy && (
                        <p className="text-[10px] text-slate-400 mt-0.5">By: {entry.changedBy.username}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Status Management */}
        <div className="lg:col-span-1 space-y-6">
          {/* Resolution Notes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
            <h2 className="text-sm font-bold text-slate-700 mb-3">
              {isResolved ? 'Resolution Notes' : 'Update Status'}
            </h2>

            {isResolved ? (
              <div className="space-y-3">
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Resolved Notes</p>
                  <p className="text-sm text-slate-700 mt-1">{complaint.resolutionNotes || 'No notes provided'}</p>
                </div>
                <button
                  onClick={() => navigate(`/complaints/${complaint._id}`)}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors text-sm"
                >
                  View in Customer View
                </button>
              </div>
            ) : (
              <>
                {/* Status Selection */}
                <div className="space-y-2 mb-4">
                  <label className="block text-xs font-bold text-slate-700">Select Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Open', 'Under Review', 'Escalated', 'Resolved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status as Complaint['status'])}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${selectedStatus === status
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {selectedStatus === 'Resolved' ? 'Resolution Notes *' : 'Notes (Optional)'}
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium resize-none placeholder-slate-400"
                    placeholder={
                      selectedStatus === 'Resolved'
                        ? 'Describe the steps taken to resolve this complaint...'
                        : 'Add any notes about this status update...'
                    }
                  />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleStatusUpdate}
                    disabled={updating}
                    className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all text-sm disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                        Updating...
                      </>
                    ) : (
                      'Send Update'
                    )}
                  </button>

                  <button
                    onClick={handleMarkResolved}
                    disabled={updating || !resolutionNotes.trim()}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    Mark as Resolved
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Quick Info */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Ticket ID</span>
                <span className="text-xs font-bold text-slate-700">{complaint.ticketId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Customer</span>
                <span className="text-xs font-bold text-slate-700">{complaint.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <span className={`text-xs font-bold ${complaint.status === 'Resolved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {complaint.status}
                </span>
              </div>
              {complaint.repair && (
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500">Repair</span>
                  <span className="text-xs font-bold text-slate-700">{complaint.repair.ticketId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
};

export default ComplaintResolution;