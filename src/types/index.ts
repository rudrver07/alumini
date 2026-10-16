export type RegistrationStatus = 'confirmed' | 'pending_payment' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'exempt' | 'refunded';

export interface Registration {
  id: string;
  registration_id: string;
  full_name: string;
  email: string;
  phone: string;
  aktu_roll_no: string;
  college?: string;
  department: string;
  year_of_study: string;
  city: string;
  state: string;
  expectations?: string;
  referral_code?: string;
  status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_id?: string;
  synced_to_sheets: boolean;
  sheets_synced_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationInput {
  full_name: string;
  email: string;
  phone: string;
  aktu_roll_no: string;
  college?: string;
  department: string;
  year_of_study: string;
  city: string;
  state: string;
  expectations?: string;
  referral_code?: string;
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: AdminRole;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSession {
  id: string;
  email: string;
  username: string;
  role: AdminRole;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  admin_email: string;
  action: string;
  target?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface WorkshopSessionItem {
  number: number;
  topic: string;
  duration: string;
  durationMinutes: number;
  activity: string;
  category: 'Foundation' | 'Ideation' | 'Strategy' | 'Financials' | 'Execution' | 'Pitch';
}

export interface WorkshopMetrics {
  totalStudents: string;
  totalWorkshops: string;
  statesCovered: string;
  durationHours: string;
  feePerStudent: number;
  minParticipants: number;
}
