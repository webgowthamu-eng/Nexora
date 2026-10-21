import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency, todayISO } from '../utils';

interface PaymentModalProps {
  isOpen: boolean;
  job: Job | null;
  settings: BusinessSettings;
  onClose: () => void;
  onSavePayment: (jobId: string, amount: number, note?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  job,
  settings,
  onClose,
  onSavePayment
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (job) {
      const remaining = Math.max(0, job.price - job.paid);
      setAmount(remaining > 0 ? String(remaining) : '');
      setNote('');
      setError(null);
    }
  }, [job, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !job) return null;

  const remaining = Math.max(0, job.price - job.paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Enter a payment amount greater than zero.');
      return;
    }

    if (numAmount > remaining) {
      if (!window.confirm(`Payment of ${formatCurrency(numAmount, settings.currency)} exceeds outstanding balance of ${formatCurrency(remaining, settings.currency)}. Proceed anyway?`)) {
        return;
      }
    }

    onSavePayment(job.id, numAmount, note.trim() || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
          <h3 className="text-base font-bold text-[var(--text)]">
            Record payment
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Job summary card */}
        <div className="p-3.5 rounded-xl bg-[var(--surface2)] border border-[var(--border)] mb-4 text-xs space-y-1">
          <div className="font-bold text-sm text-[var(--text)]">
            {job.customer}
          </div>
          <div className="text-[var(--muted)] truncate">
            {job.service} • {job.id}
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]/70 text-xs">
            <span className="text-[var(--muted)]">Remaining balance:</span>
            <strong className="text-rose-600 dark:text-rose-400 font-extrabold">
              {formatCurrency(remaining, settings.currency)}
            </strong>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1">
              Payment amount ({settings.currency}) *
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-sm font-extrabold text-[var(--text)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--muted)] mb-1">
              Payment note / reference (optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              maxLength={100}
              placeholder="e.g. Bank transfer, UPI ref #9821, Cash"
              className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
            />
          </div>

          {/* Quick settlement chips */}
          {remaining > 0 && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-[var(--muted)]">Quick:</span>
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[11px] font-semibold text-[var(--accent)]"
              >
                Pay Full ({formatCurrency(remaining, settings.currency)})
              </button>
              {remaining > 100 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.round(remaining / 2)))}
                  className="px-2.5 py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--text)]"
                >
                  Pay 50%
                </button>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface2)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Record payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
