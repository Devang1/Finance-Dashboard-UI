import { useFinanceStore } from '@/store/useFinanceStore';
import { Moon, Sun, Plus, IndianRupee } from 'lucide-react';

interface HeaderProps {
  onAddTransaction: () => void;
}

export default function Header({ onAddTransaction }: HeaderProps) {
  const { role, setRole, theme, toggleTheme } = useFinanceStore();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-card/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <img src="/logo.png" alt="Logo"  className='w-100 h-100 rounded-xl'/>
          </div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">FinanceHub</h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center bg-muted rounded-xl p-0.5">
            <button
              onClick={() => setRole('viewer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-smooth ${role === 'viewer' ? 'bg-card card-shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Viewer
            </button>
            <button
              onClick={() => setRole('admin')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-smooth ${role === 'admin' ? 'bg-card card-shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Admin
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-smooth hover:bg-muted/80"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {role === 'admin' && (
            <button
              onClick={onAddTransaction}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium transition-smooth hover:opacity-90 active:scale-[0.97]"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
