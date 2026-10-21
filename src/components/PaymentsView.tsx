import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Plus, 
  Search, 
  History, 
  Clock,
  Receipt
} from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface PaymentsViewProps {
  jobs: Job[];
  settings: BusinessSettings;
  onRecordPayment: (job: Job) => void;
  onViewHistory: (job: Job) => void;
  onViewInvoice: (job: Job) => void;
  onExportCSV: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  jobs,
  settings,
  onRecordPayment,
  onViewHistory,
  onViewInvoice,
  onExportCSV
}) => {
  const [filterType, setFilterType] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const activeJobs = jobs.filter(j => j.status !== 'Cancelled');
  const totalRevenue = jobs.reduce((sum, j) => sum + j.paid, 0);
  const totalOutstanding = activeJobs.reduce((sum, j) => sum + Math.max(0, j.price - j.paid), 0);
  const unpaidJobsCount = activeJobs.filter(j => (j.price - j.paid) > 0).length;
  const activeValue = activeJobs.reduce((sum, j) => sum + j.price, 0);

  const displayedJobs = useMemo(() => {
    return activeJobs
      .filter(j => {
        if (filterType === 'unpaid') return j.price - j.paid > 0;
        if (filterType === 'paid') return j.price - j.paid <= 0;
        return true;
      })
      .filter(j => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return true;
        return [j.customer, j.service, j.id].some(val =>
          String(val || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => (b.price - b.paid) - (a.price - a.paid));
  }, [activeJobs, filterType, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Finance
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Payments
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Track collected customer payments, outstanding balances, and payment milestones.
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Payments received</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(totalRevenue, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Total recorded customer payments
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Outstanding balance</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(totalOutstanding, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Remaining balance yet to collect
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Jobs with balance</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight">
            {unpaidJobsCount}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Jobs with pending settlements
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
            <span>Active job value</span>
            <div className="w-8 h-8 rounded-xl bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-3 mb-1 tracking-tight truncate">
            {formatCurrency(activeValue, settings.currency)}
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            Excluding cancelled job records
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--surface2)] border border-[var(--border)] w-fit">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-[var(--surface)] text-[var(--text)] shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            All jobs ({activeJobs.length})
          </button>
          <button
            onClick={() => setFilterType('unpaid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'unpaid'
                ? 'bg-[var(--surface)] text-rose-600 shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Pending balance ({unpaidJobsCount})
          </button>
          <button
            onClick={() => setFilterType('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'paid'
                ? 'bg-[var(--surface)] text-emerald-600 shadow-xs'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            Fully settled ({activeJobs.length - unpaidJobsCount})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by customer or job…"
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] text-xs text-[var(--text)] outline-none"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
        {displayedJobs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-3 px-4">Customer / Job</th>
                  <th className="py-3 px-4">Contract Price</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4">Payment Progress</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {displayedJobs.map(job => {
                  const balance = Math.max(0, job.price - job.paid);
                  const isSettled = balance <= 0;
                  const percentPaid = job.price > 0 ? Math.min(100, Math.round((job.paid / job.price) * 100)) : 100;

                  return (
                    <tr key={job.id} className="hover:bg-[var(--surface2)]/60 transition-colors">
                      {/* Customer / Job */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[var(--text)]">
                          {job.customer}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                          <span>{job.service}</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] bg-[var(--surface2)] px-1.5 py-0.5 rounded border border-[var(--border)]">
                            {job.id}
                          </span>
                        </div>
                      </td>

                      {/* Contract Price */}
                      <td className="py-3.5 px-4 font-bold text-[var(--text)] whitespace-nowrap">
                        {formatCurrency(job.price, settings.currency)}
                      </td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatCurrency(job.paid, settings.currency)}
                      </td>

                      {/* Balance Due */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isSettled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        ) : (
                          <span className="font-extrabold text-rose-600 dark:text-rose-400">
                            {formatCurrency(balance, settings.currency)}
                          </span>
                        )}
                      </td>

                      {/* Progress Bar */}
                      <td className="py-3.5 px-4 w-44">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-[var(--muted)]">{percentPaid}%</span>
                          <span className="font-semibold text-[var(--text)]">
                            {formatCurrency(job.paid, settings.currency)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[var(--surface2)] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSettled ? 'bg-emerald-500' : 'bg-[var(--accent)]'
                            }`}
                            style={{ width: `${percentPaid}%` }}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewInvoice(job)}
                            className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--accent2)] text-[var(--muted)] hover:text-[var(--navy)] dark:hover:text-[var(--accent)] transition-colors cursor-pointer"
                            title="View Formal Invoice & Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                          {job.paymentHistory && job.paymentHistory.length > 0 && (
                            <button
                              onClick={() => onViewHistory(job)}
                              className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
                              title="View payment installments history"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onRecordPayment(job)}
                            disabled={isSettled}
                            className="px-3 py-1.5 rounded-lg bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3 h-3 text-[var(--accent)]" />
                            <span>Record payment</span>
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
            <CreditCard className="w-8 h-8 text-[var(--muted)] mx-auto mb-2" />
            <h4 className="font-bold text-sm text-[var(--text)]">No payment records found</h4>
            <p className="text-xs text-[var(--muted)] mt-1">
              {filterType === 'unpaid'
                ? 'All jobs are completely paid up! Great job!'
                : 'No jobs match your search criteria.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
