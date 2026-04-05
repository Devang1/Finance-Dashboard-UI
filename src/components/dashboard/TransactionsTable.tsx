import { useFinanceStore, useFilteredTransactions, usePaginatedTransactions } from '@/store/useFinanceStore';
import { Category, TransactionType } from '@/types/finance';
import { Pencil, Trash2, Download, Search, X, ChevronLeft, ChevronRight, Inbox, ArrowUpDown, ArrowUp, ArrowDown, Calendar, CalendarDays } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
}

function exportData(format: 'csv' | 'json') {
  const { transactions } = useFinanceStore.getState();
  let content: string, type: string, ext: string;
  if (format === 'csv') {
    const header = 'Date,Amount,Category,Type,Description';
    const rows = transactions.map(t => `${t.date},${t.amount},${t.category},${t.type},"${t.description || ''}"`);
    content = [header, ...rows].join('\n');
    type = 'text/csv';
    ext = 'csv';
  } else {
    content = JSON.stringify(transactions, null, 2);
    type = 'application/json';
    ext = 'json';
  }
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `transactions.${ext}`; a.click();
  URL.revokeObjectURL(url);
}

const categories: Category[] = ['Salary', 'Freelance', 'Investment', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];

type SortField = 'date' | 'amount' | 'category' | 'type';
type SortOrder = 'asc' | 'desc';

export default function TransactionsTable({ onEdit }: { onEdit?: (id: string) => void }) {
  const { filters, setFilter, resetFilters, role, deleteTransaction, currentPage, setCurrentPage, transactions } = useFinanceStore();
  const { data, totalPages, total } = usePaginatedTransactions();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const dateRangeRef = useRef<HTMLDivElement>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown size={12} className="opacity-50" />;
    return sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
  };

  const sortedData = [...data].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      default:
        comparison = 0;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const clearDateFilter = () => {
    setFilter('dateFrom', '');
    setFilter('dateTo', '');
    setIsDateRangeOpen(false);
  };

  const hasDateFilter = filters.dateFrom || filters.dateTo;
  const hasAnyFilter = filters.search || filters.category !== 'all' || filters.type !== 'all' || hasDateFilter;

  // Quick date range presets
  const setDateRange = (from: string, to: string) => {
    setFilter('dateFrom', from);
    setFilter('dateTo', to);
    setIsDateRangeOpen(false);
  };

  const getDatePresets = () => {
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const thisMonthEnd = today.toISOString().split('T')[0];
    
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
    
    const last7Days = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
    const last30Days = new Date(today.setDate(today.getDate() - 23)).toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    return [
      { label: 'Today', from: todayStr, to: todayStr },
      { label: 'Last 7 days', from: last7Days, to: todayStr },
      { label: 'Last 30 days', from: last30Days, to: todayStr },
      { label: 'This Month', from: thisMonthStart, to: thisMonthEnd },
      { label: 'Last Month', from: lastMonthStart, to: lastMonthEnd },
    ];
  };

  // Click outside to close date range picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRangeRef.current && !dateRangeRef.current.contains(event.target as Node)) {
        setIsDateRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForDisplay = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="animate-fade-up delay-400">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => exportData('csv')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-xl transition-smooth hover:bg-muted/80">
            <Download size={12} /> CSV
          </button>
          <button onClick={() => exportData('json')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-xl transition-smooth hover:bg-muted/80">
            <Download size={12} /> JSON
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 card-shadow mb-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[160px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          
          <select value={filters.category} onChange={(e) => setFilter('category', e.target.value)} className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          
          <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)} className="px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          
          {/* Enhanced Date Range Picker */}
          <div className="relative" ref={dateRangeRef}>
            <button
              onClick={() => setIsDateRangeOpen(!isDateRangeOpen)}
              className={`flex items-center gap-2 px-3 py-2 text-sm bg-background border rounded-xl transition-all ${
                hasDateFilter 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-border text-foreground hover:bg-muted/50'
              }`}
            >
              <CalendarDays size={14} />
              <span>
                {hasDateFilter 
                  ? `${filters.dateFrom ? formatDateForDisplay(filters.dateFrom) : 'Any'} - ${filters.dateTo ? formatDateForDisplay(filters.dateTo) : 'Any'}`
                  : 'Select Date Range'
                }
              </span>
              {hasDateFilter && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearDateFilter();
                  }}
                  className="ml-1 p-0.5 rounded-full hover:bg-muted"
                >
                  <X size={12} />
                </button>
              )}
            </button>

            {/* Responsive Date Range Dropdown */}
            {isDateRangeOpen && (
              <>
                {/* Backdrop for mobile */}
                <div 
                  className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                  onClick={() => setIsDateRangeOpen(false)}
                />
                
                {/* Dropdown - Full screen on mobile, positioned on desktop */}
                <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:inset-auto sm:top-full sm:left-auto sm:right-0 mt-0 sm:mt-2 w-full sm:w-[480px] bg-card border border-border rounded-t-2xl sm:rounded-xl shadow-xl z-50 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[85vh] sm:max-h-[90vh] overflow-auto">
                  <div className="p-4">
                    {/* Header with close button for mobile */}
                    <div className="flex items-center justify-between sm:hidden mb-4 pb-2 border-b border-border">
                      <h4 className="font-semibold text-foreground text-base">Select Date Range</h4>
                      <button
                        onClick={() => setIsDateRangeOpen(false)}
                        className="p-2 rounded-lg hover:bg-muted transition-colors"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Quick Presets */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Quick Select</p>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                        {getDatePresets().map((preset) => (
                          <button
                            key={preset.label}
                            onClick={() => setDateRange(preset.from, preset.to)}
                            className="px-3 py-2 text-xs bg-muted hover:bg-primary/10 rounded-lg transition-colors"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Range */}
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground">Custom Range</p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">Start Date</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="date"
                              value={filters.dateFrom}
                              onChange={(e) => setFilter('dateFrom', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              max={filters.dateTo || undefined}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-muted-foreground mb-1 block">End Date</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                              type="date"
                              value={filters.dateTo}
                              onChange={(e) => setFilter('dateTo', e.target.value)}
                              className="w-full pl-8 pr-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              min={filters.dateFrom || undefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between gap-2 mt-4 pt-3 border-t border-border">
                      <button
                        onClick={clearDateFilter}
                        className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => setIsDateRangeOpen(false)}
                        className="px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {hasAnyFilter && (
            <button onClick={resetFilters} className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl transition-smooth">
              <X size={12} /> Clear All
            </button>
          )}
        </div>
        
        {/* Active filters display */}
        {hasAnyFilter && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                Search: {filters.search}
                <button onClick={() => setFilter('search', '')} className="hover:text-primary-foreground">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                Category: {filters.category}
                <button onClick={() => setFilter('category', 'all')} className="hover:text-primary-foreground">
                  <X size={10} />
                </button>
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                Type: {filters.type}
                <button onClick={() => setFilter('type', 'all')} className="hover:text-primary-foreground">
                  <X size={10} />
                </button>
              </span>
            )}
            {hasDateFilter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                Date: {formatDateForDisplay(filters.dateFrom) || 'Any'} → {formatDateForDisplay(filters.dateTo) || 'Any'}
                <button onClick={clearDateFilter} className="hover:text-primary-foreground">
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        {sortedData.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Inbox size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('date')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Date
                      {getSortIcon('date')}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('category')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Category
                      {getSortIcon('category')}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      Type
                      {getSortIcon('type')}
                    </button>
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors"
                    >
                      Amount
                      {getSortIcon('amount')}
                    </button>
                  </th>
                  {role === 'admin' && <th className="px-5 py-3"></th>}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 transition-smooth hover:bg-muted/30 group">
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">
                      {new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-card-foreground max-w-[200px] truncate">
                      {t.description || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 text-xs font-medium bg-muted rounded-lg text-muted-foreground">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
                        t.type === 'income' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 text-right font-semibold text-sm ${
                      t.type === 'income' ? 'text-success' : 'text-destructive'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    {role === 'admin' && (
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(t.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Showing {sortedData.length} of {total} results
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground disabled:opacity-40 hover:bg-muted/80 transition-smooth"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs rounded-lg transition-smooth ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-muted text-muted-foreground disabled:opacity-40 hover:bg-muted/80 transition-smooth"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}