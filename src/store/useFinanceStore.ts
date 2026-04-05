import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Role, Filters, Category, TransactionType } from '@/types/finance';
import { generateMockTransactions } from '@/data/mockData';

interface FinanceState {
  transactions: Transaction[];
  role: Role;
  theme: 'light' | 'dark';
  filters: Filters;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  setRole: (role: Role) => void;
  toggleTheme: () => void;
  setFilter: (key: keyof Filters, value: string) => void;
  resetFilters: () => void;
  addTransaction: (t: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  editTransaction: (id: string, t: Partial<Transaction>) => void;
  setCurrentPage: (page: number) => void;
  initializeData: () => void;
}

const defaultFilters: Filters = {
  search: '',
  category: 'all',
  type: 'all',
  dateFrom: '',
  dateTo: '',
  groupBy: 'none',
};

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      role: 'admin',
      theme: 'light',
      filters: { ...defaultFilters },
      isLoading: false,
      currentPage: 1,
      itemsPerPage: 8,

      setRole: (role) => set({ role }),
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', next === 'dark');
        set({ theme: next });
      },
      setFilter: (key, value) => set((s) => ({ filters: { ...s.filters, [key]: value }, currentPage: 1 })),
      resetFilters: () => set({ filters: { ...defaultFilters }, currentPage: 1 }),
      addTransaction: (t) => {
        const id = Math.random().toString(36).substring(2, 11);
        set((s) => ({
          transactions: [{ ...t, id }, ...s.transactions],
        }));
      },
      deleteTransaction: (id) => set((s) => ({
        transactions: s.transactions.filter((t) => t.id !== id),
      })),
      editTransaction: (id, updates) => set((s) => ({
        transactions: s.transactions.map((t) => t.id === id ? { ...t, ...updates } : t),
      })),
      setCurrentPage: (page) => set({ currentPage: page }),
      initializeData: () => {
        if (get().transactions.length === 0) {
          set({ transactions: generateMockTransactions(50) });
        }
      },
    }),
    {
      name: 'finance-dashboard-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        role: state.role,
        theme: state.theme,
      }),
    }
  )
);

// Selectors
export const useFilteredTransactions = () => {
  const { transactions, filters } = useFinanceStore();
  return transactions.filter((t) => {
    if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase()) && !t.category.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.category !== 'all' && t.category !== filters.category) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    return true;
  });
};

export const usePaginatedTransactions = () => {
  const filtered = useFilteredTransactions();
  const { currentPage, itemsPerPage } = useFinanceStore();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  return {
    data: filtered.slice(start, start + itemsPerPage),
    totalPages,
    total: filtered.length,
  };
};

export const useStats = () => {
  const { transactions } = useFinanceStore();
  const now = new Date();
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const lastMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const thisMonthIncome = thisMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const thisMonthExpenses = thisMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastMonthExpenses = lastMonth.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const lastMonthIncome = lastMonth.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  const monthlyChange = lastMonthExpenses > 0 ? ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

  // Highest spending category
  const categoryTotals: Record<string, number> = {};
  transactions.filter((t) => t.type === 'expense').forEach((t) => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

  return {
    balance, totalIncome, totalExpenses, savingsRate, monthlyChange,
    thisMonthIncome, thisMonthExpenses, lastMonthIncome, lastMonthExpenses,
    topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
    categoryTotals,
  };
};
