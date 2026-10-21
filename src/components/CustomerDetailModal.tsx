import React from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  FileText, 
  Plus, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  MessageCircle,
  Receipt
} from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface CustomerDetailModalProps {
  isOpen: boolean;
  customerName: string;
  customerPhone: string;
  jobs: Job[];
  settings: BusinessSettings;
  onClose: () => void;
  onNewJob: (name: string, phone: string) => void;
  onViewInvoice: (job: Job) => void;
  onRecordPayment: (job: Job) => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  isOpen,
  customerName,
  customerPhone,
  jobs,
  settings,
  onClose,
  onNewJob,
  onViewInvoice,
  onRecordPayment
}) => {
  if (!isOpen || !customerName) return null;

  const customerJobs = jobs.filter(j => 
    (j.phone && customerPhone && j.phone.trim() === customerPhone.trim()) ||
    j.customer.trim().toLowerCase() === customerName.trim().toLowerCase()
  );

  const totalValue = customerJobs
    .filter(j => j.status !== 'Cancelled')
    .reduce((sum, j) => sum + j.price, 0);

  const totalPaid = customerJobs
    .filter(j => j.status !== 'Cancelled')
    .reduce((sum, j) => sum + j.paid, 0);

  const balanceDue = Math.max(0, totalValue - totalPaid);
  const cleanPhone = customerPhone.replace(/[^0-9]/g, '');

  const whatsAppText = encodeURIComponent(
    `Hello ${customerName}, this is ${settings.businessName || 'Nexora'}. ` +
    (balanceDue > 0
      ? `We have an active balance of ${formatCurrency(balanceDue, settings.currency)} for your recent service. Please let us know if you have any questions!`
      : `Thank you for your business! Your account is completely settled. Have a wonderful day!`)
  );

  const whatsAppUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${whatsAppText}` : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl relative my-auto overflow-hidden transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-[var(--surface2)] border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] font-extrabold text-base shadow-xs">
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent)]">
                Customer Dossier & History
              </div>
              <h3 className="text-lg font-extrabold text-[var(--text)]">
                {customerName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-[var(--border)] hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Quick Contact & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--border)] text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {customerPhone ? (
                <a
                  href={`tel:${customerPhone}`}
                  className="flex items-center gap-1.5 font-bold text-[var(--accent)] hover:underline"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{customerPhone}</span>
                </a>
              ) : (
                <span className="text-[var(--muted)]">No phone recorded</span>
              )}

              {whatsAppUrl && (
                <a
                  href={whatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send WhatsApp</span>
                </a>
              )}
            </div>

            <button
              onClick={() => {
                onClose();
                onNewJob(customerName, customerPhone);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--navy)] text-white text-xs font-bold hover:bg-[#1a3860] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>New Job</span>
            </button>
          </div>

          {/* Customer Financial KPI Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase">
                Lifetime Value
              </div>
              <div className="text-base sm:text-lg font-black text-[var(--text)] mt-1 truncate">
                {formatCurrency(totalValue, settings.currency)}
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                {customerJobs.length} total orders
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase">
                Total Paid
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                {formatCurrency(totalPaid, settings.currency)}
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                Verified collections
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <div className="text-[10px] font-bold text-[var(--muted)] uppercase">
                Balance Due
              </div>
              <div className={`text-base sm:text-lg font-black mt-1 truncate ${
                balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatCurrency(balanceDue, settings.currency)}
              </div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">
                {balanceDue > 0 ? 'Pending collection' : 'Fully settled'}
              </div>
            </div>
          </div>

          {/* Job Timeline & History Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text)]">
              <span>Job History ({customerJobs.length})</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">
                Click invoice icon to generate bill
              </span>
            </div>

            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              {customerJobs.length > 0 ? (
                <div className="divide-y divide-[var(--border)] text-xs">
                  {customerJobs.map(job => (
                    <div 
                      key={job.id} 
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[var(--surface2)]/60 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-sm text-[var(--text)]">
                          {job.service}
                        </div>
                        <div className="text-[11px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] bg-[var(--surface2)] px-1 rounded border border-[var(--border)]">
                            {job.id}
                          </span>
                          <span>•</span>
                          <span>{formatDate(job.date, settings.dateFormat)}</span>
                          <span>•</span>
                          <span className={`font-semibold ${
                            job.status === 'Completed' ? 'text-emerald-600' :
                            job.status === 'In Progress' ? 'text-amber-600' : 'text-slate-500'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-extrabold text-[var(--text)]">
                            {formatCurrency(job.price, settings.currency)}
                          </div>
                          <div className="text-[10px]">
                            {job.price <= job.paid ? (
                              <span className="text-emerald-600 font-semibold">Paid in full</span>
                            ) : (
                              <span className="text-rose-600 font-bold">
                                Due: {formatCurrency(job.price - job.paid, settings.currency)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {job.price > job.paid && (
                            <button
                              onClick={() => {
                                onClose();
                                onRecordPayment(job);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-bold text-[11px] cursor-pointer"
                              title="Record payment"
                            >
                              + Pay
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onClose();
                              onViewInvoice(job);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] font-semibold text-[11px] text-[var(--text)] flex items-center gap-1 cursor-pointer"
                            title="Generate Formal Invoice"
                          >
                            <Receipt className="w-3 h-3 text-[var(--accent)]" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-[var(--muted)]">
                  No jobs found for this customer.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
