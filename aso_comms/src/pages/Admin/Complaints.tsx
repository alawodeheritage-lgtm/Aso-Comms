import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';

interface Complaint {
  id: string;
  title: string;
  customer: string;
  category: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'under-review' | 'resolved' | 'escalated';
  date: string;
  assignedTo: string;
}

const AdminComplaints: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: '1',
      title: 'Unstable connection in Lagos region',
      customer: 'Olabisi Johnson',
      category: 'Service Quality',
      severity: 'high',
      status: 'in-progress',
      date: 'Dec 14, 2023',
      assignedTo: 'Tech_Support'
    },
    {
      id: '2',
      title: 'Double billing for September',
      customer: 'Sarah Adewale',
      category: 'Billing',
      severity: 'medium',
      status: 'under-review',
      date: 'Dec 12, 2023',
      assignedTo: 'Finance_Team'
    },
    {
      id: '3',
      title: 'Product defect - iPhone 14',
      customer: 'David Chen',
      category: 'Product Bug',
      severity: 'high',
      status: 'escalated',
      date: 'Dec 10, 2023',
      assignedTo: 'CEO_Aso'
    }
  ]);

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

  const handleResolveComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'resolved' } : c))
    );
    setIsModalOpen(false);
    setSelectedComplaint(null);
    setResolutionNotes('');
  };

  const handleEscalateComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'escalated' } : c))
    );
  };

  const filteredComplaints =
    activeFilter === 'all'
      ? complaints
      : complaints.filter((c) => c.status === activeFilter);

      // AdminComplaints.tsx - Add after header
const totalComplaints = complaints.length;
const openComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in-progress' || c.status === 'under-review').length;
const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
const escalatedComplaints = complaints.filter(c => c.status === 'escalated').length;
  
return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-lg text-xs font-bold text-blue-700">
            SLA: 94.2%
          </div>
          <button
            onClick={() => setActiveFilter('escalated')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
          >
            Assign Escalations
          </button>
        </div>
      </div>
      // Add this JSX after the header
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
  <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80">
    <p className="text-xl font-bold text-blue-600">{totalComplaints}</p>
    <p className="text-[10px] font-semibold text-slate-500">Total</p>
  </div>
  <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80">
    <p className="text-xl font-bold text-amber-600">{openComplaints}</p>
    <p className="text-[10px] font-semibold text-slate-500">Open</p>
  </div>
  <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80">
    <p className="text-xl font-bold text-emerald-600">{resolvedComplaints}</p>
    <p className="text-[10px] font-semibold text-slate-500">Resolved</p>
  </div>
  <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80">
    <p className="text-xl font-bold text-red-600">{escalatedComplaints}</p>
    <p className="text-[10px] font-semibold text-slate-500">Escalated</p>
  </div>
</div>
      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {['all', 'pending', 'in-progress', 'under-review', 'resolved', 'escalated'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === filter
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1).replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.map((complaint) => (
          <div
            key={complaint.id}
            className="bg-white p-5 rounded-2xl shadow-2xs border border-slate-200/80 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {complaint.title}
                  </h3>
                  <StatusBadge status={complaint.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">{complaint.customer}</span>
                  <span>•</span>
                  <span>{complaint.category}</span>
                  <span>•</span>
                  <span>{complaint.date}</span>
                </p>

                <div className="flex items-center gap-3 mt-2.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getSeverityColor(
                      complaint.severity
                    )}`}
                  >
                    {complaint.severity}
                  </span>
                  <span className="text-xs text-slate-500">
                    Assigned: <span className="font-medium text-slate-700">{complaint.assignedTo}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center pt-2 md:pt-0 border-t md:border-0 border-slate-100 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    setSelectedComplaint(complaint);
                    setIsModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleEscalateComplaint(complaint.id)}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Escalate
                </button>
                <Link
                  to={`/track?id=${complaint.id}`}
                  className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg"
                  title="View Public Tracking Page"
                >
                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filteredComplaints.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
              inbox
            </span>
            <p className="text-sm font-semibold text-slate-700">No complaints found</p>
            <p className="text-xs text-slate-400 mt-0.5">There are no items matching this filter category.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        title="Complaint Resolution"
        size="lg"
      >
        {selectedComplaint && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <div>
                <p className="text-xs font-semibold text-slate-500">Customer</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedComplaint.customer}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Category</p>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">{selectedComplaint.category}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Status</p>
                <StatusBadge status={selectedComplaint.status} size="sm" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1">Severity</p>
                <span
                  className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider inline-block ${getSeverityColor(
                    selectedComplaint.severity
                  )}`}
                >
                  {selectedComplaint.severity}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500">Issue Description</p>
              <p className="text-sm font-medium text-slate-800 mt-1 bg-white p-3 rounded-lg border border-slate-200">
                {selectedComplaint.title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full min-h-[110px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                placeholder="Describe the steps taken to resolve this complaint..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleResolveComplaint(selectedComplaint.id)}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-xs"
              >
                Mark as Resolved
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-100 transition-colors"
              >
                Send Update
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Material Icons standard styling */}
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default AdminComplaints;