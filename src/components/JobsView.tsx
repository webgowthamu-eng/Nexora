import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit3, 
  CreditCard, 
  Trash2, 
  Phone, 
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Receipt,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { Job, BusinessSettings, JobStatus } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface JobsViewProps {
  jobs: Job[];
  settings: BusinessSettings;
  initialSearch?: string;
  onNewJob: () => void;
  onEditJob: (job: Job) => void;
  onRecordPayment: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
  onUpdateStatus: (jobId: string, newStatus: JobStatus) => void;
  onViewInvoice: (job: Job) => void;
  onExportCSV: () => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  settings,
  initialSearch = '',
  onNewJob,
  onEditJob,
  onRecordPayment,
  onDeleteJob,
  onUpdateStatus,
  onViewInvoice,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'due-desc'>('date-desc');

  const statuses: JobStatus[] = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        const q = searchTerm.toLowerCase().trim();
        const matchesQuery = !q || [
          job.customer,
          job.phone,
          job.service,
          job.id,
          job.notes
        ].some(val => String(val || '').toLowerCase().includes(q));

        return matchesStatus && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return (b.date || '').localeCompare(a.date || '');
        if (sortBy === 'date-asc') return (a.date || '').localeCompare(b.date || '');
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'due-desc') return (b.price - b.paid) - (a.price - a.paid);
        return 0;
      });
  }, [jobs, searchTerm, statusFilter, sortBy]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Work Management
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            All jobs
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Create, update and track every customer job and balance.
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
            <span>New job</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by customer, phone, service, job ID, or notes…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 outline-none text-xs text-[var(--text)] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-[var(--text)]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              aria-label="Filter jobs by status"
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:border-[var(--accent)] text-xs font-semibold text-[var(--text)] outline-none cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Sort order */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              aria-label="Sort jobs by"
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:border-[var(--accent)] text-xs font-semibold text-[var(--text)] outline-none cursor-pointer hidden sm:block"
            >
              <option value="date-desc">Newest date</option>
              <option value="date-asc">Oldest date</option>
              <option value="price-desc">Highest price</option>
              <option value="due-desc">Highest balance due</option>
            </select>
          </div>
        </div>

        {/* Count summary */}
        <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
          <span>
            Showing <strong className="text-[var(--text)]">{filteredJobs.length}</strong> of {jobs.length} jobs
          </span>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-[var(--accent)] font-semibold hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
        {filteredJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-3 px-4">Job / Customer</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {filteredJobs.map(job => {
                  const balance = Math.max(0, job.price - job.paid);
                  const isFullyPaid = balance <= 0;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-[var(--surface2)]/60 transition-colors group"
                    >
                      {/* Job / Customer */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--navy)] dark:group-hover:text-[var(--accent)] transition-colors">
                          {job.service || 'Service Job'}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                          <span className="font-semibold text-[var(--text)]">{job.customer}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] bg-[var(--surface2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                            {job.id}
                          </span>
                        </div>
                        {job.phone && (
                          <div className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-[var(--accent)]" />
                            <a href={`tel:${job.phone}`} className="hover:underline">
                              {job.phone}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[var(--muted)] whitespace-nowrap">
                        <div className="font-medium text-[var(--text)]">
                          {formatDate(job.date, settings.dateFormat)}
                        </div>
                        {job.dueDate && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {formatDate(job.dueDate, settings.dateFormat)}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-bold text-[var(--text)] whitespace-nowrap">
                        {formatCurrency(job.price, settings.currency)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                        {formatCurrency(job.paid, settings.currency)}
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid in full
                          </span>
                        ) : (
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(balance, settings.currency)}
                          </span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={job.status}
                          onChange={e => onUpdateStatus(job.id, e.target.value as JobStatus)}
                          aria-label={`Status for ${job.service || job.id}`}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border border-transparent outline-none cursor-pointer ${
                            job.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : job.status === 'In Progress'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : job.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {statuses.map(st => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewInvoice(job)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--accent2)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--navy)] dark:hover:text-[var(--accent)] transition-colors cursor-pointer"
                            title="Generate Tax Invoice / Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditJob(job)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                            title="Edit job"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRecordPayment(job)}
                            disabled={job.price <= job.paid}
                            className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Record payment"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Pay</span>
                          </button>
                          <button
                            onClick={() => onDeleteJob(job.id)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                            title="Delete job"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] flex items-center justify-center text-[var(--muted)] mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[var(--text)]">No matching jobs found</h4>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
              We couldn't find any job matching your current filters or query. Try adjusting your search term or add a new job.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)]"
              >
                Reset filters
              </button>
              <button
                onClick={onNewJob}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--navy)] text-white text-xs font-semibold"
              >
                Create new job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
