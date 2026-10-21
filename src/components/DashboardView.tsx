import React from 'react';
import { 
  FileText, 
  Clock, 
  IndianRupee, 
  DollarSign, 
  AlertCircle, 
  Download, 
  Plus, 
  ArrowRight,
  TrendingUp,
  CreditCard,
  Users,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Receipt,
  Percent,
  Sparkles
} from 'lucide-react';
import { Job, BusinessSettings, NavPage, JobStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface DashboardViewProps {
  jobs: Job[];
  settings: BusinessSettings;
  onNavigate: (page: NavPage) => void;
  onNewJob: () => void;
  onExportCSV: () => void;
  onSelectJob: (job: Job) => void;
  onViewInvoice: (job: Job) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  settings,
  onNavigate,
  onNewJob,
  onExportCSV,
  onSelectJob,
  onViewInvoice
}) => {
  const activeJobs = jobs.filter(j => j.status !== 'Cancelled');
  const totalJobs = jobs.length;
  const pendingJobs = jobs.filter(j => j.status === 'Pending' || j.status === 'In Progress').length;
  const completedJobs = jobs.filter(j => j.status === 'Completed').length;
  const totalReceived = jobs.reduce((sum, j) => sum + j.paid, 0);
  const totalDue = activeJobs.reduce((sum, j) => sum + Math.max(0, j.price - j.paid), 0);
  const unpaidCount = activeJobs.filter(j => (j.price - j.paid) > 0).length;

  const sortedRecent = [...jobs]
    .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date))
    .slice(0, 5);

  const statuses: JobStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Overview
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            {settings.businessName && settings.businessName !== 'Nexora'
              ? `Welcome to ${settings.businessName}`
              : 'Your business at a glance'}
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Track jobs, customers and payments in one synchronized place.
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
            onClick={onNewJob}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[var(--accent)]" />
            <span>Add new job</span>
          </button>
        </div>
      </div>

      {/* Executive KPI Highlights Bar */}
      <div className="p-3 sm:p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold text-[var(--text)]">Financial Velocity:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            {((totalReceived + totalDue) > 0 ? Math.round((totalReceived / (totalReceived + totalDue)) * 100) : 100)}% Collection Efficiency
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 text-[var(--muted)] flex-wrap text-[11px] sm:text-xs">
          <div>
            Avg Ticket: <strong className="text-[var(--text)]">{formatCurrency(activeJobs.length > 0 ? activeJobs.reduce((s, j) => s + j.price, 0) / activeJobs.length : 0, settings.currency)}</strong>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div>
            Active Pipeline: <strong className="text-[var(--text)]">{formatCurrency(activeJobs.reduce((s, j) => s + j.price, 0), settings.currency)}</strong>
          </div>
          <span className="hidden sm:inline opacity-40">•</span>
          <div>
            Settled Rate: <strong className="text-[var(--text)]">{totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%</strong>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total jobs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Total jobs</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight">
            {totalJobs}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            All recorded customer jobs
          </div>
        </div>

        {/* Pending work */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Pending work</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight text-amber-600 dark:text-amber-400">
            {pendingJobs}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            In queue & currently active
          </div>
        </div>

        {/* Payments received */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Payments received</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight text-emerald-600 dark:text-emerald-400 truncate">
            {formatCurrency(totalReceived, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Total verified customer receipts
          </div>
        </div>

        {/* Outstanding balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Outstanding balance</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight text-rose-600 dark:text-rose-400 truncate">
            {formatCurrency(totalDue, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            {unpaidCount} job(s) with balance due
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Jobs + Job Status / Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Jobs column (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-[var(--text)]">Recent jobs</h3>
              <p className="text-xs text-[var(--muted)]">Latest customer requests and updates</p>
            </div>
            <button
              onClick={() => onNavigate('jobs')}
              className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {sortedRecent.length > 0 ? (
            <div className="space-y-2.5">
              {sortedRecent.map(job => (
                <div
                  key={job.id}
                  onClick={() => onSelectJob(job)}
                  className="p-3.5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)] hover:bg-[var(--surface2)] flex items-center justify-between gap-3 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] font-bold text-sm flex-shrink-0 group-hover:scale-105 transition-transform">
                      {(job.customer || '?').trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--text)] truncate">
                        {job.customer || 'Unnamed customer'}
                      </h4>
                      <div className="text-xs text-[var(--muted)] truncate flex items-center gap-1.5 mt-0.5">
                        <span className="font-medium text-[var(--text)] opacity-85 truncate">
                          {job.service || 'General Service'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{job.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-xs sm:text-sm text-[var(--text)]">
                      {formatCurrency(job.price, settings.currency)}
                    </div>
                    <div className="mt-1 flex items-center justify-end gap-1.5">
                      {getStatusBadge(job.status)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewInvoice(job);
                        }}
                        className="p-1 rounded-lg border border-[var(--border)] hover:bg-[var(--accent2)] text-[var(--muted)] hover:text-[var(--navy)] dark:hover:text-[var(--accent)] transition-colors cursor-pointer"
                        title="View Formal Invoice"
                      >
                        <Receipt className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-[var(--border)] rounded-xl">
              <p className="font-bold text-sm text-[var(--text)]">No jobs recorded yet</p>
              <p className="text-xs text-[var(--muted)] mt-1 mb-3">
                Add your first job to start tracking workflow and payments.
              </p>
              <button
                onClick={onNewJob}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--navy)] text-white text-xs font-semibold"
              >
                Create Job
              </button>
            </div>
          )}
        </div>

        {/* Right column: Status Breakdown & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Status Breakdown */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-[var(--text)]">Job Status</h3>
              <span className="text-xs text-[var(--muted)]">Current workload</span>
            </div>

            <div className="space-y-3.5">
              {statuses.map(st => {
                const count = jobs.filter(j => j.status === st).length;
                const percent = totalJobs > 0 ? Math.round((count / totalJobs) * 100) : 0;
                let barColor = 'bg-[var(--accent)]';
                if (st === 'Completed') barColor = 'bg-emerald-500';
                if (st === 'In Progress') barColor = 'bg-amber-500';
                if (st === 'Cancelled') barColor = 'bg-rose-400';

                return (
                  <div key={st}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-[var(--text)]">{st}</span>
                      <span className="font-bold text-[var(--muted)]">
                        {count} <span className="opacity-70 font-normal">({percent}%)</span>
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--surface2)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
            <h3 className="font-bold text-base text-[var(--text)] mb-3">Quick actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onNewJob}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] hover:border-[var(--accent)] text-left transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-[var(--accent2)] text-[var(--navy)] flex items-center justify-center font-bold text-base mb-2 group-hover:scale-110 transition-transform">
                  +
                </div>
                <div className="font-bold text-xs text-[var(--text)]">Create job</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Add customer job</div>
              </button>

              <button
                onClick={() => onNavigate('payments')}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] hover:border-[var(--accent)] text-left transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-xs text-[var(--text)]">Payments</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Review balances</div>
              </button>

              <button
                onClick={() => onNavigate('customers')}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] hover:border-[var(--accent)] text-left transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-xs text-[var(--text)]">Customers</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Customer directory</div>
              </button>

              <button
                onClick={() => onNavigate('settings')}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] hover:border-[var(--accent)] text-left transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs mb-2 group-hover:scale-110 transition-transform">
                  <SettingsIcon className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-xs text-[var(--text)]">Settings</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Personalise app</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
