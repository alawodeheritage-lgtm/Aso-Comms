// src/pages/Admin/Expenses.tsx
import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import MetricCard from '../../components/MetricCard';
import Toast from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';
import { expensesAPI } from '../../api/expenses';

interface Expense {
  _id: string;
  description: string;
  category: string;
  amount: number;
  dateLogged: string;
  status: 'pending' | 'approved' | 'rejected';
  loggedBy?: {
    _id: string;
    username: string;
    email: string;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Category options from schema
const CATEGORY_OPTIONS = [
  'Parts Purchase',
  'Shop Rent',
  'Tools/Equipment',
  'Electricity/Utility',
  'Transport',
  'Food',
  'Other'
];

const AdminExpenses: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [filter, setFilter] = useState('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Form State
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Parts Purchase');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Fetch expenses from backend
  const fetchExpenses = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching expenses from backend...');
      const response = await expensesAPI.getAll();
      console.log('✅ Raw API response:', response);

      let expensesData = [];
      if (response.expenses) {
        expensesData = response.expenses;
      } else if (response.data) {
        expensesData = response.data;
      } else if (Array.isArray(response)) {
        expensesData = response;
      } else {
        expensesData = [];
      }

      console.log(`📊 Found ${expensesData.length} expenses`);
      setExpenses(Array.isArray(expensesData) ? expensesData : []);
    } catch (err: any) {
      console.error('❌ Failed to fetch expenses:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load expenses. Please refresh.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  // Calculate totals - ONLY approved expenses count towards total
  const totalExpenses = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
  const rejectedExpenses = expenses.filter((e) => e.status === 'rejected');
  const pendingExpensesCount = pendingExpenses.length;
  const approvedExpensesCount = approvedExpenses.length;

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200/60';
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await expensesAPI.updateStatus(id, 'approved');
      console.log('Expense approved:', response);
      setExpenses((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'approved' } : item))
      );
      setToast({ message: 'Expense approved successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Failed to approve expense:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to approve expense.',
        type: 'error'
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await expensesAPI.updateStatus(id, 'rejected');
      console.log('Expense rejected:', response);
      setExpenses((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status: 'rejected' } : item))
      );
      setToast({ message: 'Expense rejected.', type: 'info' });
    } catch (err: any) {
      console.error('Failed to reject expense:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to reject expense.',
        type: 'error'
      });
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;

    setDeleteLoading(true);
    try {
      await expensesAPI.delete(expenseToDelete._id);
      console.log('Expense deleted successfully');
      setExpenses((prev) => prev.filter((item) => item._id !== expenseToDelete._id));
      setIsDeleteModalOpen(false);
      setIsViewModalOpen(false);
      setSelectedExpense(null);
      setExpenseToDelete(null);
      setToast({ message: 'Expense deleted successfully!', type: 'success' });
      await fetchExpenses();
    } catch (err: any) {
      console.error('Failed to delete expense:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to delete expense.',
        type: 'error'
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (expense: Expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription || !newAmount) {
      setToast({ message: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setSubmitLoading(true);

    try {
      const expenseData = {
        description: newDescription.trim(),
        amount: parseFloat(newAmount) || 0,
        category: newCategory,
        notes: newNotes.trim() || undefined,
      };

      console.log('📤 Sending expense data:', expenseData);

      const response = await expensesAPI.create(expenseData);
      console.log('✅ Expense saved successfully:', response);

      const newExpense = response.expense || response;

      setExpenses([newExpense, ...expenses]);

      setNewDescription('');
      setNewAmount('');
      setNewNotes('');
      setNewCategory('Parts Purchase');
      setIsModalOpen(false);

      await fetchExpenses();

      setToast({ message: 'Expense logged successfully! 🎉', type: 'success' });
    } catch (err: any) {
      console.error('Failed to create expense:', err);

      const errorMessage = err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Failed to create expense. Please try again.';
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredExpenses =
    filter === 'all' ? expenses : expenses.filter((e) => e.status === filter);

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
          <p className="mt-3 text-sm font-medium text-slate-500">Loading expenses...</p>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Expense Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track, review, and approve shop operating expenses
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 w-full sm:w-auto"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Log Expense
        </button>
      </div>

      {/* Summary Stats Cards - Only Approved expenses count */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Total Expenses (Approved)"
          value={`₦${totalExpenses.toLocaleString()}`}
          icon="payments"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <MetricCard
          label="Pending"
          value={pendingExpensesCount.toString()}
          icon="pending"
          color="text-amber-600"
          bgColor="bg-amber-50"
        />
        <MetricCard
          label="Approved"
          value={approvedExpensesCount.toString()}
          icon="check_circle"
          color="text-emerald-600"
          bgColor="bg-emerald-50"
        />
        <MetricCard
          label="Rejected"
          value={rejectedExpenses.length.toString()}
          icon="block"
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Filters Bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${filter === status
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
              receipt_long
            </span>
            <p className="text-sm font-semibold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400 mt-0.5">There are no records matching your selected filter.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense._id || expense.id}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      {expense.description}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(
                        expense.status
                      )}`}
                    >
                      {expense.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-700">{expense.category}</span>
                    <span>•</span>
                    <span>{formatDate(expense.dateLogged)}</span>
                    <span>•</span>
                    <span>
                      Logged by: <span className="font-semibold text-slate-700">
                        {expense.loggedBy?.username || 'Unknown'}
                      </span>
                    </span>
                  </p>
                  {expense.notes && (
                    <p className="text-xs text-slate-500 mt-1 italic line-clamp-1">
                      Note: {expense.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-0 border-slate-100 w-full md:w-auto justify-between md:justify-end">
                  <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                    ₦{expense.amount.toLocaleString()}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsViewModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg transition-colors"
                    >
                      View
                    </button>
                    {expense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(expense._id)}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(expense._id)}
                          className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Log Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log New Expense"
        size="lg"
      >
        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
              placeholder="e.g. Bought iPhone 13 OLED Screen"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₦) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full min-h-[60px] p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400 resize-none"
              placeholder="Additional notes about this expense..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt Attachment
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer group">
              <span className="material-symbols-outlined text-slate-400 group-hover:text-blue-600 text-3xl mb-1 transition-colors">
                cloud_upload
              </span>
              <p className="text-xs font-bold text-slate-800">Upload Receipt Image or Document</p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG or PDF up to 5MB</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 text-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitLoading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                Saving...
              </>
            ) : (
              'Submit Expense'
            )}
          </button>
        </form>
      </Modal>

      {/* View Expense Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedExpense(null);
        }}
        title="Expense Details"
        size="lg"
      >
        {selectedExpense && (
          <div className="space-y-4">
            {/* Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedExpense.status} size="sm" />
                <span className="text-xs text-slate-500">
                  Logged: {formatDate(selectedExpense.dateLogged)}
                </span>
              </div>
              <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                ID: {selectedExpense._id?.slice(-6) || 'N/A'}
              </span>
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedExpense.description}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">
                  {selectedExpense.category}
                </p>
              </div>
            </div>

            {/* Amount & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Amount</p>
                <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
                  ₦{selectedExpense.amount.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <div className="mt-1">
                  <StatusBadge status={selectedExpense.status} size="md" />
                </div>
              </div>
            </div>

            {/* Logged By */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged By</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5">
                {selectedExpense.loggedBy?.username || 'Unknown'}
                <span className="text-xs font-normal text-slate-500 ml-2">
                  ({selectedExpense.loggedBy?.email || 'No email'})
                </span>
              </p>
            </div>

            {/* Notes */}
            {selectedExpense.notes && (
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Notes</p>
                <p className="text-sm text-slate-700 mt-0.5 italic">
                  {selectedExpense.notes}
                </p>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
              <div>
                <p className="text-[9px] font-semibold text-slate-400">Created</p>
                <p className="text-xs font-medium text-slate-600">{formatDate(selectedExpense.createdAt || selectedExpense.dateLogged)}</p>
              </div>
              {selectedExpense.updatedAt && (
                <div>
                  <p className="text-[9px] font-semibold text-slate-400">Last Updated</p>
                  <p className="text-xs font-medium text-slate-600">{formatDate(selectedExpense.updatedAt)}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
              {selectedExpense.status === 'pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedExpense._id);
                      setIsViewModalOpen(false);
                    }}
                    className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-emerald-700 active:scale-95 transition-all shadow-xs"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      Approve
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedExpense._id);
                      setIsViewModalOpen(false);
                    }}
                    className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-700 active:scale-95 transition-all shadow-xs"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">block</span>
                      Reject
                    </span>
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  // Print functionality
                  window.print();
                }}
                className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">print</span>
                  Print
                </span>
              </button>
              <button
                onClick={() => openDeleteModal(selectedExpense)}
                className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-100 transition-colors"
              >
                <span className="flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        title="Confirm Delete"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-red-600 text-xl">warning</span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Delete Expense</h4>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to delete this expense? This action cannot be undone.
              </p>
              {expenseToDelete && (
                <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700">{expenseToDelete.description}</p>
                  <p className="text-xs text-slate-500">₦{expenseToDelete.amount.toLocaleString()} • {expenseToDelete.category}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false);
                setExpenseToDelete(null);
              }}
              className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteExpense}
              disabled={deleteLoading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-red-700 active:scale-95 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Deleting...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Material Symbols Styling */}
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

export default AdminExpenses;