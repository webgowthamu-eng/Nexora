import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Download, 
  Plus, 
  ArrowRight, 
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Job, BusinessSettings, CustomerSummary } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface CustomersViewProps {
  jobs: Job[];
  settings: BusinessSettings;
  onFilterJobsByCustomer: (customerName: string, phone: string) => void;
  onNewJobForCustomer: (customerName: string, phone: string) => void;
  onSelectCustomer: (customerName: string, phone: string) => void;
  onExportCSV: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  jobs,
  settings,
  onFilterJobsByCustomer,
  onNewJobForCustomer,
  onSelectCustomer,
  onExportCSV
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const customerSummaries = useMemo(() => {
    const map = new Map<string, {
      name: string;
      phone: string;
      jobs: Job[];
      totalValue: number;
      totalPaid: number;
    }>();

    jobs.forEach(job => {
      const key = (job.phone || job.customer).trim().toLowerCase();
      if (!key) return;

      let entry = map.get(key);
      if (!entry) {
        entry = {
          name: job.customer,
          phone: job.phone,
          jobs: [],
          totalValue: 0,
          totalPaid: 0
        };
        map.set(key, entry);
      }

      entry.jobs.push(job);
      if (job.status !== 'Cancelled') {
        entry.totalValue += job.price;
        entry.totalPaid += job.paid;
      }
      if (!entry.phone && job.phone) {
        entry.phone = job.phone;
      }
    });

    return Array.from(map.values())
      .map(item => ({
        name: item.name || 'Unnamed Customer',
        phone: item.phone,
        jobsCount: item.jobs.length,
        totalValue: item.totalValue,
        totalPaid: item.totalPaid,
        balanceDue: Math.max(0, item.totalValue - item.totalPaid),
        lastJobDate: item.jobs.reduce((latest, j) => (j.date > latest ? j.date : latest), '')
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [jobs]);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return customerSummaries;
    return customerSummaries.filter(c => 
      c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    );
  }, [customerSummaries, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Relationships
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Customers
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            A customer directory aggregated automatically from your recorded jobs.
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)]">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search customers by name or phone number…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none transition-all"
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
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface2)] text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Total Jobs</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance Due</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-xs">
                {filteredCustomers.map(cust => (
                  <tr
                    key={cust.name + cust.phone}
                    className="hover:bg-[var(--surface2)]/60 transition-colors group"
                  >
                    {/* Customer Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div 
                        onClick={() => onSelectCustomer(cust.name, cust.phone)}
                        className="flex items-center gap-3 cursor-pointer group/cust"
                      >
                        <div className="w-9 h-9 rounded-xl bg-[var(--surface2)] border border-[var(--border)] group-hover/cust:border-[var(--accent)] flex items-center justify-center text-[var(--accent)] font-bold text-xs transition-colors">
                          {cust.name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-[var(--text)] group-hover/cust:text-[var(--accent)] transition-colors">
                            {cust.name}
                          </div>
                          {cust.lastJobDate && (
                            <div className="text-[10px] text-[var(--muted)]">
                              Latest job: {formatDate(cust.lastJobDate, settings.dateFormat)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.phone ? (
                        <a
                          href={`tel:${cust.phone}`}
                          className="inline-flex items-center gap-1.5 text-[var(--accent)] font-semibold hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{cust.phone}</span>
                        </a>
                      ) : (
                        <span className="text-[var(--muted)]">—</span>
                      )}
                    </td>

                    {/* Total Jobs */}
                    <td className="py-3.5 px-4 font-semibold text-[var(--text)] whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface2)] border border-[var(--border)] font-bold">
                        {cust.jobsCount} {cust.jobsCount === 1 ? 'job' : 'jobs'}
                      </span>
                    </td>

                    {/* Total Value */}
                    <td className="py-3.5 px-4 font-bold text-[var(--text)] whitespace-nowrap">
                      {formatCurrency(cust.totalValue, settings.currency)}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {formatCurrency(cust.totalPaid, settings.currency)}
                    </td>

                    {/* Balance Due */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {cust.balanceDue > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          {formatCurrency(cust.balanceDue, settings.currency)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCustomer(cust.name, cust.phone)}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
                          title="View customer profile & job dossier"
                        >
                          Dossier
                        </button>
                        <button
                          onClick={() => onNewJobForCustomer(cust.name, cust.phone)}
                          className="px-2.5 py-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
                          title="Create new job for this customer"
                        >
                          + New Job
                        </button>
                        <button
                          onClick={() => onFilterJobsByCustomer(cust.name, cust.phone)}
                          className="px-3 py-1.5 rounded-lg bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] text-xs font-bold hover:opacity-90 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <span>Jobs</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface2)] flex items-center justify-center text-[var(--muted)] mx-auto mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-[var(--text)]">No customers found</h4>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
              Customers are generated automatically when you create jobs. Add your first job to see customers here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
