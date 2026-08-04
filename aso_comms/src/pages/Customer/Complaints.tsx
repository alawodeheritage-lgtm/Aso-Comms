// src/pages/Customer/Complaints.tsx - Updated with status management
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { complaintsAPI } from '../../api/complaints';
import { repairsAPI } from '../../api/repairs';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/axios';
import ImageUpload from '../../components/ImageUpload';

interface Complaint {
  _id: string;
  ticketId: string;
  subject: string;
  customerName: string;
  customerPhone: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'Open' | 'Under Review' | 'Escalated' | 'Resolved';
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  submittedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  resolvedBy?: {
    _id: string;
    username: string;
  };
  resolvedAt?: string;
  repair?: {
    _id: string;
    ticketId: string;
    deviceModel: string;
    status: string;
  };
  resolutionNotes?: string;
  customerEmail?: string;
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
}

interface FormData {
  ticketId: string;
  customerName: string;
  customerPhone: string;
  subject: string;
  category: string;
  description: string;
}

const CustomerComplaints: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('list');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [searchingTicket, setSearchingTicket] = useState(false);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [userRepairs, setUserRepairs] = useState<Repair[]>([]);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [isManagement, setIsManagement] = useState(false);
  const [complaintImages, setComplaintImages] = useState<any[]>([]);
const [complaintImageUrls, setComplaintImageUrls] = useState<string[]>([]);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    ticketId: '',
    customerName: '',
    customerPhone: '',
    subject: '',
    category: 'Faulty Repair',
    description: '',
  });

  const isStaff = user?.role === 'manager' || user?.role === 'ceo' || user?.isStaff;

  // Fetch user's repairs - STRICT MATCHING ONLY
  const fetchUserRepairs = async () => {
    try {
      console.log('🔄 Fetching user repairs with strict matching...');

      // Use the dashboard endpoint which has strict matching
      const response = await api.get('/dashboard');
      console.log('📊 Dashboard Response:', response.data);

      const repairsData = response.data.repairs || [];
      console.log('📊 Strictly matched repairs:', repairsData.length);

      setUserRepairs(repairsData);

      if (repairsData.length === 0) {
        setToast({
          message: 'No repair records found matching your exact name, email, and phone number.',
          type: 'info'
        });
      }
    } catch (err) {
      console.error('Failed to fetch repairs:', err);
    }
  };

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching complaints...');

      if (!user?._id) {
        console.log('❌ No user logged in');
        setComplaints([]);
        setLoading(false);
        return;
      }

      const response = await complaintsAPI.getAll();
      console.log('📊 API Response:', response);

      const complaintsData = response.complaints || [];
      const isManagement = response.isManagement || false;
      setIsManagement(isManagement);

      console.log(`📊 Found ${complaintsData.length} complaints`);
      console.log('📊 Is Management:', isManagement);
      console.log('📊 ResolvedBy sample:', complaintsData[0]?.resolvedBy);

      setComplaints(complaintsData);
    } catch (err: any) {
      console.error('❌ Failed to fetch complaints:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load complaints.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticket details when ticketId is entered
  const fetchTicketDetails = async (ticketId: string) => {
    if (!ticketId || ticketId.trim() === '') {
      return;
    }

    setSearchingTicket(true);
    try {
      console.log('🔍 Searching for ticket:', ticketId);

      // Search through user's strictly matched repairs
      const foundRepair = userRepairs.find(
        (r) => r.ticketId?.toUpperCase() === ticketId.trim().toUpperCase()
      );

      if (foundRepair) {
        console.log('✅ Found repair:', foundRepair);
        setSelectedRepair(foundRepair);
        setFormData(prev => ({
          ...prev,
          customerName: foundRepair.customerName || prev.customerName,
          customerPhone: foundRepair.phoneNumber || prev.customerPhone,
        }));
        setToast({
          message: `Ticket found! You can now lodge a complaint for ${foundRepair.deviceModel}.`,
          type: 'success'
        });
      } else {
        setSelectedRepair(null);
        setToast({
          message: 'Ticket not found. You can only lodge complaints for repairs that match your name, email, and phone number.',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error fetching ticket details:', err);
    } finally {
      setSearchingTicket(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchComplaints();
      fetchUserRepairs();
    }
  }, [user?._id]);

  useEffect(() => {
    if (id && complaints.length > 0) {
      const complaint = complaints.find(c => c._id === id);
      if (complaint) {
        setSelectedComplaint(complaint);
        setIsModalOpen(true);
        setActiveTab('list');
      }
    }
  }, [id, complaints]);

  useEffect(() => {
    if (formData.ticketId && formData.ticketId.trim().length > 3) {
      const timer = setTimeout(() => {
        fetchTicketDetails(formData.ticketId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.ticketId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTicketIdBlur = () => {
    if (formData.ticketId && formData.ticketId.trim()) {
      fetchTicketDetails(formData.ticketId);
    }
  };

  const handleSelectRepair = (repair: Repair) => {
    setSelectedRepair(repair);
    setFormData({
      ...formData,
      ticketId: repair.ticketId || '',
      customerName: repair.customerName || '',
      customerPhone: repair.phoneNumber || '',
    });
    setToast({
      message: `Selected repair: ${repair.deviceModel} (${repair.ticketId})`,
      type: 'success'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.subject || !formData.description || !formData.customerName) {
    setToast({ message: 'Please fill in all required fields', type: 'error' });
    return;
  }

  const userRepair = userRepairs.find(r => r.ticketId === formData.ticketId);
  if (!userRepair) {
    setToast({
      message: 'This ticket does not belong to you. You can only lodge complaints for your own repairs.',
      type: 'error'
    });
    return;
  }

  setSubmitLoading(true);

  try {
    const complaintData = {
      ticketId: formData.ticketId || undefined,
      customerName: formData.customerName.trim(),
      customerPhone: formData.customerPhone.trim() || '080XXXXXXXX',
      subject: formData.subject.trim(),
      category: formData.category,
      description: formData.description.trim(),
      // ✅ Add images
      images: complaintImages.map(img => ({
        url: img.url,
        publicId: img.publicId,
        originalName: img.originalName
      }))
    };

    console.log('📤 Submitting complaint:', complaintData);
    const response = await complaintsAPI.create(complaintData);
    console.log('✅ Complaint submitted:', response);

    setToast({ message: 'Complaint submitted successfully!', type: 'success' });

    setFormData({
      ticketId: '',
      customerName: '',
      customerPhone: '',
      subject: '',
      category: 'Faulty Repair',
      description: '',
    });
    setSelectedRepair(null);
    setComplaintImages([]); // ✅ Clear images

    setActiveTab('list');
    await fetchComplaints();

  } catch (err: any) {
    console.error('❌ Failed to submit complaint:', err);
    setToast({
      message: err.response?.data?.error || 'Failed to submit complaint.',
      type: 'error'
    });
  } finally {
    setSubmitLoading(false);
  }
};

  // FIXED: Handle status update with resolution notes
  const handleUpdateStatus = async (complaintId: string, status: string, resolutionNotes?: string) => {
    try {
      let notes = resolutionNotes;

      // If resolving, prompt for resolution notes if not provided
      if (status === 'Resolved' && !resolutionNotes) {
        notes = window.prompt('Please enter resolution notes:');
        if (notes === null) return; // User cancelled
      }

      const response = await complaintsAPI.updateStatus(complaintId, {
        status: status as 'Open' | 'Under Review' | 'Escalated' | 'Resolved',
        resolutionNotes: notes || ''
      });

      console.log('✅ Status updated:', response);

      setToast({ message: `Status updated to: ${status}`, type: 'success' });
      await fetchComplaints();

      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint({
          ...selectedComplaint,
          status: status as Complaint['status'],
          resolutionNotes: notes || selectedComplaint.resolutionNotes
        });
      }
    } catch (err: any) {
      console.error('❌ Failed to update status:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to update status.',
        type: 'error'
      });
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

  const getSeverityColor = (severity: string) => {
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

  // Calculate stats
  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const underReviewComplaints = complaints.filter(c => c.status === 'Under Review').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

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
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Complaints Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isStaff ? 'Manage and resolve customer complaints' : 'Manage, submit, and track resolution updates for your issues'}
          </p>
        </div>
        {!isStaff && (
          <button
            onClick={() => setActiveTab('submit')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 text-sm"
          >
            <span className="material-symbols-outlined text-lg">add_circle</span>
            Lodge New Complaint
          </button>
        )}
      </div>

      {/* Status Metrics Dashboard - Shows for everyone */}
      {complaints.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100 shadow-xs">
            <p className="text-2xl font-black text-blue-600">{openComplaints}</p>
            <p className="text-xs font-semibold text-blue-700 mt-0.5">Open</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-4 text-center border border-amber-100 shadow-xs">
            <p className="text-2xl font-black text-amber-600">{underReviewComplaints}</p>
            <p className="text-xs font-semibold text-amber-700 mt-0.5">Under Review</p>
          </div>
          <div className="bg-red-50 rounded-2xl p-4 text-center border border-red-100 shadow-xs">
            <p className="text-2xl font-black text-red-600">{escalatedComplaints}</p>
            <p className="text-xs font-semibold text-red-700 mt-0.5">Escalated</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100 shadow-xs">
            <p className="text-2xl font-black text-emerald-600">{resolvedComplaints}</p>
            <p className="text-xs font-semibold text-emerald-700 mt-0.5">Resolved</p>
          </div>
        </div>
      )}

      <div className="flex border-b border-slate-200 text-sm font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 transition-all border-b-2 ${activeTab === 'list'
            ? 'text-blue-600 border-blue-600'
            : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
        >
          {isStaff ? 'All Complaints' : 'My Complaints'} ({complaints.length})
        </button>
        {!isStaff && (
          <button
            onClick={() => setActiveTab('submit')}
            className={`pb-3 px-4 transition-all border-b-2 ${activeTab === 'submit'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
              }`}
          >
            Lodge New
          </button>
        )}
      </div>

      {activeTab === 'submit' && !isStaff && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Submit a New Complaint</h2>

          {userRepairs.length > 0 && (
            <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-xs font-bold text-blue-700 mb-2">Your Repair Records (Strictly Matched):</p>
              <div className="flex flex-wrap gap-2">
                {userRepairs.map((repair) => (
                  <button
                    key={repair._id}
                    onClick={() => handleSelectRepair(repair)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedRepair?._id === repair._id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                  >
                    {repair.ticketId} - {repair.deviceModel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {userRepairs.length === 0 && (
            <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
              <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
              <p className="text-xs text-amber-700">
                <span className="font-bold">No matching repairs found.</span> You can only lodge complaints for repairs that match your <strong>exact name, email, AND phone number</strong>.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form fields remain the same */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ticket ID <span className="text-red-500">*</span>
                <span className="text-slate-400 font-normal ml-1">(Enter your repair ticket ID)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="ticketId"
                  value={formData.ticketId}
                  onChange={handleInputChange}
                  onBlur={handleTicketIdBlur}
                  className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium placeholder-slate-400"
                  placeholder="e.g. ASO-2026-12345"
                  required
                />
                {searchingTicket && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter your repair ticket ID to verify your repair history with us
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium placeholder-slate-400"
                placeholder="Full name"
                required
                readOnly={!!selectedRepair}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-slate-400 font-normal">(Auto-filled from ticket)</span>
              </label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium placeholder-slate-400"
                placeholder="+234 800 000 0000"
                readOnly={!!selectedRepair}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium placeholder-slate-400"
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                  required
                >
                  <option>Faulty Repair</option>
                  <option>Delayed Timeline</option>
                  <option>Billing Issue</option>
                  <option>Poor Service</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium resize-none placeholder-slate-400"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>

            {selectedRepair && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start gap-2">
                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                <div>
                  <p className="text-xs text-green-700 font-medium">
                    Verified repair record found!
                  </p>
                  <p className="text-[10px] text-green-600">
                    {selectedRepair.deviceModel} • {selectedRepair.ticketId} • Status: {selectedRepair.status}
                  </p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitLoading || !selectedRepair}
              className="w-full h-11 sm:h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 text-sm disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {submitLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Submitting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Submit Complaint
                </>
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
            <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
            <p className="text-xs text-blue-700">
              <span className="font-bold">Note:</span> You can only lodge a complaint if you have a valid repair ticket ID that matches your <strong>exact name, email, AND phone number</strong>.
            </p>
          </div>
        </div>
      )}

      // In CustomerComplaints.tsx - Updated list item
      {activeTab === 'list' && (
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <span className="material-symbols-outlined text-3xl">inbox</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Complaints Found</h3>
              <p className="text-xs text-slate-500 mb-4">
                {isStaff ? 'No complaints in the system yet.' : 'You haven\'t submitted any complaints for your repairs yet.'}
              </p>
              {!isStaff && (
                <button
                  onClick={() => setActiveTab('submit')}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
                >
                  Lodge Your First Complaint
                </button>
              )}
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint._id}
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setIsModalOpen(true);
                }}
                className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
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
                    <p className="text-xs text-slate-500 font-medium">
                      {complaint.customerName} • {complaint.category} • {formatDate(complaint.createdAt)}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1">{complaint.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(
                          complaint.severity || 'medium'
                        )}`}
                      >
                        {complaint.severity || 'Medium'}
                      </span>

                      {/* ✅ Show Submitted By */}
                      {complaint.submittedBy && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">person</span>
                          By: {complaint.submittedBy.username}
                        </span>
                      )}

                      {/* ✅ Show Resolved By if resolved */}
                      {complaint.status === 'Resolved' && complaint.resolvedBy && (
                        <span className="text-[10px] text-emerald-600 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span>
                          Resolved by: {complaint.resolvedBy.username}
                        </span>
                      )}

                      {/* ✅ Show Resolved At if resolved */}
                      {complaint.status === 'Resolved' && complaint.resolvedAt && (
                        <span className="text-[10px] text-slate-400">
                          {formatDate(complaint.resolvedAt)}
                        </span>
                      )}
                    </div>

                    {/* ✅ Show Resolution Notes if resolved */}
                    {complaint.status === 'Resolved' && complaint.resolutionNotes && (
                      <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                        <p className="text-xs text-slate-700 mt-0.5">{complaint.resolutionNotes}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-xl">
                      chevron_right
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Complaint Details Modal - Updated with status management */}
      {/* Complaint Details Modal - Updated to show SubmittedBy and ResolvedBy */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
          navigate('/complaints', { replace: true });
        }}
        title="Complaint Details"
        size="xl"
      >
        {selectedComplaint && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">
                    {selectedComplaint.ticketId || 'No Ticket ID'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Submitted: {formatDate(selectedComplaint.createdAt)}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSeverityColor(
                  selectedComplaint.severity || 'medium'
                )}`}
              >
                {selectedComplaint.severity || 'Medium'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedComplaint.customerName}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedComplaint.category}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                <p className="text-xs font-bold text-slate-800 mt-0.5">{selectedComplaint.customerPhone || 'N/A'}</p>
              </div>

              {/* ✅ Show Submitted By in Modal */}
              {selectedComplaint.submittedBy ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted By</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-slate-400">person</span>
                    {selectedComplaint.submittedBy.username}
                  </p>
                  {selectedComplaint.submittedBy.email && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{selectedComplaint.submittedBy.email}</p>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted By</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">N/A</p>
                </div>
              )}

              {/* ✅ Show Resolved By in Modal */}
              {selectedComplaint.status === 'Resolved' && selectedComplaint.resolvedBy ? (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved By</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-emerald-500">check_circle</span>
                    {selectedComplaint.resolvedBy.username}
                  </p>
                  {selectedComplaint.resolvedAt && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Resolved on: {formatDate(selectedComplaint.resolvedAt)}
                    </p>
                  )}
                </div>
              ) : selectedComplaint.status === 'Resolved' ? (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved By</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">N/A</p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700">
                {selectedComplaint.description}
              </div>
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
  <div>
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Attached Images</p>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {selectedComplaint.images.map((img, index) => (
        <a
          key={index}
          href={img.url}
          target="_blank"
          rel="noreferrer"
          className="block aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
        >
          <img
            src={img.url}
            alt={`Attached image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </a>
      ))}
    </div>
  </div>
)}
            </div>

            {/* ✅ Show Resolution Notes in Modal */}
            {selectedComplaint.resolutionNotes && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                <p className="text-sm text-slate-700 mt-1">{selectedComplaint.resolutionNotes}</p>
                {selectedComplaint.resolvedBy && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    Resolved by: {selectedComplaint.resolvedBy.username}
                  </p>
                )}
              </div>
            )}

            {/* Status Management - Only for Staff */}
            {isStaff && (
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['Open', 'Under Review', 'Escalated', 'Resolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        if (status === 'Resolved') {
                          handleUpdateStatus(selectedComplaint._id, status);
                        } else {
                          handleUpdateStatus(selectedComplaint._id, status);
                        }
                      }}
                      disabled={selectedComplaint.status === status}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedComplaint.status === status
                        ? `bg-blue-100 text-blue-700 border-blue-200 cursor-default opacity-70`
                        : `bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-300`
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-2">
                  {selectedComplaint.status === 'Resolved'
                    ? 'This complaint has been resolved.'
                    : 'Select a new status to update this complaint.'}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs"
              >
                <span className="material-symbols-outlined text-base">print</span>
                Print
              </button>
              {isStaff && selectedComplaint.status !== 'Resolved' && (
                <button
                  onClick={() => handleUpdateStatus(selectedComplaint._id, 'Resolved')}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors active:scale-95 text-xs shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

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

export default CustomerComplaints;