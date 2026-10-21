import React from 'react';
import { 
  Building2, 
  Calendar, 
  Sun, 
  Moon, 
  Plus, 
  UserCheck, 
  LogOut, 
  LogIn, 
  Cloud, 
  CloudOff,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import { BusinessSettings } from '../types';

interface TopbarProps {
  settings: BusinessSettings;
  user: User | null;
  isCloudSynced: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onToggleTheme: () => void;
  onNewJob: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  settings,
  user,
  isCloudSynced,
  onOpenLogin,
  onLogout,
  onToggleTheme,
  onNewJob
}) => {
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-20 h-18 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur-md px-4 sm:px-7 flex items-center justify-between transition-colors">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10233f] to-[#17506c] shadow-md flex items-center justify-center text-[var(--accent)] font-black text-xl select-none">
          L
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text)] leading-tight">
              {settings.businessName || "Nexora"}
            </h1>
            <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--accent2)] text-[var(--accent)]">
              PRO
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] hidden sm:block">
            Small Business Workspace
          </p>
        </div>
      </div>

      {/* Top Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Today date */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface2)] text-xs font-medium text-[var(--muted)]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
        </div>

        {/* Auth / Cloud Sync Status Pill */}
        {user ? (
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface2)] text-xs text-[var(--text)] max-w-[170px] sm:max-w-[220px] truncate"
              title={`Connected to Firebase: ${user.email || 'User'}`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <Cloud className="w-3.5 h-3.5 text-[var(--accent)] flex-shrink-0" />
              <span className="truncate font-medium text-[11px] sm:text-xs">
                {user.displayName || user.email || 'Connected'}
              </span>
            </div>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-[var(--text)] hover:text-rose-600 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
              title="Sign out to return to login"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface2)] text-xs text-[var(--muted)]"
              title="Working in local guest mode"
            >
              <CloudOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="font-medium text-[11px] sm:text-xs">Guest mode</span>
            </div>
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] hover:border-[var(--accent)] text-xs font-bold text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Go to Login Page"
            >
              <LogIn className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span>Sign in</span>
            </button>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] flex items-center justify-center transition-all cursor-pointer"
          title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {settings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* New Job CTA */}
        <button
          onClick={onNewJob}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--navy)] text-white hover:bg-[#1a3860] active:scale-95 transition-all text-xs sm:text-sm font-semibold shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 text-[var(--accent)]" />
          <span className="hidden sm:inline">New Job</span>
          <span className="sm:hidden">Job</span>
        </button>
      </div>
    </header>
  );
};
