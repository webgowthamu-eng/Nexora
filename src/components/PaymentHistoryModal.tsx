import React from 'react';
import { X, Calendar, History, Receipt } from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface PaymentHistoryModalProps {
  isOpen: boolean;
  job: Job | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  job,
  settings,
  onClose
}) => {
  if (!isOpen || !job) return null;

  const history = job.paymentHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-base font-bold text-[var(--text)]">Payment history</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--border)] mb-4 text-xs">
          <div className="font-bold text-sm text-[var(--text)]">{job.customer}</div>
          <div className="text-[var(--muted)]">{job.service} • {job.id}</div>
          <div className="mt-2 pt-2 border-t border-[var(--border)] flex justify-between font-bold">
            <span>Total collected:</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatCurrency(job.paid, settings.currency)} of {formatCurrency(job.price, settings.currency)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {history.length > 0 ? (
            history.map((record, index) => (
              <div 
                key={index}
                className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrency(record.amount, settings.currency)}
                  </div>
                  {record.note && (
                    <div className="text-[11px] text-[var(--muted)] mt-0.5">
                      {record.note}
                    </div>
                  )}
                </div>
                <div className="text-[10px] text-[var(--muted)] text-right">
                  {new Date(record.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-[var(--muted)]">
              No installment history recorded for this job.
            </div>
          )}
        </div>

        <div className="pt-4 mt-2 border-t border-[var(--border)] text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[var(--surface2)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface)] border border-[var(--border)] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
