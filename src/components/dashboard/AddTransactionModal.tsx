import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import { Category, TransactionType, Transaction } from '@/types/finance';
import { X } from 'lucide-react';

const categories: Category[] = ['Salary', 'Freelance', 'Investment', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Education', 'Travel', 'Other'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editId?: string | null;
}

export default function AddTransactionModal({ isOpen, onClose, editId }: Props) {
  const { addTransaction, editTransaction, transactions } = useFinanceStore();
  const editingTx = editId ? transactions.find(t => t.id === editId) : null;

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food' as Category,
    type: 'expense' as TransactionType,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTx) {
      setForm({
        date: editingTx.date,
        amount: editingTx.amount.toString(),
        category: editingTx.category,
        type: editingTx.type,
        description: editingTx.description,
      });
    } else {
      setForm({ date: new Date().toISOString().split('T')[0], amount: '', category: 'Food', type: 'expense', description: '' });
    }
    setErrors({});
  }, [editingTx, isOpen]);

  if (!isOpen) return null;

  function validate() {
    const e: Record<string, string> = {};
    if (!form.date) e.date = 'Required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter a valid amount';
    if (!form.description.trim()) e.description = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    const data = { date: form.date, amount: Number(form.amount), category: form.category, type: form.type, description: form.description.trim() };
    if (editId) {
      editTransaction(editId, data);
    } else {
      addTransaction(data);
    }
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-card rounded-2xl card-shadow-lg w-full max-w-md p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-card-foreground">{editId ? 'Edit' : 'Add'} Transaction</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
              <div className="flex bg-muted rounded-xl p-0.5">
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'expense' }))} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-smooth ${form.type === 'expense' ? 'bg-card card-shadow text-foreground' : 'text-muted-foreground'}`}>Expense</button>
                <button type="button" onClick={() => setForm(f => ({ ...f, type: 'income' }))} className={`flex-1 py-2 text-xs font-medium rounded-lg transition-smooth ${form.type === 'income' ? 'bg-card card-shadow text-foreground' : 'text-muted-foreground'}`}>Income</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
              {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Amount (₹)</label>
            <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <input type="text" placeholder="What was this for?" maxLength={100} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <button type="submit" disabled={saving} className="w-full py-2.5 bg-accent text-accent-foreground rounded-xl font-medium text-sm transition-smooth hover:opacity-90 active:scale-[0.98] disabled:opacity-50">
            {saving ? 'Saving...' : editId ? 'Update' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}
