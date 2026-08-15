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

        {/* ========== MODALS (kept as before – they already use the Modal component) ========== */}
        {/* Log Expense Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Log New Expense"
          size="lg"
        >
          <form onSubmit={handleAddExpense} className="space-y-4">
            {/* ... form fields ... (unchanged) */}
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
          {/* ... view details ... (unchanged) */}
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
          {/* ... delete confirmation ... (unchanged) */}
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