import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { AdminSession } from '@/types';
import { findAdminByEmail } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'illuminate_master_secret_key_minimum_32_characters_2026';
const TOKEN_NAME = 'illuminate_admin_token';

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function signAdminToken(session: AdminSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAdminToken(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminSession;
    return decoded;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;

  const session = verifyAdminToken(token);
  if (!session) return null;

  // Verify that the admin account is still valid and active in the database
  const admin = await findAdminByEmail(session.email);
  if (!admin || !admin.is_active) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role,
  };
}

export async function setAdminSessionCookie(session: AdminSession): Promise<void> {
  const token = signAdminToken(session);
  const cookieStore = await cookies();
  cookieStore.set({
    name: TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}
