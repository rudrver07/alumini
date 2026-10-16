import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { supabase, isSupabaseConfigured } from './supabase';
import { Registration, RegistrationInput, AdminUser, AuditLog, RegistrationStatus } from '@/types';

// Path for local storage fallback
const DATA_DIR = path.join(process.cwd(), '.data');

function getDbFile(): string {
  if (process.env.DB_FILE) {
    return process.env.DB_FILE;
  }
  if (process.env.NODE_ENV === 'test') {
    return path.join(DATA_DIR, 'db.test.json');
  }
  return path.join(DATA_DIR, 'db.json');
}

interface LocalDbSchema {
  registrations: Registration[];
  admins: AdminUser[];
  auditLogs: AuditLog[];
}

function ensureLocalDb(): LocalDbSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const dbFile = getDbFile();
  if (!fs.existsSync(dbFile)) {
    // Generate default initial super admin
    const defaultEmail = (process.env.ADMIN_INITIAL_EMAIL || 'admin@ecell.in').toLowerCase();
    const defaultPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Illuminate@IITB2026#Secure';
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(defaultPassword, salt);

    const initialDb: LocalDbSchema = {
      registrations: [],
      admins: [
        {
          id: crypto.randomUUID(),
          email: defaultEmail,
          username: 'superadmin',
          password_hash,
          role: 'SUPER_ADMIN',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      auditLogs: [
        {
          id: crypto.randomUUID(),
          admin_email: 'system',
          action: 'INITIALIZE_DATABASE',
          target: 'SYSTEM',
          metadata: { note: 'Initial local store seeded' },
          created_at: new Date().toISOString(),
        },
      ],
    };

    fs.writeFileSync(dbFile, JSON.stringify(initialDb, null, 2), 'utf-8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(dbFile, 'utf-8');
    return JSON.parse(raw) as LocalDbSchema;
  } catch {
    return { registrations: [], admins: [], auditLogs: [] };
  }
}

function writeLocalDb(data: LocalDbSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const dbFile = getDbFile();
  fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper to generate unique registration code
export function generateRegistrationId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ILLUM-2026-${code}`;
}

// ----------------------------------------------------------------------------
// REGISTRATIONS
// ----------------------------------------------------------------------------

export async function findRegistrationByEmailOrPhone(email: string, phone: string): Promise<Registration | null> {
  const normEmail = email.trim().toLowerCase();
  const normPhone = phone.trim().replace(/\s+/g, '');

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .or(`email.ilike.${normEmail},phone.eq.${normPhone}`)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[Supabase] Duplicate check error:', error);
    } else if (data) {
      return data as Registration;
    }
  }

  // Check local store
  const localDb = ensureLocalDb();
  const found = localDb.registrations.find(
    (r) =>
      r.email.trim().toLowerCase() === normEmail ||
      r.phone.trim().replace(/\s+/g, '') === normPhone
  );

  return found || null;
}

export async function createRegistration(
  input: RegistrationInput,
  meta?: { ip?: string; userAgent?: string }
): Promise<{ success: boolean; registration?: Registration; error?: string; duplicateField?: 'email' | 'phone' }> {
  const normEmail = input.email.trim().toLowerCase();
  const normPhone = input.phone.trim();

  // Duplicate verification
  const existing = await findRegistrationByEmailOrPhone(normEmail, normPhone);
  if (existing) {
    const isEmail = existing.email.trim().toLowerCase() === normEmail;
    return {
      success: false,
      error: isEmail
        ? 'A registration with this email address already exists.'
        : 'A registration with this phone number already exists.',
      duplicateField: isEmail ? 'email' : 'phone',
    };
  }

  const now = new Date().toISOString();
  const registration: Registration = {
    id: crypto.randomUUID(),
    registration_id: generateRegistrationId(),
    full_name: input.full_name.trim(),
    email: normEmail,
    phone: normPhone,
    aktu_roll_no: (input.aktu_roll_no || input.college || '').trim(),
    college: (input.college || input.aktu_roll_no || '').trim(),
    department: input.department.trim(),
    year_of_study: input.year_of_study.trim(),
    city: input.city.trim(),
    state: input.state.trim(),
    expectations: input.expectations?.trim() || '',
    referral_code: input.referral_code?.trim() || '',
    status: 'confirmed',
    payment_status: 'unpaid',
    synced_to_sheets: false,
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('registrations')
      .insert({
        ...registration,
        ip_address: meta?.ip,
        user_agent: meta?.userAgent,
      })
      .select()
      .single();

    if (error) {
      console.error('[Supabase] Insert error:', error);

      // Handle Postgres unique constraint violation (code 23505)
      const isUniqueViolation =
        error.code === '23505' ||
        error.message?.toLowerCase().includes('duplicate key') ||
        error.message?.toLowerCase().includes('unique');

      if (isUniqueViolation) {
        const isEmail =
          error.message?.toLowerCase().includes('email') ||
          (error.details && error.details.toLowerCase().includes('email'));

        return {
          success: false,
          error: isEmail
            ? 'A registration with this email address already exists.'
            : 'A registration with this phone number already exists.',
          duplicateField: isEmail ? 'email' : 'phone',
        };
      }

      // Fallback save locally ONLY if Supabase experienced table/infrastructure unavailability
      const localDb = ensureLocalDb();
      const isDup = localDb.registrations.some(
        (r) =>
          r.email.trim().toLowerCase() === normEmail ||
          r.phone.trim().replace(/\s+/g, '') === normPhone.replace(/\s+/g, '')
      );
      if (isDup) {
        return {
          success: false,
          error: 'A registration with this email address or phone number already exists.',
        };
      }

      localDb.registrations.unshift(registration);
      writeLocalDb(localDb);
      return { success: true, registration };
    }

    return { success: true, registration: data as Registration };
  }

  // Local storage save with race-condition guard
  const localDb = ensureLocalDb();
  const isDup = localDb.registrations.some(
    (r) =>
      r.email.trim().toLowerCase() === normEmail ||
      r.phone.trim().replace(/\s+/g, '') === normPhone.replace(/\s+/g, '')
  );
  if (isDup) {
    return {
      success: false,
      error: 'A registration with this email address or phone number already exists.',
    };
  }

  localDb.registrations.unshift(registration);
  writeLocalDb(localDb);

  return { success: true, registration };
}

export async function getRegistrations(options: {
  search?: string;
  status?: string;
  college?: string;
  limit?: number;
  offset?: number;
} = {}): Promise<{ registrations: Registration[]; total: number }> {
  const { search, status, college, limit = 50, offset = 0 } = options;

  if (isSupabaseConfigured && supabase) {
    let query = supabase.from('registrations').select('*', { count: 'exact' });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (college && college !== 'all') {
      query = query.ilike('college', `%${college}%`);
    }
    if (search) {
      const term = `%${search}%`;
      query = query.or(
        `full_name.ilike.${term},email.ilike.${term},phone.ilike.${term},college.ilike.${term},registration_id.ilike.${term}`
      );
    }

    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (!error && data) {
      return { registrations: data as Registration[], total: count || data.length };
    }
  }

  // Local store query
  const localDb = ensureLocalDb();
  let list = [...localDb.registrations];

  if (status && status !== 'all') {
    list = list.filter((r) => r.status === status);
  }
  if (college && college !== 'all') {
    list = list.filter((r) => (r.college || r.aktu_roll_no || '').toLowerCase().includes(college.toLowerCase()));
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter(
      (r) =>
        r.full_name.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s) ||
        r.phone.toLowerCase().includes(s) ||
        (r.aktu_roll_no && r.aktu_roll_no.toLowerCase().includes(s)) ||
        (r.college && r.college.toLowerCase().includes(s)) ||
        r.registration_id.toLowerCase().includes(s)
    );
  }

  const total = list.length;
  const paged = list.slice(offset, offset + limit);

  return { registrations: paged, total };
}

export async function getAllRegistrationsForExport(): Promise<Registration[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Registration[];
    }
  }

  const localDb = ensureLocalDb();
  return [...localDb.registrations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<boolean> {
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('registrations')
      .update({ status, updated_at: now })
      .eq('id', id);

    if (!error) return true;
  }

  const localDb = ensureLocalDb();
  const idx = localDb.registrations.findIndex((r) => r.id === id);
  if (idx !== -1) {
    localDb.registrations[idx].status = status;
    localDb.registrations[idx].updated_at = now;
    writeLocalDb(localDb);
    return true;
  }

  return false;
}

export async function deleteRegistration(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (!error) return true;
  }

  const localDb = ensureLocalDb();
  const initialLen = localDb.registrations.length;
  localDb.registrations = localDb.registrations.filter((r) => r.id !== id);
  if (localDb.registrations.length !== initialLen) {
    writeLocalDb(localDb);
    return true;
  }

  return false;
}

export async function markRegistrationsAsSynced(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    await supabase
      .from('registrations')
      .update({ synced_to_sheets: true, sheets_synced_at: now })
      .in('id', ids);
  }

  const localDb = ensureLocalDb();
  localDb.registrations.forEach((r) => {
    if (ids.includes(r.id)) {
      r.synced_to_sheets = true;
      r.sheets_synced_at = now;
    }
  });
  writeLocalDb(localDb);
}

export async function getRegistrationStats() {
  const all = await getAllRegistrationsForExport();
  const today = new Date().toISOString().split('T')[0];

  const todayCount = all.filter((r) => r.created_at.startsWith(today)).length;
  const confirmedCount = all.filter((r) => r.status === 'confirmed').length;
  const pendingCount = all.filter((r) => r.status === 'pending_payment').length;

  const rollNos = new Set(all.map((r) => (r.aktu_roll_no || r.college || '').trim().toLowerCase())).size;
  const states = new Set(all.map((r) => r.state.trim().toLowerCase())).size;

  return {
    total: all.length,
    today: todayCount,
    confirmed: confirmedCount,
    pending: pendingCount,
    colleges: rollNos,
    states,
  };
}

// ----------------------------------------------------------------------------
// ADMIN MANAGEMENT & SUPER_ADMIN
// ----------------------------------------------------------------------------

export async function findAdminByEmail(email: string): Promise<AdminUser | null> {
  const normEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', normEmail)
      .maybeSingle();

    if (!error && data) {
      return data as AdminUser;
    }
  }

  const localDb = ensureLocalDb();
  const found = localDb.admins.find((a) => a.email.toLowerCase() === normEmail && a.is_active);
  return found || null;
}

export async function updateAdminLoginTime(id: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured && supabase) {
    await supabase.from('admins').update({ last_login_at: now }).eq('id', id);
  }
  const localDb = ensureLocalDb();
  const admin = localDb.admins.find((a) => a.id === id);
  if (admin) {
    admin.last_login_at = now;
    writeLocalDb(localDb);
  }
}

export async function createAdmin(adminData: Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>): Promise<AdminUser> {
  const now = new Date().toISOString();
  const newAdmin: AdminUser = {
    id: crypto.randomUUID(),
    ...adminData,
    email: adminData.email.toLowerCase().trim(),
    created_at: now,
    updated_at: now,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('admins').insert(newAdmin).select().single();
    if (!error && data) {
      return data as AdminUser;
    }
  }

  const localDb = ensureLocalDb();
  // Remove if exists
  localDb.admins = localDb.admins.filter((a) => a.email !== newAdmin.email);
  localDb.admins.push(newAdmin);
  writeLocalDb(localDb);

  return newAdmin;
}

export async function updateAdminPassword(email: string, passwordHash: string): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  const now = new Date().toISOString();

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('admins')
      .update({ password_hash: passwordHash, updated_at: now })
      .eq('email', normEmail);

    if (!error) return true;
  }

  const localDb = ensureLocalDb();
  const admin = localDb.admins.find((a) => a.email.toLowerCase() === normEmail);
  if (admin) {
    admin.password_hash = passwordHash;
    admin.updated_at = now;
    writeLocalDb(localDb);
    return true;
  }

  return false;
}

export async function getAllAdmins(): Promise<Omit<AdminUser, 'password_hash'>[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('id, email, username, role, is_active, last_login_at, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Omit<AdminUser, 'password_hash'>[];
    }
  }

  const localDb = ensureLocalDb();
  return localDb.admins.map((admin) => {
    const copy = { ...admin };
    delete (copy as { password_hash?: string }).password_hash;
    return copy;
  });
}

export async function deleteAdmin(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (!error) return true;
  }

  const localDb = ensureLocalDb();
  const initial = localDb.admins.length;
  localDb.admins = localDb.admins.filter((a) => a.id !== id);
  if (localDb.admins.length !== initial) {
    writeLocalDb(localDb);
    return true;
  }

  return false;
}

// ----------------------------------------------------------------------------
// AUDIT LOGGING
// ----------------------------------------------------------------------------

export async function recordAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const entry: AuditLog = {
    id: crypto.randomUUID(),
    ...log,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    await supabase.from('audit_logs').insert(entry);
  }

  const localDb = ensureLocalDb();
  localDb.auditLogs.unshift(entry);
  if (localDb.auditLogs.length > 500) {
    localDb.auditLogs = localDb.auditLogs.slice(0, 500);
  }
  writeLocalDb(localDb);
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      return data as AuditLog[];
    }
  }

  const localDb = ensureLocalDb();
  return localDb.auditLogs.slice(0, limit);
}
