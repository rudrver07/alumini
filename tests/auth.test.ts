import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, signAdminToken, verifyAdminToken } from '@/lib/auth';
import { AdminSession } from '@/types';

describe('Admin Authentication & Cryptography', () => {
  it('hashes passwords and verifies correctly', async () => {
    const raw = 'Illuminate@IITB2026#Secure';
    const hash = hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith('$2')).toBe(true);

    const valid = await verifyPassword(raw, hash);
    expect(valid).toBe(true);

    const invalid = await verifyPassword('WrongPassword123', hash);
    expect(invalid).toBe(false);
  });

  it('signs and verifies administrative JWT session tokens', () => {
    const session: AdminSession = {
      id: 'admin_123',
      email: 'admin@ecell.in',
      username: 'superadmin',
      role: 'SUPER_ADMIN',
    };

    const token = signAdminToken(session);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = verifyAdminToken(token);
    expect(decoded).toBeDefined();
    expect(decoded?.email).toBe('admin@ecell.in');
    expect(decoded?.role).toBe('SUPER_ADMIN');

    // Invalid token check
    const badDecoded = verifyAdminToken('invalid.token.string');
    expect(badDecoded).toBeNull();
  });
});
