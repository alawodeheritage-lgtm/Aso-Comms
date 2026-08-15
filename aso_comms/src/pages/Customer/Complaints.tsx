// src/pages/Customer/Complaints.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { complaintsAPI } from '../../api/complaints';
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
  images?: any[];
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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    ticketId: '',
    customerName: '',
    customerPhone: '',
    subject: '',
    category: 'Faulty Repair',
    description: '',
  });

  const isStaff = user?.role === 'manager' || user?.role === 'ceo' || user?.isStaff;

  // ========== LOGIC (COMPLETELY UNCHANGED) ==========
  const fetchUserRepairs = async () => {
    try {
      console.log('🔄 Fetching user repairs with strict matching...');
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

  const fetchTicketDetails = async (ticketId: string) => {
    if (!ticketId || ticketId.trim() === '') return;
    setSearchingTicket(true);
    try {
      console.log('🔍 Searching for ticket:', ticketId);
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
      setComplaintImages([]);
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

  const handleUpdateStatus = async (complaintId: string, status: string, resolutionNotes?: string) => {
    try {
      let notes = resolutionNotes;
      if (status === 'Resolved' && !resolutionNotes) {
        notes = window.prompt('Please enter resolution notes:');
        if (notes === null) return;
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

  const totalComplaints = complaints.length;
  const openComplaints = complaints.filter(c => c.status === 'Open').length;
  const underReviewComplaints = complaints.filter(c => c.status === 'Under Review').length;
  const escalatedComplaints = complaints.filter(c => c.status === 'Escalated').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

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

  // ============== HUMANIZED UI ==============
  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Complaints Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {isStaff ? 'Manage and resolve customer complaints' : 'Manage, submit, and track resolution updates for your issues.'}
            </p>
          </div>
          {!isStaff && (
            <button
              onClick={() => setActiveTab('submit')}
              className="inline-flex items-center gap-2 bg-[#1A365D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#1A365D]/20"
            >
              <span className="material-symbols-outlined text-lg">add_circle</span>
              Lodge New Complaint
            </button>
          )}
        </div>

        {/* Stats */}
        {complaints.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-2xl font-bold text-blue-600">{openComplaints}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-2xl font-bold text-amber-600">{underReviewComplaints}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Under Review</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-2xl font-bold text-red-600">{escalatedComplaints}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Escalated</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow text-center">
              <p className="text-2xl font-bold text-emerald-600">{resolvedComplaints}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200/60 gap-6">
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'list'
              ? 'text-[#1A365D] border-b-2 border-[#1A365D]'
              : 'text-slate-500 hover:text-[#1A365D]'
              }`}
          >
            {isStaff ? 'All Complaints' : 'My Complaints'} ({complaints.length})
          </button>
          {!isStaff && (
            <button
              onClick={() => setActiveTab('submit')}
              className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'submit'
                ? 'text-[#1A365D] border-b-2 border-[#1A365D]'
                : 'text-slate-500 hover:text-[#1A365D]'
                }`}
            >
              Lodge New
            </button>
          )}
        </div>

        {/* Submit Form */}
        {activeTab === 'submit' && !isStaff && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-lg font-display font-bold text-[#1A365D] mb-5">Submit a New Complaint</h2>

            {userRepairs.length > 0 && (
              <div className="mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-bold text-blue-700 mb-2">Your Repair Records (Strictly Matched):</p>
                <div className="flex flex-wrap gap-2">
                  {userRepairs.map((repair) => (
                    <button
                      key={repair._id}
                      onClick={() => handleSelectRepair(repair)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedRepair?._id === repair._id
                        ? 'bg-[#1A365D] text-white border-[#1A365D]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#1A365D]/30'
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ticket ID <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">confirmation_number</span>
                  <input
                    type="text"
                    name="ticketId"
                    value={formData.ticketId}
                    onChange={handleInputChange}
                    onBlur={handleTicketIdBlur}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="e.g. ASO-2026-12345"
                    required
                  />
                  {searchingTicket && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="material-symbols-outlined animate-spin text-slate-400">progress_activity</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">person</span>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="Full name"
                    required
                    readOnly={!!selectedRepair}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">call</span>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="+234 800 000 0000"
                    readOnly={!!selectedRepair}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                  placeholder="Brief summary of the issue"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                  placeholder="Please describe your issue in detail..."
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attach Images <span className="text-slate-400 font-normal">(Optional)</span></label>
                <ImageUpload
                  onUploadComplete={(files) => setComplaintImages(files)}
                  maxFiles={3}
                  uploadType="complaint"
                  existingImages={complaintImages}
                />
              </div>

              {selectedRepair && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">check_circle</span>
                  <div>
                    <p className="text-xs text-emerald-700 font-medium">Verified repair record found!</p>
                    <p className="text-[10px] text-emerald-600">{selectedRepair.deviceModel} • {selectedRepair.ticketId} • Status: {selectedRepair.status}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitLoading || !selectedRepair}
                className="w-full h-11 bg-[#1A365D] text-white font-bold rounded-xl hover:bg-[#2D4A6B] active:scale-95 transition-all shadow-sm shadow-[#1A365D]/20 text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
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
          </div>
        )}

        {/* Complaints List */}
        {activeTab === 'list' && (
          <div className="space-y-4">
            {complaints.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
                <span className="material-symbols-outlined text-3xl text-slate-300">inbox</span>
                <p className="text-sm font-bold text-slate-700 mt-2">No Complaints Found</p>
                <p className="text-xs text-slate-500">{isStaff ? 'No complaints in the system yet.' : "You haven't submitted any complaints for your repairs yet."}</p>
                {!isStaff && (
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="mt-4 bg-[#1A365D] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#2D4A6B] transition-colors"
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
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-display font-bold text-[#1A365D]">{complaint.subject}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                        {complaint.ticketId && (
                          <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                            {complaint.ticketId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{complaint.customerName} • {complaint.category} • {formatDate(complaint.createdAt)}</p>
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">{complaint.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(complaint.severity || 'medium')}`}>
                          {complaint.severity || 'Medium'}
                        </span>
                        {complaint.submittedBy && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">person</span>
                            By: {complaint.submittedBy.username}
                          </span>
                        )}
                        {complaint.status === 'Resolved' && complaint.resolvedBy && (
                          <span className="text-xs text-emerald-600 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            Resolved by: {complaint.resolvedBy.username}
                          </span>
                        )}
                      </div>
                      {complaint.status === 'Resolved' && complaint.resolutionNotes && (
                        <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                          <p className="text-xs text-slate-700 mt-0.5">{complaint.resolutionNotes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal */}
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
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                      {selectedComplaint.ticketId || 'No Ticket ID'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedComplaint.status)}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Submitted: {formatDate(selectedComplaint.createdAt)}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(selectedComplaint.severity || 'medium')}`}>
                  {selectedComplaint.severity || 'Medium'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.customerName}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.category}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.customerPhone || 'N/A'}</p>
                </div>
                {selectedComplaint.submittedBy && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submitted By</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.submittedBy.username}</p>
                  </div>
                )}
                {selectedComplaint.resolvedBy && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolved By</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedComplaint.resolvedBy.username}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700">
                  {selectedComplaint.description}
                </div>
              </div>

              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attached Images</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {selectedComplaint.images.map((img, index) => (
                      <a
                        key={index}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity"
                      >
                        <img src={img.url} alt={`Attached image ${index + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {selectedComplaint.resolutionNotes && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Resolution Notes</p>
                  <p className="text-sm text-slate-700 mt-1">{selectedComplaint.resolutionNotes}</p>
                  {selectedComplaint.resolvedBy && (
                    <p className="text-xs text-slate-500 mt-1">Resolved by: {selectedComplaint.resolvedBy.username}</p>
                  )}
                </div>
              )}

              {isStaff && (
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['Open', 'Under Review', 'Escalated', 'Resolved'].map((status) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(selectedComplaint._id, status)}
                        disabled={selectedComplaint.status === status}
                        className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${selectedComplaint.status === status
                          ? 'bg-blue-100 text-blue-700 border-blue-200 cursor-default opacity-70'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors text-xs"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print
                </button>
                {isStaff && selectedComplaint.status !== 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedComplaint._id, 'Resolved')}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-bold hover:bg-emerald-700 transition-colors text-xs shadow-xs"
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
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomerComplaints;