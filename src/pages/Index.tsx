import { useEffect, useState } from 'react';
import { useFinanceStore } from '@/store/useFinanceStore';
import Header from '@/components/dashboard/Header';
import HeroBalance from '@/components/dashboard/HeroBalance';
import Insights from '@/components/dashboard/Insights';
import TransactionsTable from '@/components/dashboard/TransactionsTable';
import AddTransactionModal from '@/components/dashboard/AddTransactionModal';

export default function Index() {
  const { initializeData, theme, isLoading } = useFinanceStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    initializeData();
    // Simulate loading
    const t = setTimeout(() => setReady(true), 600);
    return () => clearTimeout(t);
  }, []);

  function handleEdit(id: string) {
    setEditId(id);
    setModalOpen(true);
  }

  function handleClose() {
    setModalOpen(false);
    setEditId(null);
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onAddTransaction={() => setModalOpen(true)} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <HeroBalance />
        <Insights />
        <TransactionsTable onEdit={handleEdit} />
      </main>
      <AddTransactionModal isOpen={modalOpen} onClose={handleClose} editId={editId} />
    </div>
  );
}
