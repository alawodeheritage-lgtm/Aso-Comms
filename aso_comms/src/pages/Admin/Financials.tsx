// src/pages/Admin/Financials.tsx
import React, { useState, useEffect, useMemo } from 'react';
import MetricCard from '../../components/MetricCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import StatusBadge from '../../components/StatusBadge';
import { transactionsAPI } from '../../api/transactions';
import { expensesAPI } from '../../api/expenses';
import { repairsAPI } from '../../api/repairs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  _id?: string;
  repairId?: string;
  notes?: string;
  loggedBy?: {
    username: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Colours for charts
const COLORS = ['#1A365D', '#D97706', '#10B981', '#EF4444', '#8B5CF6', '#EC4899'];

const Financials: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const formatCurrency = (amount: number): string => {
    return `₦${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const formatCurrencyWithSign = (amount: number, type: 'income' | 'expense'): string => {
    const formatted = formatCurrency(Math.abs(amount));
    return type === 'income' ? `+${formatted}` : `-${formatted}`;
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching financial data...');

      const [transactionsRes, expensesRes, repairsRes] = await Promise.all([
        transactionsAPI.getAll(),
        expensesAPI.getAll(),
        repairsAPI.getAll()
      ]);

      console.log('📊 Transactions:', transactionsRes);
      console.log('📊 Expenses:', expensesRes);
      console.log('📊 Repairs:', repairsRes);

      let transactionData: Transaction[] = [];

      if (transactionsRes.transactions) {
        transactionData = transactionsRes.transactions.map((t: any) => ({
          id: t._id || t.id,
          description: t.description || 'Transaction',
          amount: formatCurrencyWithSign(t.amount, t.type || 'expense'),
          date: new Date(t.date || t.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          type: t.type || 'expense',
          category: t.category || 'Other',
          _id: t._id,
          repairId: t.repairId,
          notes: t.notes || '',
          loggedBy: t.loggedBy,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        }));
      }

      if (expensesRes.expenses) {
        const expenseTransactions = expensesRes.expenses.map((e: any) => ({
          id: e._id || e.id,
          description: e.description || 'Expense',
          amount: formatCurrencyWithSign(e.amount, 'expense'),
          date: new Date(e.dateLogged || e.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          type: 'expense' as const,
          category: e.category || 'Other',
          _id: e._id,
          notes: e.notes || '',
          loggedBy: e.loggedBy,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt
        }));
        transactionData = [...transactionData, ...expenseTransactions];
      }

      if (repairsRes.repairs) {
        const repairTransactions = repairsRes.repairs
          .filter((r: any) => r.financials?.amountPaid > 0)
          .map((r: any) => ({
            id: r._id || r.id,
            description: `${r.deviceModel || 'Device'} Repair - ${r.customerName || 'Customer'}`,
            amount: formatCurrencyWithSign(r.financials?.amountPaid || 0, 'income'),
            date: new Date(r.dateLogged || r.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            type: 'income' as const,
            category: 'Repairs',
            _id: r._id,
            repairId: r._id,
            notes: r.issueDescription || '',
            loggedBy: r.owner,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt
          }));
        transactionData = [...transactionData, ...repairTransactions];

        // Store repairs for additional stats
        setRepairs(repairsRes.repairs);
      }

      transactionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      console.log(`📊 Total transactions: ${transactionData.length}`);
      setTransactions(transactionData);
    } catch (err: any) {
      console.error('❌ Failed to fetch financial data:', err);
      setToast({
        message: err.response?.data?.error || 'Failed to load financial data. Please refresh.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // ========== Detailed Calculations ==========
  // Total Income (Revenue)
  const totalRevenue = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[₦,+-]/g, '')), 0);

  // Total Expenses
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[₦,+-]/g, '')), 0);

  // Net Profit
  const netProfit = totalRevenue - totalExpenses;

  // Total Estimates (from repairs)
  const totalEstimates = repairs.reduce((sum, r) => sum + (r.financials?.totalEstimate || 0), 0);

  // Total Outstanding (balance due from repairs)
  const totalOutstanding = repairs.reduce((sum, r) => sum + (r.financials?.balanceDue || 0), 0);

  // Cash in Hand (same as totalRevenue)
  const cashInHand = totalRevenue;

  // Payment status breakdown
  const paymentStatusCounts = repairs.reduce((acc: Record<string, number>, r) => {
    const status = r.financials?.paymentStatus || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const paymentStatusData = Object.entries(paymentStatusCounts).map(([status, count]) => ({ status, count }));

  // Income by category (Repairs vs Other)
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount.replace(/[₦,+-]/g, ''));
      return acc;
    }, {});
  const incomeCategoryData = Object.entries(incomeByCategory).map(([category, amount]) => ({ category, amount }));

  // Expense by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || 'Other';
      acc[cat] = (acc[cat] || 0) + parseFloat(t.amount.replace(/[₦,+-]/g, ''));
      return acc;
    }, {});
  const expenseCategoryData = Object.entries(expenseByCategory).map(([category, amount]) => ({ category, amount }));

  // Monthly trends (aggregated by month)
  const monthlyTrends = transactions.reduce((acc: Record<string, { income: number, expense: number }>, t) => {
    const monthKey = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[monthKey]) acc[monthKey] = { income: 0, expense: 0 };
    const amount = parseFloat(t.amount.replace(/[₦,+-]/g, ''));
    if (t.type === 'income') acc[monthKey].income += amount;
    else acc[monthKey].expense += amount;
    return acc;
  }, {});
  const monthlyTrendsData = Object.entries(monthlyTrends).map(([month, data]) => ({
    month,
    income: data.income,
    expense: data.expense,
    profit: data.income - data.expense
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  // ========== UI ==========
  const metrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: 'trending_up',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: { value: '+18.5%', direction: 'up' as const }
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(totalExpenses),
      icon: 'payments',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: { value: '+5.2%', direction: 'up' as const }
    },
    {
      label: 'Net Profit',
      value: formatCurrency(netProfit),
      icon: 'account_balance',
      color: netProfit >= 0 ? 'text-emerald-600' : 'text-red-600',
      bgColor: netProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'
    },
    {
      label: 'Total Transactions',
      value: transactions.length.toString(),
      icon: 'receipt_long',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const extraMetrics = [
    {
      label: 'Cash in Hand',
      value: formatCurrency(cashInHand),
      icon: 'payments',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      label: 'Total Estimates',
      value: formatCurrency(totalEstimates),
      icon: 'receipt',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Outstanding Receivables',
      value: formatCurrency(totalOutstanding),
      icon: 'pending',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Payment Statuses',
      value: paymentStatusData.length.toString(),
      icon: 'checklist',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case 'ytd': return 'Year to Date';
      default: return range;
    }
  };

  const categoryOptions = ['All Categories', ...new Set(transactions.map(t => t.category))];

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (searchQuery) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedType !== 'All Types') {
      filtered = filtered.filter((t) => t.type === selectedType.toLowerCase());
    }
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter((t) => t.category === selectedCategory);
    }
    return filtered;
  }, [searchQuery, selectedType, selectedCategory, transactions]);

  const formatDateFull = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#1A365D] border-t-transparent"></div>
          <p className="mt-3 text-base font-medium text-slate-500">Loading financial data...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1A365D] tracking-tight">Financial Overview</h1>
            <p className="text-sm text-slate-500 mt-0.5">Complete financial health, revenue, expenses, and profitability.</p>
          </div>
          <button onClick={fetchFinancialData} className="inline-flex items-center gap-2 bg-[#1A365D] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#2D4A6B] hover:-translate-y-0.5 transition-all shadow-sm shadow-[#1A365D]/20">
            <span className="material-symbols-outlined text-lg">refresh</span>
            Refresh Data
          </button>
        </div>

        {/* Time Range */}
        <div className="flex flex-wrap gap-2">
          {(['7d', '30d', 'ytd'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${timeRange === range
                ? 'bg-[#1A365D] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-[#1A365D]'
                }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '30d' ? '30 Days' : 'YTD'}
            </button>
          ))}
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Extra Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {extraMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200/60 gap-6">
          {['overview', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-2 text-sm font-bold transition-all relative ${activeTab === tab
                ? 'text-[#1A365D] border-b-2 border-[#1A365D]'
                : 'text-slate-500 hover:text-[#1A365D]'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Monthly Trends */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-[#1A365D] mb-4">Monthly Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Income & Expense Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Income by Category */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-[#1A365D] mb-4">Income Breakdown</h3>
                {incomeCategoryData.length === 0 ? (
                  <p className="text-sm text-slate-500">No income data available.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategoryData}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {incomeCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Expense by Category */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold text-[#1A365D] mb-4">Expense Breakdown</h3>
                {expenseCategoryData.length === 0 ? (
                  <p className="text-sm text-slate-500">No expense data available.</p>
                ) : (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategoryData}
                          dataKey="amount"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₦${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Status Breakdown */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-sm font-bold text-[#1A365D] mb-4">Payment Status</h3>
              {paymentStatusData.length === 0 ? (
                <p className="text-sm text-slate-500">No payment data available.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {paymentStatusData.map((item) => (
                    <div
                      key={item.status}
                      className={`px-4 py-2 rounded-full text-sm font-bold border ${item.status === 'Paid in Full'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'Partial / Deposit Logged'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : item.status === 'Unpaid'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                    >
                      {item.status}: {item.count}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions Preview */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#1A365D]">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-xs font-medium text-[#D97706] hover:text-[#b85f00] flex items-center gap-0.5 transition-colors"
                >
                  View All <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
              <div className="space-y-2">
                {transactions.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => handleTransactionClick(t)}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-800">{t.description}</p>
                      <p className="text-xs text-slate-500">{t.date}</p>
                    </div>
                    <p className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {t.amount}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Filters Bar */}
            <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base sm:text-lg">search</span>
                <input
                  className="w-full h-10 sm:h-12 pl-9 sm:pl-11 pr-3 sm:pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] focus:bg-white outline-none transition-all text-sm sm:text-base text-slate-800 placeholder-slate-400"
                  placeholder="Search transactions..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-10 sm:h-12 px-3 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] outline-none transition-all text-sm sm:text-base font-bold text-slate-700 flex-1"
                >
                  <option>All Types</option>
                  <option>Income</option>
                  <option>Expense</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 sm:h-12 px-3 sm:px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1A365D]/20 focus:border-[#1A365D] outline-none transition-all text-sm sm:text-base font-bold text-slate-700 flex-1"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-400 mb-2">receipt_long</span>
                  <p className="text-sm sm:text-base font-bold text-slate-700">No transactions found</p>
                  <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Try adjusting your search query or filters.</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    onClick={() => handleTransactionClick(transaction)}
                    className="p-3 sm:p-4 hover:bg-slate-50/80 hover:border-l-4 hover:border-l-[#1A365D] transition-all cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                          <span
                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 ${transaction.type === 'income' ? 'bg-emerald-500' : 'bg-red-500'
                              }`}
                          />
                          <p className="text-sm sm:text-base font-bold text-slate-900 truncate">{transaction.description}</p>
                          <span className="text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 px-2 sm:px-3 py-0.5 rounded-md border border-slate-200/60">
                            {transaction.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">{transaction.date}</p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-1 sm:pt-0 border-t sm:border-0 border-slate-100">
                        <p className={`font-extrabold text-sm sm:text-base ${transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                          {transaction.amount}
                        </p>
                        <span className="material-symbols-outlined text-slate-400 text-sm sm:text-base">chevron_right</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            <div className="p-3 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              <p className="text-xs sm:text-sm text-slate-500">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <div className="flex gap-1.5">
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#1A365D] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs">
                  1
                </button>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal – Transaction Details */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTransaction(null);
          }}
          title="Transaction Details"
          size="lg"
        >
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedTransaction.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {selectedTransaction.type === 'income' ? 'Income' : 'Expense'}
                  </span>
                  <span className="text-xs text-slate-500">{selectedTransaction.date}</span>
                </div>
                <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                  ID: {selectedTransaction.id?.slice(-8) || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</p>
                  <p className="text-base font-bold text-slate-900 mt-1">{selectedTransaction.description}</p>
                </div>
                <div className={`p-3 rounded-xl border ${selectedTransaction.type === 'income' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
                  }`}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</p>
                  <p className={`text-2xl font-extrabold mt-1 ${selectedTransaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {selectedTransaction.amount}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTransaction.category}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</p>
                  <p className="text-sm font-bold text-slate-800 mt-1 capitalize">{selectedTransaction.type}</p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Notes</p>
                  <p className="text-sm text-slate-700 mt-1 italic">{selectedTransaction.notes}</p>
                </div>
              )}

              {selectedTransaction.loggedBy && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged By</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {selectedTransaction.loggedBy.username || 'Unknown'}
                    {selectedTransaction.loggedBy.email && (
                      <span className="text-xs font-normal text-slate-500 ml-2">
                        ({selectedTransaction.loggedBy.email})
                      </span>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                {selectedTransaction.createdAt && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400">Created</p>
                    <p className="text-xs font-medium text-slate-600">{formatDateFull(selectedTransaction.createdAt)}</p>
                  </div>
                )}
                {selectedTransaction.updatedAt && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-400">Last Updated</p>
                    <p className="text-xs font-medium text-slate-600">{formatDateFull(selectedTransaction.updatedAt)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTransaction(null);
                  }}
                  className="flex-1 bg-[#1A365D] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#2D4A6B] transition-colors shadow-xs"
                >
                  Close
                </button>
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
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Financials;