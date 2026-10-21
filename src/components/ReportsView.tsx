import React, { useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Database, 
  Layers,
  PieChart,
  Calendar
} from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency } from '../utils';

interface ReportsViewProps {
  jobs: Job[];
  settings: BusinessSettings;
  onExportCSV: () => void;
  onBackupJSON: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  jobs,
  settings,
  onExportCSV,
  onBackupJSON
}) => {
  const activeJobs = jobs.filter(j => j.status !== 'Cancelled');
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const totalRevenue = jobs.reduce((sum, j) => sum + j.paid, 0);
  const totalOutstanding = activeJobs.reduce((sum, j) => sum + Math.max(0, j.price - j.paid), 0);
  const totalActiveValue = activeJobs.reduce((sum, j) => sum + j.price, 0);
  const averageJobValue = jobs.length > 0 ? totalActiveValue / Math.max(activeJobs.length, 1) : 0;
  const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;

  // Last 6 months job volume calculations
  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const year = d.getFullYear();
      const count = jobs.filter(j => (j.date || '').slice(0, 7) === key).length;
      const revenue = jobs
        .filter(j => (j.date || '').slice(0, 7) === key)
        .reduce((sum, j) => sum + j.paid, 0);

      months.push({ label, year, key, count, revenue });
    }
    const maxCount = Math.max(...months.map(m => m.count), 1);
    return { months, maxCount };
  }, [jobs]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Business Insights
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Reports & Analytics
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Review your recorded jobs, revenue velocity, and completion performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onBackupJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--surface2)] hover:bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>JSON backup</span>
          </button>
        </div>
      </div>

      {/* Reports Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Recorded revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Total verified receipts
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Outstanding</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Balance yet to collect
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Completed jobs</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight">
            {completedJobs}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            {completionRate}% of total jobs
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Average job value</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(averageJobValue, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Per active job contract
          </div>
        </div>
      </div>

      {/* Grid: 6 Months Chart & Business Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-[var(--text)]">Jobs created by month</h3>
                <p className="text-xs text-[var(--muted)]">Job creation trend over the last 6 months</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface2)] text-[var(--muted)]">
                Last 6 months
              </span>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-52 flex items-end gap-3 sm:gap-6 pt-6 pb-2 px-3 border-b border-[var(--border)]">
              {monthlyData.months.map(m => {
                const heightPercent = Math.max(6, (m.count / monthlyData.maxCount) * 100);
                return (
                  <div
                    key={m.key}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--navy)] text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                      {m.count} job(s) • {formatCurrency(m.revenue, settings.currency)}
                    </div>

                    <div className="text-[10px] font-bold text-[var(--muted)] mb-1 group-hover:text-[var(--accent)]">
                      {m.count}
                    </div>

                    <div
                      className="w-full max-w-[36px] bg-[var(--accent)] group-hover:bg-[#129bb3] rounded-t-lg transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />

                    <div className="text-[11px] font-semibold text-[var(--muted)] mt-2">
                      {m.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-3">
            <span>Monthly volume bar indicates new job intake</span>
            <span className="font-semibold text-[var(--text)]">Peak: {monthlyData.maxCount} jobs</span>
          </div>
        </div>

        {/* Business Summary (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[var(--text)] mb-1">Business summary</h3>
            <p className="text-xs text-[var(--muted)] mb-4">Consolidated operational metrics</p>

            <div className="divide-y divide-[var(--border)] text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[var(--muted)]">Total jobs recorded</span>
                <strong className="text-[var(--text)]">{totalJobs}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[var(--muted)]">Active job contract value</span>
                <strong className="text-[var(--text)]">{formatCurrency(totalActiveValue, settings.currency)}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[var(--muted)]">Payments received</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRevenue, settings.currency)}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[var(--muted)]">Outstanding balance</span>
                <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(totalOutstanding, settings.currency)}</strong>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[var(--muted)]">Completion rate</span>
                <strong className="text-[var(--text)]">{completionRate}%</strong>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-[11px] text-[var(--muted)] leading-relaxed">
            Reports calculate job revenues and remaining balances in real time. Profit & loss can be tracked alongside manual expense inputs.
          </div>
        </div>
      </div>
    </div>
  );
};
