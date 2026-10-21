import { Job, BusinessSettings, PaymentRecord, CustomerSummary } from './types';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export const JOBS_KEY = "lakshnexa-jobflow-v1";
export const SETTINGS_KEY = "lakshnexa-jobflow-settings-v1";

export const DEFAULT_SETTINGS: BusinessSettings = {
  businessName: "Nexora",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",
  theme: "light",
  currency: "INR",
  dateFormat: "local",
  confirmDelete: true
};

export const SAMPLE_JOBS: Job[] = [
  {
    id: "JOB-NX-101",
    customer: "Arun Kumar",
    phone: "+91 98765 43210",
    service: "E-Commerce Web Portal Setup",
    price: 35000,
    paid: 20000,
    status: "In Progress",
    date: new Date(Date.now() - 4 * 86400000).toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    notes: "Integrated payment gateway and product catalog. Awaiting banner designs.",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    paymentHistory: [
      { amount: 20000, date: new Date(Date.now() - 4 * 86400000).toISOString(), note: "Advance deposit" }
    ]
  },
  {
    id: "JOB-NX-102",
    customer: "Priya Sharma",
    phone: "+91 91234 56789",
    service: "Brand Identity & Logo Redesign",
    price: 15000,
    paid: 15000,
    status: "Completed",
    date: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10),
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
    notes: "Final vectors delivered in SVG, PNG, and PDF format.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    paymentHistory: [
      { amount: 7500, date: new Date(Date.now() - 10 * 86400000).toISOString(), note: "Initial 50%" },
      { amount: 7500, date: new Date(Date.now() - 2 * 86400000).toISOString(), note: "Final settlement" }
    ]
  },
  {
    id: "JOB-NX-103",
    customer: "Karthik Raja",
    phone: "+91 99887 76655",
    service: "Annual Server Maintenance",
    price: 18000,
    paid: 6000,
    status: "Pending",
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    notes: "Cloud migration and database optimization review.",
    createdAt: new Date().toISOString(),
    paymentHistory: [
      { amount: 6000, date: new Date().toISOString(), note: "First milestone payment" }
    ]
  }
];

export function formatCurrency(amount: number, currency: BusinessSettings['currency'] = 'INR'): string {
  try {
    const locale = currency === 'INR' ? 'en-IN' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2
    }).format(Number(amount) || 0);
  } catch {
    const symbols: Record<string, string> = { INR: '₹', USD: '$', GBP: '£', EUR: '€', AED: 'AED ' };
    return (symbols[currency] || '₹') + (Number(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}

export function formatDate(dateStr: string, format: BusinessSettings['dateFormat'] = 'local'): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return String(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  if (format === 'dmy') return `${day}/${month}/${year}`;
  if (format === 'mdy') return `${month}/${day}/${year}`;
  if (format === 'ymd') return `${year}-${month}-${day}`;

  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function normalizeJob(j: any, index: number = 0): Job {
  j = j && typeof j === 'object' ? j : {};
  const price = Number(j.price ?? j.totalPrice ?? j.amount ?? j.cost ?? j.total ?? 0) || 0;
  let paid = Number(j.paid ?? j.amountPaid ?? j.paymentReceived ?? j.advance ?? 0) || 0;
  paid = Math.min(paid, price || paid);

  let rawStatus = String(j.status ?? j.jobStatus ?? 'Pending').trim().toLowerCase().replace(/[_-]/g, ' ');
  let status: Job['status'] = 'Pending';
  if (['done', 'complete', 'completed', 'finished'].includes(rawStatus)) status = 'Completed';
  else if (['in progress', 'ongoing', 'started', 'working'].includes(rawStatus)) status = 'In Progress';
  else if (['cancelled', 'canceled'].includes(rawStatus)) status = 'Cancelled';

  return {
    id: String(j.id ?? j.jobId ?? `JOB-${Date.now().toString(36).toUpperCase()}-${index}`),
    customer: String(j.customer ?? j.customerName ?? j.name ?? "").trim(),
    phone: String(j.phone ?? j.mobile ?? j.contact ?? "").trim(),
    service: String(j.service ?? j.jobTitle ?? j.title ?? j.work ?? "").trim(),
    price: Math.max(0, price),
    paid: Math.max(0, paid),
    status,
    date: String(j.date ?? j.jobDate ?? j.createdAt ?? todayISO()).slice(0, 10),
    dueDate: String(j.dueDate ?? j.deadline ?? "").slice(0, 10),
    notes: String(j.notes ?? j.description ?? "").trim(),
    createdAt: j.createdAt || new Date().toISOString(),
    paymentHistory: Array.isArray(j.paymentHistory) ? j.paymentHistory : []
  };
}

export function loadLocalJobs(): Job[] {
  try {
    const raw = localStorage.getItem(JOBS_KEY);
    if (!raw) return SAMPLE_JOBS;
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : (parsed?.jobs && Array.isArray(parsed.jobs) ? parsed.jobs : []);
    if (arr.length === 0) return SAMPLE_JOBS;
    return arr.map((item: any, idx: number) => normalizeJob(item, idx));
  } catch (err) {
    console.error("Error reading jobs from local storage:", err);
    return SAMPLE_JOBS;
  }
}

export function saveLocalJobs(jobs: Job[]) {
  try {
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error("Error saving jobs to local storage:", err);
  }
}

export function loadLocalSettings(): BusinessSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveLocalSettings(settings: BusinessSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving settings to local storage:", err);
  }
}

// Download utility
export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// CSV export
export function exportJobsCSV(jobs: Job[], filename = `nexora-jobs-${todayISO()}.csv`) {
  const escapeCSV = (val: any) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const headers = ["Job ID", "Customer", "Phone", "Service", "Job Date", "Deadline", "Total Price", "Paid", "Balance Due", "Status", "Notes"];
  const rows = jobs.map(j => [
    j.id,
    j.customer,
    j.phone,
    j.service,
    j.date,
    j.dueDate,
    j.price,
    j.paid,
    Math.max(0, j.price - j.paid),
    j.status,
    j.notes
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(",")).join("\r\n");
  downloadFile(filename, csvContent, "text/csv;charset=utf-8;");
}

// Firestore cloud sync helpers
export async function syncJobsToFirestore(userId: string, jobs: Job[]): Promise<boolean> {
  if (!db) return false;
  try {
    const batch = writeBatch(db);
    const userJobsRef = collection(db, "users", userId, "jobs");
    for (const job of jobs) {
      const jobDocRef = doc(userJobsRef, job.id);
      batch.set(jobDocRef, job);
    }
    await batch.commit();
    return true;
  } catch (err) {
    console.warn("Firestore sync warning (check firestore rules or permissions):", err);
    return false;
  }
}

export async function fetchJobsFromFirestore(userId: string): Promise<Job[] | null> {
  if (!db) return null;
  try {
    const userJobsRef = collection(db, "users", userId, "jobs");
    const snapshot = await getDocs(userJobsRef);
    if (snapshot.empty) return null;
    const cloudJobs: Job[] = [];
    snapshot.forEach(docSnap => {
      cloudJobs.push(normalizeJob(docSnap.data()));
    });
    return cloudJobs;
  } catch (err) {
    console.warn("Firestore fetch error:", err);
    return null;
  }
}

export async function deleteFirestoreJob(userId: string, jobId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const jobDocRef = doc(db, "users", userId, "jobs", jobId);
    await deleteDoc(jobDocRef);
    return true;
  } catch (err) {
    console.warn("Firestore delete warning:", err);
    return false;
  }
}
