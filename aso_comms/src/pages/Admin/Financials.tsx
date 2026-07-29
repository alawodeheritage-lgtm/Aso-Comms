import React, { useState, useMemo } from 'react';
import MetricCard from '../../components/MetricCard';

interface Transaction {
  id: string;
  description: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
}

const Financials: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'ytd'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions'>('overview');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  const metrics = [
    {
      label: 'Total Revenue',
      value: '₦8.4M',
      icon: 'trending_up',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: { value: '+18.5%', direction: 'up' as const }
    },
    {
      label: 'Total Expenses',
      value: '₦2.1M',
      icon: 'payments',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      trend: { value: '+5.2%', direction: 'up' as const }
    },
    {
      label: 'Net Profit',
      value: '₦6.3M',
      icon: 'account_balance',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'ARPU',
      value: '₦12,400',
      icon: 'person',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  ];

  const recentTransactions: Transaction[] = [
    { id: '1', description: 'iPhone 14 Pro Repair', amount: '+₦45,000', date: 'Today', type: 'income', category: 'Repairs' },
    { id: '2', description: 'Parts Purchase - Samsung S22', amount: '-₦18,000', date: 'Yesterday', type: 'expense', category: 'Parts' },
    { id: '3', description: 'MacBook Air Battery Replacement', amount: '+₦32,000', date: 'Dec 12, 2023', type: 'income', category: 'Repairs' },
    { id: '4', description: 'Shop Rent - December', amount: '-₦150,000', date: 'Dec 10, 2023', type: 'expense', category: 'Operations' },
    { id: '5', description: 'iPad Screen Replacement', amount: '+₦28,000', date: 'Dec 8, 2023', type: 'income', category: 'Repairs' },
    { id: '6', description: 'Marketing Ads - Google', amount: '-₦45,000', date: 'Dec 5, 2023', type: 'expense', category: 'Marketing' }
  ];

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case '7d':
        return 'Last 7 Days';
      case '30d':
        return 'Last 30 Days';
      case 'ytd':
        return 'Year to Date';
      default:
        return range;
    }
  };

  const totalRevenue = recentTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₦,+-]/g, '')), 0);

  const totalExpenses = recentTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + parseInt(t.amount.replace(/[₦,+-]/g, '')), 0);

  const netProfit = totalRevenue - totalExpenses;

  // Search & Filter Logic
  const filteredTransactions = useMemo(() => {
    return recentTransactions.filter((transaction) => {
      const matchesSearch = transaction.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesType =
        selectedType === 'All Types' ||
        transaction.type.toLowerCase() === selectedType.toLowerCase();

      const matchesCategory =
        selectedCategory === 'All Categories' ||
        transaction.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [searchQuery, selectedType, selectedCategory, recentTransactions]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            High-level expense and revenue oversight
          </p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20 w-full sm:w-auto">
          <span className="material-symbols-outlined text-lg">file_download</span>
          Export Report
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200/60">
        {(['7d', '30d', 'ytd'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${timeRange === range
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
          >
            {getTimeRangeLabel(range)}
          </button>
        ))}
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Revenue
          </p>
          <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
            ₦{(totalRevenue / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Expenses
          </p>
          <p className="text-xl font-extrabold text-red-600 mt-0.5">
            ₦{(totalExpenses / 1000).toFixed(1)}K
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-2xs border border-slate-200/80 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Profit
          </p>
          <p
            className={`text-xl font-extrabold mt-0.5 ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
          >
            ₦{(netProfit / 1000).toFixed(1)}K
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/80 mb-6 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-sm font-bold transition-all relative ${activeTab === 'transactions'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-800'
            }`}
        >
          Transactions
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Top Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {metrics.map((metric, index) => (
              <MetricCard key={index} {...metric} />
            ))}
          </div>

          {/* Revenue vs Expenses Chart Placeholder */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xs border border-slate-200/80 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Revenue vs Expenses
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual comparative performance breakdown
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                {getTimeRangeLabel(timeRange)}
              </span>
            </div>

            <div className="h-44 sm:h-56 flex items-end gap-1.5 sm:gap-3">
              {[75, 55, 85, 65, 90, 70, 95, 60, 80, 75, 85, 70, 90, 80].map(
                (height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className="w-full bg-blue-600/80 hover:bg-blue-600 rounded-t-md transition-all cursor-pointer"
                      style={{ height: `${height * 0.8}%`, minHeight: '8px' }}
                    />
                  </div>
                )
              )}
            </div>
            <div className="flex justify-between mt-4 pt-2 border-t border-slate-100 text-[10px] sm:text-xs font-bold text-slate-400">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          {/* Recent Transactions Preview */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xs border border-slate-200/80">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Recent Transactions
              </h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
              >
                View All
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
            <div className="space-y-2.5">
              {recentTransactions.slice(0, 4).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 hover:bg-slate-100/70 transition-colors gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {transaction.description}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{transaction.date}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">
                        {transaction.category}
                      </span>
                    </p>
                  </div>
                  <p
                    className={`font-extrabold text-xs sm:text-sm flex-shrink-0 ${transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-red-600'
                      }`}
                  >
                    {transaction.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg">
                search
              </span>
              <input
                className="w-full h-11 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none transition-all text-sm text-slate-800 placeholder-slate-400"
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
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-xs font-bold text-slate-700 flex-1 sm:flex-none"
              >
                <option>All Types</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none transition-all text-xs font-bold text-slate-700 flex-1 sm:flex-none"
              >
                <option>All Categories</option>
                <option>Repairs</option>
                <option>Parts</option>
                <option>Operations</option>
                <option>Marketing</option>
              </select>
            </div>
          </div>

          {/* Transaction List */}
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 hover:bg-slate-50/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${transaction.type === 'income'
                            ? 'bg-emerald-500'
                            : 'bg-red-500'
                          }`}
                      ></span>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {transaction.description}
                      </p>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                        {transaction.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{transaction.date}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <p
                      className={`font-extrabold text-sm sm:text-base ${transaction.type === 'income'
                          ? 'text-emerald-600'
                          : 'text-red-600'
                        }`}
                    >
                      {transaction.amount}
                    </p>
                    <button className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredTransactions.length === 0 && (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-1">
                  receipt_long
                </span>
                <p className="text-sm font-bold text-slate-700">No transactions found</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Try adjusting your search query or filters.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing 1-{filteredTransactions.length} of {recentTransactions.length} transactions
            </p>
            <div className="flex gap-1.5">
              <button
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs">
                1
              </button>
              <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Financials;