export type JobStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface PaymentRecord {
  id?: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Job {
  id: string;
  customer: string;
  phone: string;
  service: string;
  price: number;
  paid: number;
  status: JobStatus;
  date: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  paymentHistory?: PaymentRecord[];
}

export interface BusinessSettings {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  theme: 'light' | 'dark';
  currency: 'INR' | 'USD' | 'GBP' | 'EUR' | 'AED';
  dateFormat: 'local' | 'dmy' | 'mdy' | 'ymd';
  confirmDelete: boolean;
}

export interface CustomerSummary {
  name: string;
  phone: string;
  jobsCount: number;
  totalValue: number;
  totalPaid: number;
  balanceDue: number;
  lastJobDate: string;
}

export type NavPage = 'dashboard' | 'jobs' | 'customers' | 'payments' | 'reports' | 'settings';
