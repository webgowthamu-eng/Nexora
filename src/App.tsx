/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { 
  Job, 
  BusinessSettings, 
  NavPage, 
  JobStatus 
} from './types';
import { 
  loadLocalJobs, 
  saveLocalJobs, 
  loadLocalSettings, 
  saveLocalSettings,
  exportJobsCSV, 
  downloadFile, 
  normalizeJob,
  todayISO,
  syncJobsToFirestore,
  fetchJobsFromFirestore,
  deleteFirestoreJob
} from './utils';

import { Topbar } from './components/Topbar';
import { Sidebar, MobileNav } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { CustomersView } from './components/CustomersView';
import { PaymentsView } from './components/PaymentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { JobModal } from './components/JobModal';
import { PaymentModal } from './components/PaymentModal';
import { PaymentHistoryModal } from './components/PaymentHistoryModal';
import { LoginPage } from './components/LoginPage';
import { InvoiceModal } from './components/InvoiceModal';
import { CustomerDetailModal } from './components/CustomerDetailModal';

export default function App() {
  const [jobs, setJobs] = useState<Job[]>(loadLocalJobs);
  const [settings, setSettings] = useState<BusinessSettings>(loadLocalSettings);
  const [currentPage, setCurrentPage] = useState<NavPage>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Authentication & Guest navigation state
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem('nexora-guest-active') === 'true';
  });
  const [showLoginPage, setShowLoginPage] = useState<boolean>(false);

  // Modals state
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [defaultCustomer, setDefaultCustomer] = useState<{ name: string; phone: string } | undefined>();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentJobTarget, setPaymentJobTarget] = useState<Job | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyJobTarget, setHistoryJobTarget] = useState<Job | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceJobTarget, setInvoiceJobTarget] = useState<Job | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<{ name: string; phone: string } | null>(null);

  // Filter state for jumping between views
  const [jobsSearchQuery, setJobsSearchQuery] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Apply Theme to DOM
  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', settings.theme === 'dark' ? '#0c1422' : '#10233f');
    }
  }, [settings.theme]);

  // Firebase Auth listener
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        showToast(`Connected to Firebase as ${currentUser.email || 'Google User'}`);
        // Fetch cloud jobs
        try {
          const cloudJobs = await fetchJobsFromFirestore(currentUser.uid);
          if (cloudJobs && cloudJobs.length > 0) {
            setJobs(cloudJobs);
            saveLocalJobs(cloudJobs);
            setIsCloudSynced(true);
          } else {
            // First time login: sync existing local jobs up to Firestore!
            await syncJobsToFirestore(currentUser.uid, jobs);
            setIsCloudSynced(true);
          }
        } catch (err) {
          console.warn("Cloud sync on login:", err);
        }
      } else {
        setIsCloudSynced(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync jobs changes to LocalStorage and Firestore
  const updateJobs = (newJobs: Job[]) => {
    setJobs(newJobs);
    saveLocalJobs(newJobs);
    if (user) {
      syncJobsToFirestore(user.uid, newJobs).then(success => {
        setIsCloudSynced(success);
      });
    }
  };

  // Job Actions
  const handleSaveJob = (job: Job) => {
    const exists = jobs.some(j => j.id === job.id);
    let updated: Job[];
    if (exists) {
      updated = jobs.map(j => (j.id === job.id ? job : j));
      showToast("Job updated successfully");
    } else {
      updated = [job, ...jobs];
      showToast("New job created");
    }
    updateJobs(updated);
  };

  const handleDeleteJob = (jobId: string) => {
    const target = jobs.find(j => j.id === jobId);
    if (!target) return;

    if (settings.confirmDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete job "${target.service}" for ${target.customer}? This cannot be undone.`
      );
      if (!confirmed) return;
    }

    const updated = jobs.filter(j => j.id !== jobId);
    updateJobs(updated);
    if (user) {
      deleteFirestoreJob(user.uid, jobId);
    }
    showToast("Job deleted");
  };

  const handleUpdateStatus = (jobId: string, newStatus: JobStatus) => {
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        return { ...j, status: newStatus };
      }
      return j;
    });
    updateJobs(updated);
    showToast(`Status updated to ${newStatus}`);
  };

  const handleRecordPayment = (jobId: string, amount: number, note?: string) => {
    const updated = jobs.map(j => {
      if (j.id === jobId) {
        const newPaid = Number((j.paid + amount).toFixed(2));
        const historyRecord = {
          amount,
          date: new Date().toISOString(),
          note: note || 'Payment received'
        };
        const newHistory = [...(j.paymentHistory || []), historyRecord];
        return {
          ...j,
          paid: newPaid,
          status: (newPaid >= j.price && j.status === 'Pending') ? ('In Progress' as JobStatus) : j.status,
          paymentHistory: newHistory
        };
      }
      return j;
    });
    updateJobs(updated);
    showToast("Payment recorded successfully");
  };

  // CSV and Backup Exports
  const handleExportCSV = () => {
    exportJobsCSV(jobs, `${(settings.businessName || 'nexora').toLowerCase()}-jobs-${todayISO()}.csv`);
    showToast("CSV export downloaded");
  };

  const handleBackupJSON = () => {
    const payload = {
      app: "Nexora",
      version: 6,
      exportedAt: new Date().toISOString(),
      firebaseProjectId: "nexora-62e8c",
      jobs,
      settings
    };
    downloadFile(
      `nexora-backup-${todayISO()}.json`,
      JSON.stringify(payload, null, 2),
      "application/json"
    );
    showToast("JSON backup downloaded");
  };

  const handleRestoreJSON = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        const rawJobs = Array.isArray(parsed) ? parsed : parsed.jobs;
        if (!Array.isArray(rawJobs)) {
          throw new Error("Invalid backup structure");
        }

        const confirmed = window.confirm(
          `Restore ${rawJobs.length} job(s)? This will replace currently stored records in this workspace.`
        );
        if (!confirmed) return;

        const normalized = rawJobs.map((item, idx) => normalizeJob(item, idx));
        updateJobs(normalized);

        if (parsed.settings && typeof parsed.settings === 'object') {
          const newSettings = { ...settings, ...parsed.settings };
          setSettings(newSettings);
          saveLocalSettings(newSettings);
        }

        showToast("Backup restored successfully");
      } catch (err) {
        alert("Could not restore backup. Please ensure the file is a valid Nexora JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllJobs = () => {
    const step1 = window.confirm(
      "Permanently delete ALL jobs from this workspace? Make sure you have downloaded a JSON backup."
    );
    if (!step1) return;
    const step2 = window.confirm("Final confirmation: This will wipe all recorded jobs immediately. Proceed?");
    if (!step2) return;

    updateJobs([]);
    showToast("All jobs cleared");
  };

  const handleSaveSettings = (newSettings: BusinessSettings) => {
    setSettings(newSettings);
    saveLocalSettings(newSettings);
    showToast("Settings saved successfully");
  };

  const handleToggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    const updated = { ...settings, theme: newTheme as 'light' | 'dark' };
    setSettings(updated);
    saveLocalSettings(updated);
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} theme enabled`);
  };

  const handleManualCloudSync = async () => {
    if (!user) {
      setShowLoginPage(true);
      return;
    }
    setIsSyncing(true);
    try {
      const ok = await syncJobsToFirestore(user.uid, jobs);
      setIsCloudSynced(ok);
      if (ok) {
        showToast("Cloud sync completed successfully");
      } else {
        showToast("Cloud sync note: verify Firestore database rules in Firebase console");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Customer view navigation helper
  const handleFilterJobsByCustomer = (customerName: string, phone: string) => {
    setJobsSearchQuery(phone || customerName);
    setCurrentPage('jobs');
  };

  const handleNewJobForCustomer = (name: string, phone: string) => {
    setJobToEdit(null);
    setDefaultCustomer({ name, phone });
    setIsJobModalOpen(true);
  };

  const handleViewInvoice = (job: Job) => {
    setInvoiceJobTarget(job);
    setIsInvoiceModalOpen(true);
  };

  const handleSelectCustomer = (name: string, phone: string) => {
    setSelectedCustomer({ name, phone });
    setIsCustomerModalOpen(true);
  };

  const handleLogout = async () => {
    if (auth) {
      try {
        await auth.signOut();
      } catch (e) {
        console.warn("Sign out error:", e);
      }
    }
    setUser(null);
    setIsGuest(false);
    sessionStorage.removeItem('nexora-guest-active');
    setShowLoginPage(true);
    showToast("Signed out. Returned to login page.");
  };

  // If not logged in and hasn't chosen guest mode, or user clicked Sign in: show LoginPage!
  if ((!user && !isGuest) || showLoginPage) {
    return (
      <LoginPage
        settings={settings}
        hasActiveSession={Boolean(user || isGuest)}
        onBackToWorkspace={() => setShowLoginPage(false)}
        onSuccess={(u) => {
          setUser(u);
          setIsGuest(false);
          setShowLoginPage(false);
          sessionStorage.removeItem('nexora-guest-active');
          showToast(`Welcome ${u.displayName || u.email || 'back'}! Connected to Firebase.`);
        }}
        onContinueAsGuest={() => {
          setIsGuest(true);
          setShowLoginPage(false);
          sessionStorage.setItem('nexora-guest-active', 'true');
          showToast("Operating in Guest mode with local browser storage");
        }}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Topbar
        settings={settings}
        user={user}
        isCloudSynced={isCloudSynced}
        onOpenLogin={() => setShowLoginPage(true)}
        onLogout={handleLogout}
        onToggleTheme={handleToggleTheme}
        onNewJob={() => {
          setJobToEdit(null);
          setDefaultCustomer(undefined);
          setIsJobModalOpen(true);
        }}
      />

      <div className="flex-1 flex max-w-[1540px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(p) => {
            if (p === 'jobs') setJobsSearchQuery('');
            setCurrentPage(p);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          jobs={jobs}
          onBackup={handleBackupJSON}
          isLoggedIn={!!user}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-7 md:p-8 pb-24 md:pb-10">
          {currentPage === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              settings={settings}
              onNavigate={(p) => {
                if (p === 'jobs') setJobsSearchQuery('');
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNewJob={() => {
                setJobToEdit(null);
                setDefaultCustomer(undefined);
                setIsJobModalOpen(true);
              }}
              onExportCSV={handleExportCSV}
              onSelectJob={(job) => {
                setJobToEdit(job);
                setIsJobModalOpen(true);
              }}
              onViewInvoice={handleViewInvoice}
            />
          )}

          {currentPage === 'jobs' && (
            <JobsView
              jobs={jobs}
              settings={settings}
              initialSearch={jobsSearchQuery}
              onNewJob={() => {
                setJobToEdit(null);
                setDefaultCustomer(undefined);
                setIsJobModalOpen(true);
              }}
              onEditJob={(job) => {
                setJobToEdit(job);
                setIsJobModalOpen(true);
              }}
              onRecordPayment={(job) => {
                setPaymentJobTarget(job);
                setIsPaymentModalOpen(true);
              }}
              onDeleteJob={handleDeleteJob}
              onUpdateStatus={handleUpdateStatus}
              onViewInvoice={handleViewInvoice}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentPage === 'customers' && (
            <CustomersView
              jobs={jobs}
              settings={settings}
              onFilterJobsByCustomer={handleFilterJobsByCustomer}
              onNewJobForCustomer={handleNewJobForCustomer}
              onSelectCustomer={handleSelectCustomer}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentPage === 'payments' && (
            <PaymentsView
              jobs={jobs}
              settings={settings}
              onRecordPayment={(job) => {
                setPaymentJobTarget(job);
                setIsPaymentModalOpen(true);
              }}
              onViewHistory={(job) => {
                setHistoryJobTarget(job);
                setIsHistoryModalOpen(true);
              }}
              onViewInvoice={handleViewInvoice}
              onExportCSV={handleExportCSV}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              jobs={jobs}
              settings={settings}
              onExportCSV={handleExportCSV}
              onBackupJSON={handleBackupJSON}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              jobs={jobs}
              user={user}
              onSaveSettings={handleSaveSettings}
              onBackupJSON={handleBackupJSON}
              onRestoreJSON={handleRestoreJSON}
              onExportCSV={handleExportCSV}
              onClearAllJobs={handleClearAllJobs}
              onOpenLogin={() => setShowLoginPage(true)}
              onLogout={handleLogout}
              onSyncToCloud={handleManualCloudSync}
              isSyncing={isSyncing}
            />
          )}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        currentPage={currentPage}
        onNavigate={(p) => {
          if (p === 'jobs') setJobsSearchQuery('');
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <JobModal
        isOpen={isJobModalOpen}
        jobToEdit={jobToEdit}
        defaultCustomer={defaultCustomer}
        settings={settings}
        onClose={() => setIsJobModalOpen(false)}
        onSave={handleSaveJob}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        job={paymentJobTarget}
        settings={settings}
        onClose={() => setIsPaymentModalOpen(false)}
        onSavePayment={handleRecordPayment}
      />

      <PaymentHistoryModal
        isOpen={isHistoryModalOpen}
        job={historyJobTarget}
        settings={settings}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        job={invoiceJobTarget}
        settings={settings}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <CustomerDetailModal
        isOpen={isCustomerModalOpen}
        customerName={selectedCustomer?.name || ''}
        customerPhone={selectedCustomer?.phone || ''}
        jobs={jobs}
        settings={settings}
        onClose={() => setIsCustomerModalOpen(false)}
        onNewJob={handleNewJobForCustomer}
        onViewInvoice={handleViewInvoice}
        onRecordPayment={(j) => {
          setPaymentJobTarget(j);
          setIsPaymentModalOpen(true);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[var(--navy)] text-white text-xs font-semibold shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[90vw] text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
