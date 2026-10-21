import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  Download,
  Database,
  CloudCheck
} from 'lucide-react';
import { NavPage, Job } from '../types';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  jobs: Job[];
  onBackup: () => void;
  isLoggedIn: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  jobs,
  onBackup,
  isLoggedIn
}) => {
  const activeJobsCount = jobs.filter(j => j.status !== 'Cancelled').length;
  const pendingCount = jobs.filter(j => j.status === 'Pending' || j.status === 'In Progress').length;
  const unpaidCount = jobs.filter(j => j.status !== 'Cancelled' && (j.price - j.paid) > 0).length;

  const uniqueCustomersCount = new Set(
    jobs.map(j => (j.phone || j.customer).trim().toLowerCase()).filter(Boolean)
  ).size;

  const navItems = [
    {
      id: 'dashboard' as NavPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'jobs' as NavPage,
      label: 'All jobs',
      icon: FileText,
      badge: pendingCount > 0 ? `${pendingCount}` : null,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
    },
    {
      id: 'customers' as NavPage,
      label: 'Customers',
      icon: Users,
      badge: uniqueCustomersCount > 0 ? `${uniqueCustomersCount}` : null,
      badgeColor: 'bg-[var(--accent2)] text-[var(--navy)] dark:bg-sky-950/60 dark:text-sky-300'
    },
    {
      id: 'payments' as NavPage,
      label: 'Payments',
      icon: CreditCard,
      badge: unpaidCount > 0 ? `${unpaidCount} due` : null,
      badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
    },
    {
      id: 'reports' as NavPage,
      label: 'Reports',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside className="w-60 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-72px)]">
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)] px-3 mb-2">
          Workspace
        </div>

        <nav className="space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] font-semibold shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--muted)] px-3 mt-6 mb-2">
          Preferences
        </div>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all cursor-pointer ${
            currentPage === 'settings'
              ? 'bg-[var(--accent2)] text-[var(--navy)] dark:text-[var(--accent)] font-semibold'
              : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface2)]'
          }`}
        >
          <Settings className={`w-4 h-4 ${currentPage === 'settings' ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} />
          <span>App settings</span>
        </button>

        {/* Data safety card */}
        <div className="mt-8 p-3.5 rounded-2xl bg-[var(--surface2)] border border-[var(--border)] text-xs text-[var(--muted)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--text)] mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Keep your data safe</span>
          </div>
          <p className="text-[11px] leading-relaxed mb-3">
            {isLoggedIn 
              ? "Signed in with Firebase. Cloud syncing enabled with project nexora-62e8c."
              : "Working in local mode. Download a JSON backup regularly to keep your records safe."
            }
          </p>
          <button
            onClick={onBackup}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--text)] text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Download JSON backup</span>
          </button>
        </div>
      </div>

      {/* Footer Firebase info */}
      <div className="pt-4 border-t border-[var(--border)] text-[11px] text-[var(--muted)]">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-[10px] uppercase tracking-wider">Firebase</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            nexora-62e8c
          </span>
        </div>
        <div className="text-[10px] text-[var(--muted)] opacity-80">
          Nexora v6.0 • Lakshnexa
        </div>
      </div>
    </aside>
  );
};

export const MobileNav: React.FC<{
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}> = ({ currentPage, onNavigate }) => {
  const items = [
    { id: 'dashboard' as NavPage, label: 'Home', icon: LayoutDashboard },
    { id: 'jobs' as NavPage, label: 'Jobs', icon: FileText },
    { id: 'customers' as NavPage, label: 'Customers', icon: Users },
    { id: 'payments' as NavPage, label: 'Payments', icon: CreditCard },
    { id: 'settings' as NavPage, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] flex items-center justify-around py-2 px-1 safe-bottom">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-medium transition-colors ${
              isActive ? 'text-[var(--accent)] font-bold' : 'text-[var(--muted)]'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
