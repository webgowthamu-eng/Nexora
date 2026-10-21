import React, { useState } from 'react';
import { 
  Building2, 
  Moon, 
  Sun, 
  Coins, 
  Calendar, 
  ShieldCheck, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  Cloud, 
  CheckCircle2, 
  LogIn, 
  LogOut,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BusinessSettings, Job } from '../types';
import { firebaseConfig } from '../firebase';

interface SettingsViewProps {
  settings: BusinessSettings;
  jobs: Job[];
  user: User | null;
  onSaveSettings: (newSettings: BusinessSettings) => void;
  onBackupJSON: () => void;
  onRestoreJSON: (file: File) => void;
  onExportCSV: () => void;
  onClearAllJobs: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSyncToCloud: () => Promise<void>;
  isSyncing: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  jobs,
  user,
  onSaveSettings,
  onBackupJSON,
  onRestoreJSON,
  onExportCSV,
  onClearAllJobs,
  onOpenLogin,
  onLogout,
  onSyncToCloud,
  isSyncing
}) => {
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleManualSync = async () => {
    setSyncStatus('Syncing jobs to Firebase...');
    await onSyncToCloud();
    setSyncStatus('Sync completed successfully!');
    setTimeout(() => setSyncStatus(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-[11px] font-extrabold tracking-widest text-[var(--accent)] uppercase mb-1">
            Preferences
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            App settings
          </h2>
          <p className="text-sm text-[var(--muted)] mt-1">
            Customise business branding, currency, Firebase sync, and data backups.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Save settings</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 rounded-2xl bg-[var(--accent2)] border border-[var(--accent)]/20 text-xs text-[var(--navy)] dark:text-[var(--text)] flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
        <span>
          Your jobs and customer records are safely preserved across app restarts. Settings are saved separately.
        </span>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Business Profile */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text)]">Business profile</h3>
            <p className="text-xs text-[var(--muted)]">Displays on your workspace header & exports</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Business name
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={e => handleChange('businessName', e.target.value)}
                maxLength={80}
                placeholder="e.g. Nexora Creative Studio"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Business phone (optional)
              </label>
              <input
                type="tel"
                value={formData.businessPhone}
                onChange={e => handleChange('businessPhone', e.target.value)}
                maxLength={25}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Business email (optional)
              </label>
              <input
                type="email"
                value={formData.businessEmail}
                onChange={e => handleChange('businessEmail', e.target.value)}
                maxLength={100}
                placeholder="contact@business.com"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Business address (optional)
              </label>
              <textarea
                value={formData.businessAddress}
                onChange={e => handleChange('businessAddress', e.target.value)}
                maxLength={250}
                rows={2}
                placeholder="Street address, City, State"
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:bg-[var(--surface)] focus:border-[var(--accent)] text-xs text-[var(--text)] outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Panel 2: Appearance & Preferences */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text)]">Appearance & preferences</h3>
            <p className="text-xs text-[var(--muted)]">Theme, currency formatting, and safety alerts</p>
          </div>

          <div className="space-y-4">
            {/* Dark Mode toggle */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div>
                <div className="font-bold text-xs text-[var(--text)]">Dark mode</div>
                <div className="text-[11px] text-[var(--muted)]">Switch between light and dark themes</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.theme === 'dark'}
                  onChange={e => handleChange('theme', e.target.checked ? 'dark' : 'light')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:border-[var(--accent)] text-xs font-semibold text-[var(--text)] outline-none"
              >
                <option value="INR">Indian Rupee (₹ INR)</option>
                <option value="USD">US Dollar ($ USD)</option>
                <option value="GBP">British Pound (£ GBP)</option>
                <option value="EUR">Euro (€ EUR)</option>
                <option value="AED">UAE Dirham (AED)</option>
              </select>
            </div>

            {/* Date format */}
            <div>
              <label className="block text-xs font-bold text-[var(--muted)] mb-1">
                Date format
              </label>
              <select
                value={formData.dateFormat}
                onChange={e => handleChange('dateFormat', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface2)] focus:border-[var(--accent)] text-xs font-semibold text-[var(--text)] outline-none"
              >
                <option value="local">Local readable format (e.g. 20 Oct 2026)</option>
                <option value="dmy">DD/MM/YYYY</option>
                <option value="mdy">MM/DD/YYYY</option>
                <option value="ymd">YYYY-MM-DD</option>
              </select>
            </div>

            {/* Confirm before delete */}
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="font-bold text-xs text-[var(--text)]">Confirm before deleting</div>
                <div className="text-[11px] text-[var(--muted)]">Prompt confirmation to avoid accidental job removal</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.confirmDelete}
                  onChange={e => handleChange('confirmDelete', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--accent)]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Panel 3: Firebase Cloud Sync Configuration */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-[var(--text)]">Firebase & Cloud sync</h3>
              <p className="text-xs text-[var(--muted)]">Direct integration with your Firebase project</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[var(--surface2)] border border-[var(--border)] font-mono text-[11px] space-y-1">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Project ID:</span>
                <span className="text-[var(--text)] font-semibold">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">Auth Domain:</span>
                <span className="text-[var(--text)]">{firebaseConfig.authDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">App ID:</span>
                <span className="text-[var(--text)] truncate max-w-[200px]">{firebaseConfig.appId}</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <div>
                <div className="font-bold text-[var(--text)]">Account Status</div>
                <div className="text-[11px] text-[var(--muted)]">
                  {user ? `Signed in as ${user.email}` : 'Guest mode (Local browser storage)'}
                </div>
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-3 py-1.5 rounded-lg bg-[var(--navy)] text-white text-xs font-semibold hover:bg-[#1a3860] cursor-pointer"
                >
                  Sign in
                </button>
              )}
            </div>

            {user && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] font-bold text-xs hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Local Jobs to Firebase Cloud</span>
                </button>
                {syncStatus && (
                  <p className="text-[11px] text-emerald-600 text-center mt-1.5 font-medium">
                    {syncStatus}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Panel 4: Backup & Restore */}
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--text)]">Backup & restore</h3>
            <p className="text-xs text-[var(--muted)]">Export your complete database or restore on new devices</p>
          </div>

          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Download a portable JSON backup before switching devices or clearing browser cache. Restoring will replace your current workspace records.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={onBackupJSON}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 text-xs font-semibold cursor-pointer transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Download JSON backup</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface2)] hover:bg-[var(--surface)] text-[var(--text)] text-xs font-semibold cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>Restore backup</span>
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    onRestoreJSON(e.target.files[0]);
                    e.target.value = '';
                  }
                }}
              />
            </label>
          </div>

          {/* Data & Privacy Stats */}
          <div className="pt-2 border-t border-[var(--border)] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Jobs currently stored:</span>
              <strong className="text-[var(--text)]">{jobs.length} records</strong>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--muted)]">Export all spreadsheet data:</span>
              <button
                type="button"
                onClick={onExportCSV}
                className="text-[var(--accent)] font-semibold hover:underline cursor-pointer"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="font-bold text-xs text-rose-800 dark:text-rose-300">
              Reset Workspace Data
            </h4>
            <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">
              Permanently wipe all recorded customer jobs from this browser storage. Make sure to download a backup first.
            </p>
          </div>
          <button
            type="button"
            onClick={onClearAllJobs}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all cursor-pointer flex-shrink-0 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all job data…</span>
          </button>
        </div>
      </form>

      <div className="text-center text-[11px] text-[var(--muted)] pt-2 pb-6">
        Version 6.0 • Nexora by Lakshnexa • Powered by Firebase ({firebaseConfig.projectId})
      </div>
    </div>
  );
};
