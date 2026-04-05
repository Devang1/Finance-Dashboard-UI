import { useStats } from '@/store/useFinanceStore';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function HeroBalance() {
  const stats = useStats();
  const changePositive = stats.monthlyChange <= 0;

  const quickStats = [
    { label: 'Income', value: formatCurrency(stats.totalIncome), Icon: TrendingUp, colorClass: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
    { label: 'Expenses', value: formatCurrency(stats.totalExpenses), Icon: TrendingDown, colorClass: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 sm:p-8 card-shadow-lg animate-fade-up">
      {/* Background decorations */}
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-secondary/20" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-accent/15" />

      <div className="relative z-10">
        {/* Total Balance - Centered at top */}
        <div className="text-center mb-6">
          <p className="text-primary-foreground/60 text-sm font-medium tracking-wide uppercase">Total Balance</p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mt-2 tracking-tight">
            {formatCurrency(stats.balance)}
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${changePositive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                {changePositive ? '↓' : '↑'} {Math.abs(stats.monthlyChange).toFixed(1)}%
              </span>
              <span className="text-primary-foreground/50 text-xs">vs last month</span>
            </div>

            <div className="h-4 w-px bg-primary-foreground/20 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-primary-foreground/70 text-sm">
                Savings rate: <strong className="text-primary-foreground">{stats.savingsRate.toFixed(1)}%</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Stats in a row with circular representation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-primary-foreground/20">
          {quickStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 p-3 rounded-xl bg-primary-foreground/5 hover:bg-primary-foreground/10 transition-all duration-200">
              {/* Circular icon container */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${stat.colorClass}`}>
                <stat.Icon size={18} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-primary-foreground/60 text-xs font-medium uppercase tracking-wide">
                  {stat.label}
                </p>
                <p className="text-primary-foreground text-lg font-bold mt-0.5 truncate">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}