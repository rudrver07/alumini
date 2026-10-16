import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession, hashPassword } from '@/lib/auth';
import { getAllAdmins, createAdmin, deleteAdmin, recordAuditLog } from '@/lib/db';
import { AdminRole } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN privileges required' }, { status: 403 });
    }

    const admins = await getAllAdmins();
    return NextResponse.json({ success: true, admins });
  } catch (error: unknown) {
    console.error('[Admin Users GET Error]:', error);
    return NextResponse.json({ error: 'Failed to fetch admin users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN privileges required' }, { status: 403 });
    }

    const body = await req.json();
    const { email, username, password, role = 'ADMIN' } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const validRoles: AdminRole[] = ['SUPER_ADMIN', 'ADMIN', 'VIEWER'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role assignment' }, { status: 400 });
    }

    const password_hash = hashPassword(password);
    const newAdmin = await createAdmin({
      email: email.trim().toLowerCase(),
      username: username.trim(),
      password_hash,
      role,
      is_active: true,
    });

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'CREATE_ADMIN_USER',
      target: newAdmin.email,
      metadata: { role: newAdmin.role },
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: newAdmin.id,
        email: newAdmin.email,
        username: newAdmin.username,
        role: newAdmin.role,
        created_at: newAdmin.created_at,
      },
    });
  } catch (error: unknown) {
    console.error('[Admin Users POST Error]:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden: SUPER_ADMIN privileges required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    if (id === session.id) {
      return NextResponse.json({ error: 'Cannot delete your own super admin account' }, { status: 400 });
    }

    const success = await deleteAdmin(id);
    if (!success) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    await recordAuditLog({
      admin_id: session.id,
      admin_email: session.email,
      action: 'DELETE_ADMIN_USER',
      target: id,
    });

    return NextResponse.json({ success: true, message: 'Admin account deleted successfully' });
  } catch (error: unknown) {
    console.error('[Admin Users DELETE Error]:', error);
    return NextResponse.json({ error: 'Failed to delete admin user' }, { status: 500 });
  }
}
