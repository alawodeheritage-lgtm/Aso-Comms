// src/pages/Admin/Repairs.tsx
import React, { useState, useEffect } from 'react';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { mapStatus } from '../../utils/statusMapper';
import { repairsAPI } from '../../api/repairs';
import ImageUpload from '../../components/ImageUpload';

interface Repair {
  _id: string;
  deviceModel: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  issueDescription: string;
  status: 'Pending' | 'Diagnosing' | 'Repairing' | 'Ready' | 'Collected';
  dateLogged: string;
  assignedTo: string;
  priority: 'high' | 'medium' | 'low';
  images?: string[];
  financials?: {
    totalEstimate: number;
    amountPaid: number;
    balanceDue: number;
    paymentStatus: 'Unpaid' | 'Partial / Deposit Logged' | 'Paid in Full';
  };
  ticketId?: string;
}

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'Diagnosing', label: 'Diagnosing', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'Repairing', label: 'Repairing', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'Ready', label: 'Ready', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'Collected', label: 'Collected', color: 'bg-gray-100 text-gray-700 border-gray-200' },
];

const AdminRepairs: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState<Repair | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Form State
  const [device, setDevice] = useState('');
  const [customer, setCustomer] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [assignedTo, setAssignedTo] = useState('Unassigned');
  const [images, setImages] = useState<string[]>([]);
  const [totalEstimate, setTotalEstimate] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [balanceDue, setBalanceDue] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Partial / Deposit Logged' | 'Paid in Full'>('Unpaid');
  const [repairImages, setRepairImages] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRepair, setEditingRepair] = useState<Repair | null>(null);

  const getImageUrl = (img: string): string => {
    return img || '';
  };

  const getImageName = (img: string): string => {
    if (!img) return 'Image';
    const parts = img.split('/');
    return parts[parts.length - 1] || 'Image';
  };

  const calculateFinancials = (estimate: number, paid: number) => {
    const validPaid = Math.min(paid, estimate);
    const balance = estimate - validPaid;
    let status: 'Unpaid' | 'Partial / Deposit Logged' | 'Paid in Full' = 'Unpaid';

    if (estimate === 0) {
      status = 'Unpaid';
    } else if (validPaid === 0) {
      status = 'Unpaid';
    } else if (validPaid >= estimate) {
      status = 'Paid in Full';
    } else {
      status = 'Partial / Deposit Logged';
    }

    return {
      amountPaid: validPaid,
      balanceDue: balance,
      paymentStatus: status
    };
  };

  const handleTotalEstimateChange = (value: string) => {
    if (value === '' || value === '-') {
      setTotalEstimate(0);
      const result = calculateFinancials(0, amountPaid);
      setAmountPaid(result.amountPaid);
      setBalanceDue(result.balanceDue);
      setPaymentStatus(result.paymentStatus);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const newEstimate = numValue;
      setTotalEstimate(newEstimate);
      const result = calculateFinancials(newEstimate, amountPaid);
      setAmountPaid(result.amountPaid);
      setBalanceDue(result.balanceDue);
      setPaymentStatus(result.paymentStatus);
    }
  };

  const handleAmountPaidChange = (value: string) => {
    if (value === '' || value === '-') {
      setAmountPaid(0);
      const result = calculateFinancials(totalEstimate, 0);
      setBalanceDue(result.balanceDue);
      setPaymentStatus(result.paymentStatus);
      return;
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      const newPaid = Math.min(numValue, totalEstimate);
      setAmountPaid(newPaid);
      const result = calculateFinancials(totalEstimate, newPaid);
      setBalanceDue(result.balanceDue);
      setPaymentStatus(result.paymentStatus);
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid in Full':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Partial / Deposit Logged':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Unpaid':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid in Full':
        return 'check_circle';
      case 'Partial / Deposit Logged':
        return 'pending';
      case 'Unpaid':
        return 'warning';
      default:
        return 'info';
    }
  };

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await repairsAPI.getAll();
      console.log('Raw API response:', response);

      let repairsData = [];
      if (response.repairs) {
        repairsData = response.repairs;
      } else if (response.data) {
        repairsData = response.data;
      } else if (Array.isArray(response)) {
        repairsData = response;
      } else {
        repairsData = [];
      }

      setRepairs(Array.isArray(repairsData) ? repairsData : []);
    } catch (err: any) {
      console.error('Failed to fetch repairs:', err);
      setError(err.message || 'Failed to load repairs. Please refresh.');
      setToast({
        message: err.response?.data?.error || 'Failed to load repairs. Please refresh.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  const handleStatusChange = async (repairId: string, newStatus: string) => {
    if (statusChangeLoading) return;

    setStatusChangeLoading(true);
    try {
      const response = await repairsAPI.updateStatus(repairId, newStatus);
      console.log('Status updated:', response);

      setRepairs(prevRepairs =>
        prevRepairs.map(repair =>
          repair._id === repairId
            ? { ...repair, status: newStatus as Repair['status'] }
            : repair
        )
      );

      if (selectedRepair && selectedRepair._id === repairId) {
        setSelectedRepair({ ...selectedRepair, status: newStatus as Repair['status'] });
      }

      setToast({
        message: `Status updated to: ${newStatus}`,
        type: 'success'
      });

      await fetchRepairs();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to update status. Please try again.',
        type: 'error'
      });
    } finally {
      setStatusChangeLoading(false);
    }
  };

  const getPriorityColor = (priority: Repair['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-700 bg-red-50 border-red-200/60';
      case 'medium':
        return 'text-amber-800 bg-amber-50 border-amber-200/60';
      case 'low':
        return 'text-slate-600 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-100 border-slate-200';
    }
  };

  const handleCreateRepair = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!device || !customer || !email || !phone || !issue) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (amountPaid > totalEstimate) {
      setToast({ message: 'Amount paid cannot exceed total estimate!', type: 'error' });
      return;
    }

    setSubmitLoading(true);

    try {
      const repairData = {
        customerName: customer.trim(),
        phoneNumber: phone.trim(),
        customerEmail: email.trim().toLowerCase(),
        deviceModel: device.trim(),
        issueDescription: issue.trim(),
        status: 'Pending',
        priority: priority,
        assignedTo: assignedTo,
        financials: {
          totalEstimate: Number(totalEstimate) || 0,
          amountPaid: Number(amountPaid) || 0,
        },
        images: repairImages.map(img => img.url)
      };

      console.log('📤 Sending repair data:', JSON.stringify(repairData, null, 2));

      const response = await repairsAPI.create(repairData);
      console.log('✅ Repair saved successfully:', response);

      const newRepair = response.repair || response;

      setRepairs([newRepair, ...repairs]);
      handleCloseModal();
      await fetchRepairs();

      setToast({ message: 'Repair logged successfully! 🎉', type: 'success' });
    } catch (err: any) {
      console.error('❌ Failed to create repair:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create repair. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRepair(null);
    setEditingRepair(null);
    setIsEditMode(false);
    setDevice('');
    setCustomer('');
    setEmail('');
    setPhone('');
    setIssue('');
    setPriority('medium');
    setAssignedTo('Unassigned');
    images.forEach(img => URL.revokeObjectURL(img));
    setImages([]);
    setRepairImages([]);
    setTotalEstimate(0);
    setAmountPaid(0);
    setBalanceDue(0);
    setPaymentStatus('Unpaid');
  };

  const handleEditRepair = (repair: Repair) => {
    setEditingRepair(repair);
    setSelectedRepair(repair);

    setDevice(repair.deviceModel || '');
    setCustomer(repair.customerName || '');
    setEmail(repair.customerEmail || '');
    setPhone(repair.phoneNumber || '');
    setIssue(repair.issueDescription || '');
    setPriority((repair.priority || 'medium') as 'low' | 'medium' | 'high');
    setAssignedTo(repair.assignedTo || 'Unassigned');

    // ✅ Load financials from repair object
    const financials = repair.financials || { totalEstimate: 0, amountPaid: 0 };
    setTotalEstimate(financials.totalEstimate || 0);
    setAmountPaid(financials.amountPaid || 0);
    setBalanceDue(financials.balanceDue || 0);
    setPaymentStatus(financials.paymentStatus || 'Unpaid');

    if (repair.images && repair.images.length > 0) {
      const imageUrls = repair.images.map(img => typeof img === 'string' ? img : img.url);
      setImages(imageUrls);
      const existingImages = repair.images.map(img => {
        if (typeof img === 'string') {
          return { url: img };
        }
        return img;
      });
      setRepairImages(existingImages);
    }

    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleUpdateRepair = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRepair) return;

    if (!device || !customer || !email || !phone || !issue) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    if (amountPaid > totalEstimate) {
      setToast({ message: 'Amount paid cannot exceed total estimate!', type: 'error' });
      return;
    }

    setSubmitLoading(true);

    try {
      const updateData = {
        customerName: customer.trim(),
        phoneNumber: phone.trim(),
        customerEmail: email.trim().toLowerCase(),
        deviceModel: device.trim(),
        issueDescription: issue.trim(),
        priority: priority,
        assignedTo: assignedTo,
        financials: {
          totalEstimate: Number(totalEstimate) || 0,
          amountPaid: Number(amountPaid) || 0,
        },
        images: repairImages.map(img => img.url)
      };

      console.log('📤 Updating repair data:', JSON.stringify(updateData, null, 2));

      const response = await repairsAPI.update(editingRepair._id, updateData);
      console.log('✅ Repair updated successfully:', response);

      await fetchRepairs();
      handleCloseModal();

      setToast({ message: 'Repair updated successfully! 🎉', type: 'success' });
    } catch (err: any) {
      console.error('❌ Failed to update repair:', err);
      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to update repair. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredRepairs =
    activeFilter === 'all'
      ? repairs
      : repairs.filter((r) => r.status?.toLowerCase() === activeFilter || r.status === activeFilter);

  const totalRepairs = repairs.length;
  const pendingRepairs = repairs.filter(r => r.status === 'Pending').length;
  const diagnosingRepairs = repairs.filter(r => r.status === 'Diagnosing').length;
  const repairingRepairs = repairs.filter(r => r.status === 'Repairing').length;
  const readyRepairs = repairs.filter(r => r.status === 'Ready').length;
  const collectedRepairs = repairs.filter(r => r.status === 'Collected').length;

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium text-slate-500">Loading repairs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
        <p className="text-sm font-medium text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchRepairs}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Repair Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage repair requests, device intake, and technician assignments
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setEditingRepair(null);
            setSelectedRepair(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          New Repair
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-blue-600">{totalRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Total</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-red-600">{pendingRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Pending</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-amber-600">{diagnosingRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Diagnosing</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-blue-600">{repairingRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Repairing</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-green-600">{readyRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Ready</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-slate-200/80 shadow-sm">
          <p className="text-lg sm:text-xl font-bold text-gray-600">{collectedRepairs}</p>
          <p className="text-[8px] sm:text-[10px] font-semibold text-slate-500">Collected</p>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-1.5 sm:gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {['all', 'Pending', 'Diagnosing', 'Repairing', 'Ready', 'Collected'].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${activeFilter === filter
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
          >
            {filter === 'all' ? 'All' : filter}
          </button>
        ))}
      </div>

      {/* Repair Cards List */}
      <div className="space-y-3 sm:space-y-3.5">
        {filteredRepairs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80">
            <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400 mb-2">build_circle</span>
            <p className="text-sm sm:text-base font-bold text-slate-700">No repairs found</p>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">There are no device repairs matching your selected status filter.</p>
            <button
              onClick={() => {
                setIsEditMode(false);
                setEditingRepair(null);
                setSelectedRepair(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Create First Repair
            </button>
          </div>
        ) : (
          filteredRepairs.map((repair) => (
            <div
              key={repair._id || repair.id}
              className="bg-white rounded-2xl p-3 sm:p-5 shadow-2xs border border-slate-200/80 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {repair.deviceModel || 'Unknown Device'}
                    </h3>
                    <StatusBadge status={repair.status || 'Pending'} size="sm" />
                    {repair.ticketId && (
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                        {repair.ticketId}
                      </span>
                    )}
                    {repair.financials && repair.financials.paymentStatus && (
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${repair.financials.paymentStatus === 'Paid in Full' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {repair.financials.paymentStatus}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 line-clamp-2">
                    {repair.issueDescription || 'No description'}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-4 mt-2 text-[10px] sm:text-xs text-slate-500">
                    <span>
                      <span className="font-semibold text-slate-700">{repair.customerName || 'Unknown'}</span>
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline">
                      {repair.dateLogged ? new Date(repair.dateLogged).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden sm:inline">
                      Assigned: <span className="font-semibold text-slate-700">{repair.assignedTo || 'Unassigned'}</span>
                    </span>
                    {repair.images && repair.images.length > 0 && (
                      <>
                        <span className="hidden xs:inline">•</span>
                        <span className="inline-flex items-center gap-1 text-blue-600 font-bold bg-blue-50 px-1.5 sm:px-2 py-0.5 rounded-md text-[9px] sm:text-[11px]">
                          <span className="material-symbols-outlined text-[10px] sm:text-xs">photo_camera</span>
                          {repair.images.length}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-3 pt-2 md:pt-0 border-t md:border-0 border-slate-100 w-full md:w-auto">
                  <span
                    className={`px-1.5 sm:px-2.5 py-0.5 rounded-md border text-[8px] sm:text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(
                      repair.priority || 'medium'
                    )}`}
                  >
                    {repair.priority || 'medium'}
                  </span>
                  <button
                    onClick={() => handleEditRepair(repair)}
                    className="text-amber-600 hover:text-amber-700 text-xs sm:text-sm font-bold transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRepair(repair);
                      setEditingRepair(null);
                      setIsEditMode(false);
                      setIsModalOpen(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-bold transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          isEditMode
            ? `Edit Repair - ${editingRepair?.ticketId || ''}`
            : selectedRepair && !isEditMode
              ? `Repair Details - ${selectedRepair.ticketId || ''}`
              : 'New Repair Request'
        }
        size="xl"
      >
        {isEditMode ? (
          // Edit Repair Form
          <form onSubmit={handleUpdateRepair} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Device Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="e.g. iPhone 14 Pro, Samsung S23"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="Customer full name"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-8 sm:pl-10 pr-3 sm:pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">call</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-8 sm:pl-10 pr-3 sm:pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full min-h-[70px] sm:min-h-[90px] p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                placeholder="Describe physical condition or issues..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm text-slate-800 font-semibold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm text-slate-800 font-semibold"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Tech_Support">Tech_Support</option>
                  <option value="Senior_Tech">Senior_Tech</option>
                </select>
              </div>
            </div>

            {/* Financials Section */}
            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-blue-600 text-base">payments</span>
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-700">Financial Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Total Estimate (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={totalEstimate === 0 ? '' : totalEstimate}
                    onChange={(e) => handleTotalEstimateChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Amount Paid (₦)
                  </label>
                  <input
                    type="number"
                    value={amountPaid === 0 ? '' : amountPaid}
                    onChange={(e) => handleAmountPaidChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {amountPaid > totalEstimate && totalEstimate > 0 && (
                    <p className="text-[8px] sm:text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs sm:text-sm">warning</span>
                      Cannot exceed total!
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200/60">
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Total</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">₦{totalEstimate.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600">₦{amountPaid.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Balance</p>
                  <p className={`text-xs sm:text-sm font-bold ${balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ₦{balanceDue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Payment Status</span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getPaymentStatusColor(paymentStatus)} flex items-center gap-1 w-fit sm:w-auto`}>
                  <span className="material-symbols-outlined text-sm">{getPaymentStatusIcon(paymentStatus)}</span>
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Device Condition Photos <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <ImageUpload
                onUploadComplete={(files) => {
                  console.log('📸 Images uploaded:', files);
                  setRepairImages(files);
                  const urls = files.map(f => f.url);
                  setImages(urls);
                }}
                maxFiles={3}
                uploadType="repair"
                existingImages={repairImages}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Update Repair
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : selectedRepair ? (
          // View Details Mode
          <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-700 font-bold">
                  {selectedRepair.ticketId || 'No Ticket ID'}
                </span>
                <StatusBadge status={selectedRepair.status || 'Pending'} size="sm" />
              </div>
              <span className="text-xs text-slate-500">
                Logged: {formatDate(selectedRepair.dateLogged)}
              </span>
            </div>

            {/* Status Change */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(selectedRepair._id, status.value)}
                    disabled={statusChangeLoading || selectedRepair.status === status.value}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedRepair.status === status.value
                      ? `${status.color} cursor-default opacity-70`
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-blue-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Device & Issue */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Device Model</p>
                <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {selectedRepair.deviceModel || 'Unknown'}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</p>
                <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded border mt-0.5 ${getPriorityColor(selectedRepair.priority || 'medium')}`}>
                  {(selectedRepair.priority || 'medium').toUpperCase()}
                </span>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-2">Customer Information</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <p className="text-[9px] font-semibold text-slate-400">Name</p>
                  <p className="text-xs font-bold text-slate-800">{selectedRepair.customerName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400">Email</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{selectedRepair.customerEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-semibold text-slate-400">Phone</p>
                  <p className="text-xs font-bold text-slate-800">{selectedRepair.phoneNumber || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Issue Description */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Issue Description</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700">
                {selectedRepair.issueDescription || 'No description provided'}
              </div>
            </div>

            {/* Images */}
            {selectedRepair.images && selectedRepair.images.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Device Photos ({selectedRepair.images.length})
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedRepair.images.map((img, index) => {
                    const imageUrl = getImageUrl(img);
                    const imageName = getImageName(img);

                    if (!imageUrl) return null;

                    return (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:shadow-md transition-all"
                      >
                        <img
                          src={imageUrl}
                          alt={`Device photo ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50';
                              fallback.innerHTML = `
                                <span class="material-symbols-outlined text-3xl">broken_image</span>
                                <span class="text-[8px] mt-1 truncate max-w-full px-1">${imageName}</span>
                              `;
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full">View</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned To</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedRepair.assignedTo || 'Unassigned'}</p>
              </div>
            </div>

            {/* Financial Details - Now using financials object */}
            {selectedRepair.financials && (selectedRepair.financials.totalEstimate !== undefined || selectedRepair.financials.amountPaid !== undefined) && (
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2">Financial Details</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[9px] font-semibold text-slate-400">Total Estimate</p>
                    <p className="text-sm font-bold text-slate-900">₦{selectedRepair.financials.totalEstimate?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-semibold text-slate-400">Amount Paid</p>
                    <p className="text-sm font-bold text-emerald-600">₦{selectedRepair.financials.amountPaid?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-semibold text-slate-400">Balance</p>
                    <p className={`text-sm font-bold ${selectedRepair.financials.balanceDue && selectedRepair.financials.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ₦{selectedRepair.financials.balanceDue?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
                {selectedRepair.financials.paymentStatus && (
                  <div className="mt-2 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPaymentStatusColor(selectedRepair.financials.paymentStatus)}`}>
                      {selectedRepair.financials.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => handleEditRepair(selectedRepair)}
                className="flex-1 bg-amber-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-amber-700 transition-all shadow-xs"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Edit Repair
                </span>
              </button>
              <button className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors">
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print
                </span>
              </button>
            </div>
          </div>
        ) : (
          // Create New Repair Form
          <form onSubmit={handleCreateRepair} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Device Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="e.g. iPhone 14 Pro, Samsung S23"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="Customer full name"
              />
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Customer Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-8 sm:pl-10 pr-3 sm:pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                  placeholder="customer@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined text-slate-400 text-base absolute left-3 top-1/2 -translate-y-1/2">call</span>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-10 sm:h-11 pl-8 sm:pl-10 pr-3 sm:pr-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                  placeholder="+234 800 000 0000"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full min-h-[70px] sm:min-h-[90px] p-3 sm:p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
                placeholder="Describe physical condition or issues..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm text-slate-800 font-semibold"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm text-slate-800 font-semibold"
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Tech_Support">Tech_Support</option>
                  <option value="Senior_Tech">Senior_Tech</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-blue-600 text-base">payments</span>
                <h4 className="text-[10px] sm:text-xs font-bold text-slate-700">Financial Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Total Estimate (₦) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={totalEstimate === 0 ? '' : totalEstimate}
                    onChange={(e) => handleTotalEstimateChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                    Amount Paid (₦)
                  </label>
                  <input
                    type="number"
                    value={amountPaid === 0 ? '' : amountPaid}
                    onChange={(e) => handleAmountPaidChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                    className="w-full h-10 sm:h-11 px-3 sm:px-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {amountPaid > totalEstimate && totalEstimate > 0 && (
                    <p className="text-[8px] sm:text-[10px] text-red-500 mt-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs sm:text-sm">warning</span>
                      Cannot exceed total!
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-slate-200/60">
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Total</p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">₦{totalEstimate.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Paid</p>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600">₦{amountPaid.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Balance</p>
                  <p className={`text-xs sm:text-sm font-bold ${balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    ₦{balanceDue.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase">Payment Status</span>
                <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold border ${getPaymentStatusColor(paymentStatus)} flex items-center gap-1 w-fit sm:w-auto`}>
                  <span className="material-symbols-outlined text-sm">{getPaymentStatusIcon(paymentStatus)}</span>
                  {paymentStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] sm:text-xs font-bold text-slate-700 mb-1">
                Device Condition Photos <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <ImageUpload
                onUploadComplete={(files) => {
                  console.log('📸 Images uploaded:', files);
                  setRepairImages(files);
                  const urls = files.map(f => f.url);
                  setImages(urls);
                }}
                maxFiles={5}
                uploadType="repair"
                existingImages={repairImages}
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full h-10 sm:h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  Saving...
                </>
              ) : (
                'Log Repair Request'
              )}
            </button>
          </form>
        )}
      </Modal>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          vertical-align: middle;
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (min-width: 480px) { .xs\\:inline { display: inline !important; } }
      `}</style>
    </div>
  );
};

export default AdminRepairs;