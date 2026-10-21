import React, { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, User, Phone, Briefcase, FileText, CheckCircle2 } from 'lucide-react';
import { Job, JobStatus, BusinessSettings } from '../types';
import { todayISO, formatCurrency } from '../utils';

interface JobModalProps {
  isOpen: boolean;
  jobToEdit: Job | null;
  defaultCustomer?: { name: string; phone: string };
  settings: BusinessSettings;
  onClose: () => void;
  onSave: (job: Job) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  jobToEdit,
  defaultCustomer,
  settings,
  onClose,
  onSave
}) => {
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState(todayISO());
  const [dueDate, setDueDate] = useState('');
  const [price, setPrice] = useState<string>('');
  const [paid, setPaid] = useState<string>('0');
  const [status, setStatus] = useState<JobStatus>('Pending');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (jobToEdit) {
      setCustomer(jobToEdit.customer || '');
      setPhone(jobToEdit.phone || '');
      setService(jobToEdit.service || '');
      setDate(jobToEdit.date || todayISO());
      setDueDate(jobToEdit.dueDate || '');
      setPrice(String(jobToEdit.price || ''));
      setPaid(String(jobToEdit.paid || '0'));
      setStatus(jobToEdit.status || 'Pending');
      setNotes(jobToEdit.notes || '');
    } else {
      setCustomer(defaultCustomer?.name || '');
      setPhone(defaultCustomer?.phone || '');
      setService('');
      setDate(todayISO());
      setDueDate('');
      setPrice('');
      setPaid('0');
      setStatus('Pending');
      setNotes('');
    }
    setError(null);
  }, [jobToEdit, defaultCustomer, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim() || !service.trim()) {
      setError('Please provide customer name and service title.');
      return;
    }

    const numPrice = Number(price);
    const numPaid = Number(paid) || 0;

    if (isNaN(numPrice) || numPrice < 0) {
      setError('Please enter a valid total price.');
      return;
    }

    if (numPaid > numPrice) {
      if (!window.confirm("Amount paid is higher than the job total. Save anyway?")) {
        return;
      }
    }

    const newJob: Job = {
      id: jobToEdit ? jobToEdit.id : `JOB-${Date.now().toString(36).toUpperCase()}`,
      customer: customer.trim(),
      phone: phone.trim(),
      service: service.trim(),
      price: numPrice,
      paid: numPaid,
      status,
      date: date || todayISO(),
      dueDate: dueDate || '',
      notes: notes.trim(),
      createdAt: jobToEdit?.createdAt || new Date().toISOString(),
      paymentHistory: jobToEdit?.paymentHistory || (numPaid > 0 ? [{
        amount: numPaid,
        date: new Date().toISOString(),
        note: 'Initial deposit'
      }] : [])
    };

    onSave(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">
              {jobToEdit ? 'Edit job' : 'Create new job'}
            </h3>
            <p className="text-xs text-[var(--muted)]">
              {jobToEdit ? `Updating ${jobToEdit.id}` : 'Fill in customer and job specifications'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer name */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Customer name *
              </label>
              <input
                type="text"
                required
                value={customer}
                onChange={e => setCustomer(e.target.value)}
                maxLength={100}
                placeholder="e.g. Ramesh Chandra"
                autoFocus
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                maxLength={25}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            {/* Service with Quick Presets */}
            <div className="sm:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[var(--muted)]">
                  Service / Job title *
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-[var(--muted)] pb-0.5">
                  <span className="font-semibold">Quick Presets:</span>
                  {[
                    { label: 'Web Setup', price: '25000' },
                    { label: 'Branding', price: '12000' },
                    { label: 'Repair & Fix', price: '4500' },
                    { label: 'Maintenance', price: '18000' }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setService(preset.label);
                        if (!price) setPrice(preset.price);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[var(--surface2)] hover:bg-[var(--accent2)] hover:text-[var(--navy)] dark:hover:text-[var(--accent)] border border-[var(--border)] transition-colors cursor-pointer"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                required
                value={service}
                onChange={e => setService(e.target.value)}
                maxLength={120}
                placeholder="e.g. Corporate Website Development & SEO"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            {/* Job date */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Job date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            {/* Due date */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Deadline / Due date (optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            {/* Total price */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Total price ({settings.currency}) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs font-bold text-[var(--text)] outline-none"
              />
            </div>

            {/* Amount paid */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Amount paid ({settings.currency})
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={paid}
                onChange={e => setPaid(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none"
              />
            </div>

            {/* Live Balance Calculation Pill */}
            {(Number(price) || 0) > 0 && (
              <div className="sm:col-span-2 p-2.5 rounded-xl bg-[var(--surface2)] border border-[var(--border)] flex items-center justify-between text-xs">
                <span className="text-[var(--muted)]">Calculated Balance to Settle:</span>
                <span className={`font-extrabold ${Math.max(0, (Number(price) || 0) - (Number(paid) || 0)) > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {formatCurrency(Math.max(0, (Number(price) || 0) - (Number(paid) || 0)), settings.currency)}
                  {Math.max(0, (Number(price) || 0) - (Number(paid) || 0)) <= 0 ? ' • Settled' : ' • Balance Due'}
                </span>
              </div>
            )}

            {/* Status */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Job status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as JobStatus)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:border-[var(--accent)] text-xs font-semibold text-[var(--text)] outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Notes & special instructions (optional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder="Details, parts needed, client notes, delivery instructions…"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none resize-none"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--text)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              {jobToEdit ? 'Save changes' : 'Create job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
