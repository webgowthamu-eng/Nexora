import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  CreditCard,
  Copy,
  Check
} from 'lucide-react';
import { Job, BusinessSettings } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface InvoiceModalProps {
  isOpen: boolean;
  job: Job | null;
  settings: BusinessSettings;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  job,
  settings,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !job) return null;

  const balanceDue = Math.max(0, job.price - job.paid);
  const isPaid = balanceDue <= 0;
  const invoiceNumber = `INV-${job.id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleCopySummary = () => {
    const text = `*INVOICE: ${invoiceNumber}*\n` +
      `Business: ${settings.businessName || 'Nexora'}\n` +
      `Customer: ${job.customer}\n` +
      `Service: ${job.service}\n` +
      `Total: ${formatCurrency(job.price, settings.currency)}\n` +
      `Paid: ${formatCurrency(job.paid, settings.currency)}\n` +
      `Balance Due: ${formatCurrency(balanceDue, settings.currency)}\n` +
      `Status: ${isPaid ? 'PAID IN FULL' : 'PENDING'}\n` +
      `Date: ${formatDate(job.date, settings.dateFormat)}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl relative my-auto overflow-hidden transition-all print:border-none print:shadow-none print:m-0 print:max-w-none print:w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-[var(--surface2)] border-b border-[var(--border)] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              Formal Document Preview
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
              isPaid 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              {isPaid ? 'PAID IN FULL' : 'BALANCE DUE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--text)] flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy text summary for WhatsApp / SMS"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--muted)]" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-[var(--border)] hover:bg-[var(--surface2)] text-[var(--muted)] hover:text-[var(--text)] flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Formal Invoice Document */}
        <div className="p-6 sm:p-10 space-y-7 bg-white text-slate-800 dark:bg-[#131f31] dark:text-slate-100 print:bg-white print:text-black print:p-0">
          
          {/* Header Row: Business Identity & Document Type */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-700 pb-6 print:border-slate-300">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10233f] to-[#17506c] flex items-center justify-center text-[var(--accent)] font-black text-xl shadow-xs">
                  L
                </div>
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight leading-tight">
                    {settings.businessName || 'Nexora Business Studio'}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Official Invoice & Service Voucher
                  </p>
                </div>
              </div>

              {/* Business Contact details */}
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5 mt-2">
                {settings.businessPhone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{settings.businessPhone}</span>
                  </div>
                )}
                {settings.businessEmail && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span>{settings.businessEmail}</span>
                  </div>
                )}
                {settings.businessAddress && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{settings.businessAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Document Details Box */}
            <div className="sm:text-right space-y-1">
              <div className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white print:text-black">
                TAX INVOICE
              </div>
              <div className="font-mono text-xs font-bold text-[var(--accent)]">
                {invoiceNumber}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Issue Date: <strong className="text-slate-700 dark:text-slate-200">{formatDate(job.date, settings.dateFormat)}</strong>
              </div>
              {job.dueDate && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Payment Due: <strong className="text-amber-600 dark:text-amber-400">{formatDate(job.dueDate, settings.dateFormat)}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Billed To / Client Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 print:bg-slate-50 print:border-slate-200">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Billed To Customer
              </div>
              <div className="text-base font-bold text-slate-900 dark:text-white print:text-black">
                {job.customer || 'Valued Customer'}
              </div>
              {job.phone && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Contact: {job.phone}
                </div>
              )}
            </div>

            <div className="sm:text-right">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Job Reference
              </div>
              <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                ID: {job.id}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Status: <strong className="uppercase">{job.status}</strong>
              </div>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden print:border-slate-300">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">#</th>
                  <th className="py-2.5 px-4">Service Description</th>
                  <th className="py-2.5 px-4 text-center">Qty / Term</th>
                  <th className="py-2.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                <tr>
                  <td className="py-3 px-4 text-center font-bold text-slate-400">01</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white print:text-black">
                      {job.service}
                    </div>
                    {job.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                        {job.notes}
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                    1 Job
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-sm text-slate-900 dark:text-white print:text-black">
                    {formatCurrency(job.price, settings.currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Settlement Calculation */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            {/* Payment history notes */}
            <div className="sm:max-w-xs space-y-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Schedule & Receipts
              </div>
              {job.paymentHistory && job.paymentHistory.length > 0 ? (
                <div className="space-y-1">
                  {job.paymentHistory.map((ph, idx) => (
                    <div key={idx} className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between border-b border-dashed border-slate-200 dark:border-slate-700 py-0.5">
                      <span>• {formatDate(ph.date.slice(0, 10), settings.dateFormat)} ({ph.note || 'Payment'})</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(ph.amount, settings.currency)}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic">
                  No installment breakdown recorded.
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(job.price, settings.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                <span>Total Tax (0%):</span>
                <span className="font-semibold">{formatCurrency(0, settings.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-900 dark:text-white print:text-black">
                <span>Grand Total:</span>
                <span>{formatCurrency(job.price, settings.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Amount Received:</span>
                <span>{formatCurrency(job.paid, settings.currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-slate-900 dark:border-white font-black text-sm text-slate-900 dark:text-white print:text-black">
                <span>Balance Due:</span>
                <span className={balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                  {formatCurrency(balanceDue, settings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Signature Section */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-end justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                Thank you for your business!
              </div>
              <p className="text-[11px] max-w-sm leading-relaxed">
                Please retain this invoice voucher for warranty and service maintenance records. For inquiries, contact {settings.businessPhone || settings.businessEmail || 'our support desk'}.
              </p>
            </div>

            <div className="text-center sm:text-right w-44">
              <div className="border-b border-slate-400 dark:border-slate-500 pb-1 mb-1 font-signature text-sm italic text-slate-700 dark:text-slate-300">
                {settings.businessName || 'Nexora Authorized'}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Authorized Signatory
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
