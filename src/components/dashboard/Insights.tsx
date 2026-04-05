import { useStats } from '@/store/useFinanceStore';
import { useFinanceStore } from '@/store/useFinanceStore';
import { LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { useMemo, useState, useEffect } from 'react';
import { Tag, BarChart3, Wallet, Lightbulb, TrendingUp, TrendingDown, Maximize2, Minimize2, Activity, PieChart as PieChartIcon, Target, CreditCard, AlertCircle } from 'lucide-react';

function formatCurrency(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

function formatFullCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

export default function Insights() {
  const { transactions } = useFinanceStore();
  const stats = useStats();
  const [expandedChart, setExpandedChart] = useState<'line' | 'pie' | null>(null);
  const [hoveredInsight, setHoveredInsight] = useState<string | null>(null);
  
  // Prevent body scroll when chart is expanded
  useEffect(() => {
    if (expandedChart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expandedChart]);
  
  const expenseChange = stats.lastMonthExpenses > 0
    ? ((stats.thisMonthExpenses - stats.lastMonthExpenses) / stats.lastMonthExpenses * 100)
    : 0;
  const incomeChange = stats.lastMonthIncome > 0
    ? ((stats.thisMonthIncome - stats.lastMonthIncome) / stats.lastMonthIncome * 100)
    : 0;

  // Calculate additional insights
  const averageMonthlyExpense = stats.totalExpenses / 12;
  const highestExpenseDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    transactions.filter(t => t.type === 'expense').forEach(t => {
      const day = t.date;
      dayMap.set(day, (dayMap.get(day) || 0) + t.amount);
    });
    let maxDay = '';
    let maxAmount = 0;
    dayMap.forEach((amount, day) => {
      if (amount > maxAmount) {
        maxAmount = amount;
        maxDay = day;
      }
    });
    return { date: maxDay, amount: maxAmount };
  }, [transactions]);

  const insights = [
    {
      id: 'top-category',
      title: 'Top Spending Category',
      value: stats.topCategory ? stats.topCategory.name : 'N/A',
      detail: stats.topCategory ? formatFullCurrency(stats.topCategory.amount) : '',
      badge: stats.topCategory ? 'Highest' : '',
      badgeColor: 'bg-destructive/10 text-destructive',
      Icon: Tag,
      gradient: 'from-destructive/5 to-destructive/10',
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      value: formatFullCurrency(stats.thisMonthExpenses),
      detail: `${expenseChange >= 0 ? '+' : ''}${expenseChange.toFixed(1)}% vs last month`,
      badge: expenseChange > 10 ? 'Alert' : expenseChange < 0 ? 'Good' : 'Stable',
      badgeColor: expenseChange > 10 ? 'bg-destructive/10 text-destructive' : expenseChange < 0 ? 'bg-success/10 text-success' : 'bg-accent/10 text-accent',
      Icon: BarChart3,
      trend: expenseChange,
    },
    {
      id: 'income',
      title: 'Monthly Income',
      value: formatFullCurrency(stats.thisMonthIncome),
      detail: `${incomeChange >= 0 ? '+' : ''}${incomeChange.toFixed(1)}% vs last month`,
      badge: incomeChange > 0 ? 'Growing' : incomeChange < -10 ? 'Declining' : 'Stable',
      badgeColor: incomeChange > 0 ? 'bg-success/10 text-success' : incomeChange < -10 ? 'bg-destructive/10 text-destructive' : 'bg-accent/10 text-accent',
      Icon: Wallet,
      trend: incomeChange,
    },
    {
      id: 'savings',
      title: 'Smart Insight',
      value: stats.savingsRate > 20 ? 'Great savings!' : stats.savingsRate > 0 ? 'Room to save' : 'Spending more than earning',
      detail: stats.savingsRate > 20 ? 'You\'re saving above the recommended 20%' : 'Try to cut down on discretionary spending',
      badge: stats.savingsRate > 20 ? 'Healthy' : 'Tip',
      badgeColor: stats.savingsRate > 20 ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
      Icon: Lightbulb,
    },
    {
      id: 'average-expense',
      title: 'Avg Monthly Expense',
      value: formatFullCurrency(averageMonthlyExpense),
      detail: 'Based on last 12 months',
      badge: averageMonthlyExpense > stats.thisMonthExpenses ? 'Below Avg' : 'Above Avg',
      badgeColor: averageMonthlyExpense > stats.thisMonthExpenses ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
      Icon: Target,
      gradient: 'from-blue-500/5 to-blue-500/10',
    },
    {
      id: 'highest-day',
      title: 'Highest Spending Day',
      value: highestExpenseDay.date ? new Date(highestExpenseDay.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A',
      detail: highestExpenseDay.amount ? formatFullCurrency(highestExpenseDay.amount) : 'No data',
      badge: 'Peak',
      badgeColor: 'bg-destructive/10 text-destructive',
      Icon: CreditCard,
      gradient: 'from-orange-500/5 to-orange-500/10',
    },
  ];

  // Chart Data
  const lineData = useMemo(() => {
    const months: Record<string, { expense: number; income: number }> = {};
    transactions.forEach(t => {
      const key = t.date.substring(0, 7);
      if (!months[key]) months[key] = { expense: 0, income: 0 };
      if (t.type === 'expense') months[key].expense += t.amount;
      else months[key].income += t.amount;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([m, v]) => ({
        month: new Date(m + '-01').toLocaleDateString('en', { month: 'short' }),
        Expenses: Math.round(v.expense),
        Income: Math.round(v.income),
      }));
  }, [transactions]);

  const donutData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [transactions]);

  const totalDonut = donutData.reduce((s, d) => s + d.value, 0);

  const COLORS = [
    'hsl(150, 14%, 22%)',
    'hsl(150, 12%, 32%)',
    'hsl(25, 30%, 50%)',
    'hsl(36, 14%, 62%)',
    'hsl(36, 12%, 48%)',
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs animate-in fade-in zoom-in duration-200">
        <p className="font-semibold text-card-foreground mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
            <span>{p.dataKey}:</span>
            <span className="font-semibold">₹{p.value.toLocaleString('en-IN')}</span>
          </p>
        ))}
      </div>
    );
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    const pct = totalDonut > 0 ? ((d.value / totalDonut) * 100).toFixed(1) : '0';
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs animate-in fade-in zoom-in duration-200">
        <p className="font-semibold text-card-foreground">{d.name}</p>
        <p className="text-muted-foreground">₹{d.value.toLocaleString('en-IN')} ({pct}%)</p>
      </div>
    );
  };

  const firstThreeInsights = insights.slice(0, 3);
  const lastThreeInsights = insights.slice(3, 6);

  return (
    <div className="space-y-6">
      {/* Full width header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Financial Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Track your spending patterns and insights</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <Activity size={12} />
            <span>Last 6 months</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1 - First Three Insights */}
        <div className="flex flex-col gap-4 animate-fade-up delay-200">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-destructive to-destructive/60 rounded-full" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Key Metrics</h3>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {firstThreeInsights.map((insight, idx) => (
              <div
                key={insight.id}
                className={`bg-gradient-to-br ${insight.gradient} bg-card rounded-2xl p-5 card-shadow transition-all duration-300 cursor-pointer border border-border/50 ${
                  hoveredInsight === insight.id ? 'scale-[1.02] shadow-xl border-border' : 'hover:scale-[1.01] hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredInsight(insight.id)}
                onMouseLeave={() => setHoveredInsight(null)}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl transition-opacity duration-300 ${
                        hoveredInsight === insight.id ? 'opacity-100' : 'opacity-0'
                      }`} />
                      <span className="relative w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-transform duration-300">
                        <insight.Icon size={18} />
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{insight.title}</span>
                  </div>
                  {insight.badge && (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${insight.badgeColor}`}>
                      {insight.badge}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-2">
                  <p className="text-2xl font-bold text-card-foreground tracking-tight">
                    {insight.value}
                  </p>
                  {insight.trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                      insight.trend > 0 ? 'bg-success/10 text-success' : insight.trend < 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                    }`}>
                      {insight.trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(insight.trend).toFixed(1)}%
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {insight.detail}
                </p>
                {insight.id === 'top-category' && stats.topCategory && (
                  <div className="mt-4 animate-in slide-in-from-left duration-500">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Percentage of total expenses</span>
                      <span>{Math.min((stats.topCategory.amount / stats.thisMonthExpenses) * 100, 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-destructive to-destructive/60 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((stats.topCategory.amount / stats.thisMonthExpenses) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {insight.id === 'average-expense' && (
                  <div className="mt-4 animate-in slide-in-from-left duration-500">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Compared to current month</span>
                      <span className={averageMonthlyExpense > stats.thisMonthExpenses ? 'text-success' : 'text-warning'}>
                        {averageMonthlyExpense > stats.thisMonthExpenses ? '↓ Lower' : '↑ Higher'}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((stats.thisMonthExpenses / averageMonthlyExpense) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 - Both Graphs */}
        <div className="flex flex-col gap-4 animate-fade-up delay-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-[hsl(150,14%,28%)] to-[hsl(25,30%,50%)] rounded-full" />
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Analytics</h3>
            </div>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {/* Line Chart */}
            <div className="bg-card rounded-2xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Income vs Expenses Trend</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(150,14%,28%)]" />
                        <span className="text-muted-foreground">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[hsl(25,30%,50%)]" />
                        <span className="text-muted-foreground">Expenses</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedChart(expandedChart === 'line' ? null : 'line')}
                      className="p-1.5 rounded-lg hover:bg-muted transition-all duration-200"
                      title={expandedChart === 'line' ? "Collapse" : "Expand"}
                    >
                      {expandedChart === 'line' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={formatCurrency} 
                        width={50}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="Income" 
                        stroke="hsl(150, 14%, 28%)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: 'hsl(150, 14%, 28%)' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Expenses" 
                        stroke="hsl(25, 30%, 50%)" 
                        strokeWidth={2.5} 
                        dot={{ r: 3, fill: 'hsl(25, 30%, 50%)' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationBegin={300}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Donut Chart */}
            <div className="bg-card rounded-2xl card-shadow border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChartIcon size={16} className="text-muted-foreground" />
                    <p className="text-sm font-semibold text-foreground">Expenses by Category</p>
                  </div>
                  <button
                    onClick={() => setExpandedChart(expandedChart === 'pie' ? null : 'pie')}
                    className="p-1.5 rounded-lg hover:bg-muted transition-all duration-200"
                    title={expandedChart === 'pie' ? "Collapse" : "Expand"}
                  >
                    {expandedChart === 'pie' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>
              <div className="p-2">
                {donutData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
                    <div className="w-44 h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={donutData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={50} 
                            outerRadius={75} 
                            paddingAngle={3} 
                            dataKey="value" 
                            stroke="none"
                            isAnimationActive={true}
                            animationDuration={1000}
                          >
                            {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 grid grid-cols-1 gap-2">
                      {donutData.map((d, i) => (
                        <div 
                          key={d.name} 
                          className="group flex items-center justify-between gap-2 text-xs p-2 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full transition-transform group-hover:scale-125" style={{ background: COLORS[i] }} />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                              {d.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-card-foreground font-semibold text-xs">
                              {totalDonut > 0 ? ((d.value / totalDonut) * 100).toFixed(1) : 0}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">{formatCurrency(d.value)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                    No expense data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3 - Last Three Insights */}
        <div className="flex flex-col gap-2 animate-fade-up delay-400">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-success to-success/60 rounded-full" />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Recommendations</h3>
          </div>
          <div className="flex flex-col gap-4 flex-1">
            {lastThreeInsights.map((insight, idx) => (
              <div
                key={insight.id}
                className={`bg-gradient-to-br ${insight.gradient} bg-card rounded-2xl p-5 card-shadow transition-all duration-300 cursor-pointer border border-border/50 ${
                  hoveredInsight === insight.id ? 'scale-[1.02] shadow-xl border-border' : 'hover:scale-[1.01] hover:shadow-lg'
                }`}
                onMouseEnter={() => setHoveredInsight(insight.id)}
                onMouseLeave={() => setHoveredInsight(null)}
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-xl transition-opacity duration-300 ${
                        hoveredInsight === insight.id ? 'opacity-100' : 'opacity-0'
                      }`} />
                      <span className="relative w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground transition-transform duration-300">
                        <insight.Icon size={18} />
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{insight.title}</span>
                  </div>
                  {insight.badge && (
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${insight.badgeColor}`}>
                      {insight.badge}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-card-foreground mt-4 tracking-tight">
                  {insight.value}
                </p>
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                  {insight.detail}
                </p>
                {insight.id === 'savings' && stats.savingsRate > 0 && (
                  <div className="mt-4 animate-in slide-in-from-right duration-500">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5">
                      <span>Savings Progress</span>
                      <span className="font-semibold text-success">{stats.savingsRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-success to-success/60 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(stats.savingsRate, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1.5">
                      <span>0%</span>
                      <span>Target: 20%</span>
                      <span>100%</span>
                    </div>
                    {stats.savingsRate < 20 && (
                      <p className="text-[10px] text-warning mt-2 flex items-center gap-1">
                        💡 Tip: Try to save at least 20% of your income
                      </p>
                    )}
                  </div>
                )}
                {insight.id === 'highest-day' && highestExpenseDay.amount > 0 && (
                  <div className="mt-4 animate-in slide-in-from-right duration-500">
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <AlertCircle size={12} className="text-warning" />
                      <span>Consider reviewing expenses on this day</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 flex items-center justify-center p-4"
          onClick={() => setExpandedChart(null)}
        >
          <div 
            className="bg-card rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {expandedChart === 'line' ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Income vs Expenses Trend</h3>
                    <p className="text-sm text-muted-foreground mt-1">Detailed view of your financial trends over time</p>
                  </div>
                  <button
                    onClick={() => setExpandedChart(null)}
                    className="p-2 rounded-lg hover:bg-muted transition-all"
                  >
                    <Minimize2 size={20} />
                  </button>
                </div>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false} 
                        tickFormatter={formatCurrency} 
                        width={60}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="Income" 
                        stroke="hsl(150, 14%, 28%)" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: 'hsl(150, 14%, 28%)' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Expenses" 
                        stroke="hsl(25, 30%, 50%)" 
                        strokeWidth={3} 
                        dot={{ r: 5, fill: 'hsl(25, 30%, 50%)' }}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Expenses by Category</h3>
                    <p className="text-sm text-muted-foreground mt-1">Detailed breakdown of your spending by category</p>
                  </div>
                  <button
                    onClick={() => setExpandedChart(null)}
                    className="p-2 rounded-lg hover:bg-muted transition-all"
                  >
                    <Minimize2 size={20} />
                  </button>
                </div>
                <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
                  <div className="w-80 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={donutData} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={80} 
                          outerRadius={120} 
                          paddingAngle={3} 
                          dataKey="value" 
                          stroke="none"
                          isAnimationActive={true}
                          animationDuration={1000}
                        >
                          {donutData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-3 max-w-md">
                    {donutData.map((d, i) => (
                      <div 
                        key={d.name} 
                        className="flex items-center justify-between gap-3 text-sm p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                          <span className="text-foreground font-medium">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-card-foreground font-bold">{totalDonut > 0 ? ((d.value / totalDonut) * 100).toFixed(1) : 0}%</span>
                          <span className="text-muted-foreground text-xs">{formatCurrency(d.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}