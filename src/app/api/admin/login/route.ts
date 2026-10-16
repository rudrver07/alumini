import { NextRequest, NextResponse } from 'next/server';
import { findAdminByEmail, updateAdminLoginTime, recordAuditLog } from '@/lib/db';
import { verifyPassword, setAdminSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const admin = await findAdminByEmail(email);
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid administrative credentials.' },
        { status: 401 }
      );
    }

    // Set authenticated session cookie
    await setAdminSessionCookie({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
    });

    // Update login timestamp
    await updateAdminLoginTime(admin.id);

    // Audit log
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    await recordAuditLog({
      admin_id: admin.id,
      admin_email: admin.email,
      action: 'ADMIN_LOGIN',
      target: 'AUTH',
      metadata: { role: admin.role },
      ip_address: ip,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error: unknown) {
    console.error('[Admin Login Error]:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an error.' },
      { status: 500 }
    );
  }
}
