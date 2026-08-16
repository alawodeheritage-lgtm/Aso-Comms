// src/pages/Admin/ComplaintResolution.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintsAPI } from '../../api/complaints';
import Toast from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';

// ✅ ADD MISSING IMPORTS
// import { NAVY, AMBER } from '../../constants/colors'; // Or define them below
import { useAuth } from '../../context/AuthContext';

// ✅ ADD MISSING INTERFACES AND CONSTANTS
const timeRanges = ['Today', 'Week', 'Month', 'Year'];
const NAVY = '#1A365D';
const AMBER = '#D97706';

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

// ✅ ADD MISSING DATA FOR DASHBOARD
const metrics = [
  { label: 'Total Repairs', value: '156', icon: 'build', tint: NAVY },
  { label: 'Active Complaints', value: '12', icon: 'chat', tint: AMBER },
  { label: 'Revenue', value: '₦2.4M', icon: 'payments', tint: '#10B981' },
  { label: 'Customers', value: '89', icon: 'people', tint: '#6366F1' },
];

const monthly = [
  { month: 'Jan', repairs: 40, revenue: 30 },
  { month: 'Feb', repairs: 60, revenue: 50 },
  { month: 'Mar', repairs: 70, revenue: 65 },
  { month: 'Apr', repairs: 50, revenue: 45 },
  { month: 'May', repairs: 80, revenue: 70 },
  { month: 'Jun', repairs: 90, revenue: 85 },
];

const repairStatus = [
  { label: 'Pending', value: 25, color: '#EF4444' },
  { label: 'In Progress', value: 35, color: '#3B82F6' },
  { label: 'Ready', value: 20, color: '#10B981' },
  { label: 'Collected', value: 20, color: '#64748B' },
];

const paymentStatus = [
  { label: 'Paid in Full', count: 45, dot: '#10B981' },
  { label: 'Partial', count: 28, dot: '#D97706' },
  { label: 'Unpaid', count: 18, dot: '#EF4444' },
];

const complaints = [
  { ref: 'CMP-001', subject: 'Device not charging', status: 'Open', tone: '#2563EB', bg: '#DBEAFE' },
  { ref: 'CMP-002', subject: 'Screen crack', status: 'Under Review', tone: '#D97706', bg: '#FEF3C7' },
  { ref: 'CMP-003', subject: 'Battery drain', status: 'Escalated', tone: '#DC2626', bg: '#FEE2E2' },
];

const repairs = [
  { ref: 'RPR-001', device: 'iPhone 14 Pro', status: 'Repairing', tone: '#3B82F6', bg: '#DBEAFE' },
  { ref: 'RPR-002', device: 'Samsung S23', status: 'Ready', tone: '#10B981', bg: '#D1FAE5' },
  { ref: 'RPR-003', device: 'MacBook Air', status: 'Pending', tone: '#EF4444', bg: '#FEE2E2' },
];

const quickActions = [
  { label: 'New Repair', icon: 'add_circle' },
  { label: 'Manage Complaints', icon: 'chat' },
  { label: 'View Reports', icon: 'analytics' },
  { label: 'Staff Management', icon: 'groups' },
];

const ComplaintResolution: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<Complaint['status']>('Open');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [range, setRange] = useState('Week');

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

  // ✅ ADD PIE GRADIENT FUNCTION
  const pieGradient = () => {
    const colors = ['#EF4444', '#3B82F6', '#10B981', '#64748B'];
    const total = repairStatus.reduce((sum, r) => sum + r.value, 0);
    let currentAngle = 0;
    const stops = repairStatus.map((r, i) => {
      const percentage = (r.value / total) * 100;
      const start = currentAngle;
      currentAngle += percentage;
      return `${colors[i]} ${start}% ${currentAngle}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
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
        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Rest of your existing render code */}
        {/* ... (keep all your existing JSX) */}

        <div className="text-center py-8">
          <h1 className="text-2xl font-bold text-[#1A365D]">Complaint Resolution</h1>
          <p className="text-slate-500 mt-2">
            Resolving complaint: {complaint.ticketId} - {complaint.subject}
          </p>

          {/* Add your complaint resolution UI here */}
        </div>
      </div>
    </div>
  );
};

export default ComplaintResolution;