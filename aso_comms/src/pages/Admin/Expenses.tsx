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

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Parts Purchase');
  const [newAmount, setNewAmount] = useState('');
  const [newNotes, setNewNotes] = useState('');

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
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200/60';
      case 'approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
      case 'rejected': return 'bg-red-50 text-red-700 border-red-200/60';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
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
          <p className="mt-3 text-sm font-medium text-slate-500">Loading expenses...</p>
        </div>
      </div>
    );
  }

  // ============== HUMANIZED UI ==============
  return (
    <div className="min-h-screen bg-[#F8F6F1] px-4 py-6 md:px-6 md:py-8">
      <div className="max-w-7xl mx-auto space-y-6">

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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Expense Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Track, review, and approve shop operating expenses.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#1A365D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#1A365D]/20"
          >
            <span className="material-symbols-outlined text-lg">add</span> Log Expense
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Expenses (Approved)', value: `₦${totalExpenses.toLocaleString()}`, icon: 'payments', color: 'text-emerald-600' },
            { label: 'Pending', value: pendingExpensesCount.toString(), icon: 'pending', color: 'text-amber-600' },
            { label: 'Approved', value: approvedExpensesCount.toString(), icon: 'check_circle', color: 'text-emerald-600' },
            { label: 'Rejected', value: rejectedExpenses.length.toString(), icon: 'block', color: 'text-red-600' }
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <span className={`material-symbols-outlined ${stat.color}`}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-[#1A365D] mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200/60 pb-2">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === status
                ? 'bg-[#1A365D] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-[#1A365D]'
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
              <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
              <p className="text-sm font-bold text-slate-700 mt-2">No expenses found</p>
              <p className="text-xs text-slate-500">Try adjusting your filter.</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-[#1A365D]/20 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-display font-bold text-[#1A365D]">{expense.description}</h3>
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{expense.category} • Logged by: {expense.loggedBy?.username || 'Unknown'}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(expense.dateLogged)}</p>
                    {expense.notes && (
                      <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">Note: {expense.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-[#1A365D]">₦{expense.amount.toLocaleString()}</p>
                    <button
                      onClick={() => {
                        setSelectedExpense(expense);
                        setIsViewModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors"
                    >
                      View
                    </button>
                    {expense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(expense._id)}
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-bold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(expense._id)}
                          className="text-red-600 hover:text-red-700 text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========== MODALS WITH COMPLETE CONTENT ========== */}

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
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800"
                placeholder="What was the expense for?"
              />
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
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] outline-none transition-all text-sm text-slate-800"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full min-h-[80px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D] focus:bg-white outline-none transition-all text-sm text-slate-800 resize-none"
                placeholder="Any additional details..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="flex-1 bg-[#1A365D] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D4A6B] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Log Expense
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
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
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <h3 className="text-lg font-bold text-[#1A365D]">{selectedExpense.description}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(selectedExpense.status)}`}>
                  {selectedExpense.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Amount</p>
                  <p className="text-xl font-bold text-[#1A365D]">₦{selectedExpense.amount.toLocaleString()}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Category</p>
                  <p className="text-sm font-bold text-slate-800">{selectedExpense.category}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Logged By</p>
                <p className="text-sm font-bold text-slate-800">{selectedExpense.loggedBy?.username || 'Unknown'}</p>
              </div>

              {selectedExpense.notes && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-sm text-slate-700">
                    {selectedExpense.notes}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-slate-200">
                {selectedExpense.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedExpense._id);
                        setIsViewModalOpen(false);
                      }}
                      className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedExpense._id);
                        setIsViewModalOpen(false);
                      }}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => openDeleteModal(selectedExpense)}
                  className="flex-1 border border-red-300 text-red-600 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Delete
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
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <span className="material-symbols-outlined text-5xl text-red-500">warning</span>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Are you sure you want to delete this expense?</p>
              {expenseToDelete && (
                <p className="text-xs text-slate-500 mt-1">
                  "{expenseToDelete.description}" - ₦{expenseToDelete.amount.toLocaleString()}
                </p>
              )}
              <p className="text-xs text-red-500 mt-2">This action cannot be undone!</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setExpenseToDelete(null);
                }}
                className="flex-1 border border-slate-300 text-slate-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteExpense}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
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
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminExpenses;