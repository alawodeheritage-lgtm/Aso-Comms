// src/pages/Admin/Expenses.tsx
import React, { useState } from 'react';
import Modal from '../../components/Modal';
import MetricCard from '../../components/MetricCard';

interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  loggedBy: string;
}

const AdminExpenses: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Parts Purchase');
  const [newAmount, setNewAmount] = useState('');

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      title: 'Bought iPhone 13 Pro OLED Screen',
      category: 'Parts Purchase',
      amount: 45000,
      date: 'Today, 10:24 AM',
      status: 'pending',
      loggedBy: 'CEO_Aso'
    },
    {
      id: '2',
      title: 'Shop Electricity Utility',
      category: 'Operations',
      amount: 12500,
      date: 'Yesterday',
      status: 'approved',
      loggedBy: 'CEO_Aso'
    },
    {
      id: '3',
      title: 'Samsung S22 Charging Port (x5)',
      category: 'Parts Purchase',
      amount: 18000,
      date: '22 Oct, 2023',
      status: 'pending',
      loggedBy: 'Tech_Support'
    }
  ]);

  // Derived Values - Only declare these ONCE
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenses = expenses.filter((e) => e.status === 'pending');
  const approvedExpenses = expenses.filter((e) => e.status === 'approved');
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

  const handleApprove = (id: string) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'approved' } : item))
    );
  };

  const handleReject = (id: string) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
    );
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAmount) return;

    const newExpenseItem: Expense = {
      id: Date.now().toString(),
      title: newTitle,
      category: newCategory,
      amount: parseFloat(newAmount) || 0,
      date: 'Just now',
      status: 'pending',
      loggedBy: 'Admin'
    };

    setExpenses([newExpenseItem, ...expenses]);
    setIsModalOpen(false);
    setNewTitle('');
    setNewAmount('');
  };

  const filteredExpenses =
    filter === 'all' ? expenses : expenses.filter((e) => e.status === filter);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <MetricCard 
          label="Total Expenses" 
          value={`₦${totalExpenses.toLocaleString()}`} 
          icon="payments"
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
      </div>

      {/* Filters Bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === status
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
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200/80 hover:border-slate-300 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                    {expense.title}
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
                  <span>{expense.date}</span>
                  <span>•</span>
                  <span>
                    Logged by: <span className="font-semibold text-slate-700">{expense.loggedBy}</span>
                  </span>
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-0 border-slate-100">
                <p className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  ₦{expense.amount.toLocaleString()}
                </p>

                {expense.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(expense.id)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(expense.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-lg transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredExpenses.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80">
            <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
              receipt_long
            </span>
            <p className="text-sm font-semibold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400 mt-0.5">There are no records matching your selected filter.</p>
          </div>
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
              Title
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
              placeholder="e.g. Bought iPhone 13 OLED Screen"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800"
              >
                <option>Parts Purchase</option>
                <option>Operations</option>
                <option>Marketing</option>
                <option>Utilities</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (₦)
              </label>
              <input
                type="number"
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
                placeholder="0.00"
              />
            </div>
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
            className="w-full h-11 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 text-sm mt-2"
          >
            Submit Expense
          </button>
        </form>
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
      `}</style>
    </div>
  );
};

export default AdminExpenses;