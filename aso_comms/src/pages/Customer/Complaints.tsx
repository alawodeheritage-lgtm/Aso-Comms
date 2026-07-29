import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

interface Complaint {
  id: string;
  title: string;
  reference: string;
  status: 'pending' | 'in-progress' | 'under-review' | 'resolved' | 'escalated' | 'closed';
  date: string;
  description: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  updates: {
    id: string;
    message: string;
    time: string;
    isAgent: boolean;
  }[];
}

interface FormData {
  subject: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  attachments: File[];
}

const CustomerComplaints: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'submit' | 'list'>('list');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    subject: '',
    category: 'Billing',
    severity: 'medium',
    description: '',
    attachments: [],
  });

  // Sample complaints data
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Screen Replacement - iPhone 14 Pro',
      reference: '#REC-2045',
      status: 'pending',
      date: 'Dec 14, 2023',
      description:
        'My iPhone 14 Pro screen cracked after a drop. The touch screen is not responding properly and there are visible cracks.',
      category: 'Hardware Issue',
      severity: 'high',
      updates: [
        {
          id: '1',
          message: 'Complaint submitted successfully. We will review it shortly.',
          time: 'Dec 14, 2023 • 09:42 AM',
          isAgent: false,
        },
        {
          id: '2',
          message: 'Thank you for your complaint. A specialist has been assigned to your case.',
          time: 'Dec 14, 2023 • 11:15 AM',
          isAgent: true,
        },
      ],
    },
    {
      id: '2',
      title: 'Battery Draining Fast - MacBook Air',
      reference: '#REC-2030',
      status: 'in-progress',
      date: 'Dec 12, 2023',
      description:
        'My MacBook Air M1 battery drains extremely fast. It goes from 100% to 0% in under 2 hours of light use.',
      category: 'Hardware Issue',
      severity: 'medium',
      updates: [
        {
          id: '1',
          message: 'Complaint submitted successfully.',
          time: 'Dec 12, 2023 • 02:30 PM',
          isAgent: false,
        },
        {
          id: '2',
          message: 'We have ordered a replacement battery. Will update you when it arrives.',
          time: 'Dec 13, 2023 • 10:00 AM',
          isAgent: true,
        },
        {
          id: '3',
          message: 'Battery replacement is in progress. Estimated completion: 2 days.',
          time: 'Dec 14, 2023 • 09:00 AM',
          isAgent: true,
        },
      ],
    },
    {
      id: '3',
      title: 'Charging Port Loose - Samsung S23',
      reference: '#REC-2018',
      status: 'resolved',
      date: 'Dec 10, 2023',
      description:
        'The charging port on my Samsung S23 is loose. The cable keeps falling out and charging is intermittent.',
      category: 'Hardware Issue',
      severity: 'low',
      updates: [
        {
          id: '1',
          message: 'Complaint submitted successfully.',
          time: 'Dec 10, 2023 • 11:00 AM',
          isAgent: false,
        },
        {
          id: '2',
          message: 'We have diagnosed the issue. The charging port needs to be replaced.',
          time: 'Dec 11, 2023 • 09:30 AM',
          isAgent: true,
        },
        {
          id: '3',
          message: 'Charging port replaced successfully. Device is ready for pickup.',
          time: 'Dec 13, 2023 • 04:00 PM',
          isAgent: true,
        },
      ],
    },
  ]);

  // Handle direct navigation via URL param
  useEffect(() => {
    if (id) {
      const complaint = complaints.find((c) => c.id === id);
      if (complaint) {
        setSelectedComplaint(complaint);
        setIsModalOpen(true);
        setActiveTab('list');
      }
    }
  }, [id, complaints]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const newComplaint: Complaint = {
        id: (complaints.length + 1).toString(),
        title: formData.subject,
        reference: `#REC-${2000 + complaints.length + 1}`,
        status: 'pending',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        description: formData.description,
        category: formData.category,
        severity: formData.severity,
        updates: [
          {
            id: '1',
            message: 'Complaint submitted successfully. We will review it shortly.',
            time: new Date().toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            isAgent: false,
          },
        ],
      };

      setComplaints([newComplaint, ...complaints]);
      setIsLoading(false);
      setActiveTab('list');
      setFormData({
        subject: '',
        category: 'Billing',
        severity: 'medium',
        description: '',
        attachments: [],
      });

      setShowSuccessBanner(true);
      setTimeout(() => setShowSuccessBanner(false), 4000);
    }, 1200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...Array.from(e.target.files)],
      });
    }
  };

  const removeAttachment = (index: number) => {
    setFormData({
      ...formData,
      attachments: formData.attachments.filter((_, i) => i !== index),
    });
  };

  const handleAddReply = () => {
    if (!replyMessage.trim() || !selectedComplaint) return;

    const newUpdate = {
      id: (selectedComplaint.updates.length + 1).toString(),
      message: replyMessage,
      time: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      isAgent: false,
    };

    const updatedComplaint = {
      ...selectedComplaint,
      updates: [...selectedComplaint.updates, newUpdate],
    };

    setSelectedComplaint(updatedComplaint);
    setComplaints((prev) =>
      prev.map((c) => (c.id === updatedComplaint.id ? updatedComplaint : c))
    );
    setReplyMessage('');
    setIsReplying(false);
  };

  const getSeverityColor = (severity: Complaint['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getSeverityText = (severity: Complaint['severity']) => {
    switch (severity) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return severity;
    }
  };

  const getStatusCount = (status: Complaint['status']) => {
    return complaints.filter((c) => c.status === status).length;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Success Notification Banner */}
      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="material-symbols-outlined text-emerald-600">check_circle</span>
          <span>Your complaint has been successfully lodged and submitted for review.</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Complaints Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, submit, and track resolution updates for your issues
          </p>
        </div>
        <button
          onClick={() => setActiveTab('submit')}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20 text-sm"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Lodge New Complaint
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
          <p className="text-2xl font-black text-blue-600">{getStatusCount('pending')}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Pending</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
          <p className="text-2xl font-black text-amber-500">
            {getStatusCount('in-progress') + getStatusCount('under-review')}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">In Progress</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
          <p className="text-2xl font-black text-emerald-600">{getStatusCount('resolved')}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Resolved</p>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center border border-slate-200/80 shadow-xs">
          <p className="text-2xl font-black text-red-600">{getStatusCount('escalated')}</p>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">Escalated</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-3 px-4 transition-all border-b-2 ${activeTab === 'list'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
        >
          My Complaints ({complaints.length})
        </button>
        <button
          onClick={() => setActiveTab('submit')}
          className={`pb-3 px-4 transition-all border-b-2 ${activeTab === 'submit'
              ? 'text-blue-600 border-blue-600'
              : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
        >
          Lodge New
        </button>
      </div>

      {/* Tab Content 1: Submit Form */}
      {activeTab === 'submit' && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 sm:p-8 animate-in fade-in duration-200">
          <h2 className="text-lg font-bold text-slate-900 mb-5">Submit a New Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium placeholder-slate-400"
                placeholder="Brief summary of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-11 sm:h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium"
                >
                  <option>Billing</option>
                  <option>Hardware Issue</option>
                  <option>Software Issue</option>
                  <option>Service Quality</option>
                  <option>Delivery</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Severity</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((severity) => (
                    <button
                      key={severity}
                      type="button"
                      onClick={() => setFormData({ ...formData, severity })}
                      className={`h-11 sm:h-12 rounded-xl text-xs font-bold capitalize transition-all border ${formData.severity === severity
                          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      {severity}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 font-medium resize-none placeholder-slate-400"
                placeholder="Please describe your issue in detail..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Attachments</label>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50/80 transition-colors cursor-pointer group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <span className="material-symbols-outlined text-blue-600 text-3xl mb-2 group-hover:scale-110 transition-transform">
                    cloud_upload
                  </span>
                  <p className="text-sm font-bold text-slate-800">
                    Drag & drop files or click to browse
                  </p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG or PDF up to 10MB</p>
                </label>
              </div>

              {formData.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.attachments.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 sm:h-12 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20 text-sm disabled:opacity-80"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                  Submitting Complaint...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">send</span>
                  Submit Complaint
                </>
              )}
            </button>
          </form>

          <div className="mt-5 p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-lg shrink-0 mt-0.5">
              info
            </span>
            <div>
              <p className="text-xs font-bold text-blue-900">Priority Response Guaranteed</p>
              <p className="text-xs text-blue-700/80 mt-0.5">
                High severity complaints are prioritized and reviewed within 2 business hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: List */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <span className="material-symbols-outlined text-3xl">inbox</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">No Complaints Logged</h3>
              <p className="text-xs text-slate-500 mb-4">
                You haven't submitted any service issues or complaints yet.
              </p>
              <button
                onClick={() => setActiveTab('submit')}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-xs"
              >
                Lodge Your First Complaint
              </button>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
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
                        {complaint.title}
                      </h3>
                      <StatusBadge status={complaint.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {complaint.reference} • {complaint.category} • {complaint.date}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1">{complaint.description}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSeverityColor(
                        complaint.severity
                      )}`}
                    >
                      {getSeverityText(complaint.severity)}
                    </span>
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

      {/* Complaint Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
          setIsReplying(false);
          navigate('/complaints', { replace: true });
        }}
        title={selectedComplaint?.title || 'Complaint Details'}
        size="xl"
      >
        {selectedComplaint && (
          <div className="space-y-5">
            {/* Top Bar Details */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500">
                    {selectedComplaint.reference}
                  </span>
                  <StatusBadge status={selectedComplaint.status} size="sm" />
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  Submitted: {selectedComplaint.date}
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getSeverityColor(
                  selectedComplaint.severity
                )}`}
              >
                {getSeverityText(selectedComplaint.severity)}
              </span>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </p>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {selectedComplaint.description}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Category
                </p>
                <p className="text-xs sm:text-sm text-slate-800 font-bold">
                  {selectedComplaint.category}
                </p>
              </div>
            </div>

            {/* Updates Timeline */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Timeline Updates
              </p>
              <div className="space-y-3 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedComplaint.updates.map((update) => (
                  <div key={update.id} className="relative">
                    <div
                      className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white ${update.isAgent ? 'bg-blue-600' : 'bg-slate-400'
                        }`}
                    />
                    <div
                      className={`p-3 sm:p-4 rounded-xl text-xs ${update.isAgent
                          ? 'bg-blue-50/80 border border-blue-100 text-slate-800'
                          : 'bg-slate-50 border border-slate-100 text-slate-700'
                        }`}
                    >
                      <p className="font-medium leading-relaxed">{update.message}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1.5 flex items-center gap-1">
                        <span>{update.isAgent ? '🛠️ Support Team' : '👤 You'}</span>
                        <span>•</span>
                        <span>{update.time}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inline Reply Form */}
            {isReplying && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-slate-700">Add a Response</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response or update here..."
                  rows={3}
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReplying(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddReply}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            )}

            {/* Action Bar */}
            {!isReplying && (
              <div className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsReplying(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors active:scale-95 text-xs shadow-xs"
                >
                  <span className="material-symbols-outlined text-base">chat</span>
                  Reply
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors active:scale-95 text-xs"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  Print
                </button>
                {selectedComplaint.status !== 'resolved' && selectedComplaint.status !== 'closed' && (
                  <button className="flex-1 inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors active:scale-95 text-xs">
                    <span className="material-symbols-outlined text-base">flag</span>
                    Escalate
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Global Material Icons Setting */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default CustomerComplaints;